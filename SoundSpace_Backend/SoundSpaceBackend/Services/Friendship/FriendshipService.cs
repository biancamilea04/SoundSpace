using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using SoundSpaceBackend.Hubs;
using SoundSpaceBackend.Models.Enums;
using UserEntity = SoundSpaceBackend.Models.Entities.User;
using SoundSpaceBackend.Persistence;
using SoundSpaceBackend.Services.Friendship.Abstractions;
using SoundSpaceBackend.Services.Friendship.DTOs;

namespace SoundSpaceBackend.Services.Friendship;

public class FriendshipService(
    ApplicationContext dbContext,
    IHubContext<ChatHub> hubContext,
    ILogger<FriendshipService> logger) : IFriendshipService
{
    public async Task<GetFriendshipDto> SendRequestAsync(Guid senderId, Guid receiverId)
    {
        logger.LogInformation("[Friendship] SenderId={SenderId} sending request to ReceiverId={ReceiverId}", senderId, receiverId);

        if (senderId == receiverId)
            throw new InvalidOperationException("Cannot send a friend request to yourself.");

        var exists = await dbContext.Friendships.AnyAsync(f =>
            (f.SenderId == senderId && f.ReceiverId == receiverId) ||
            (f.SenderId == receiverId && f.ReceiverId == senderId));

        if (exists)
            throw new InvalidOperationException("A friendship or request already exists between these users.");

        var sender = await dbContext.Users.FindAsync(senderId)
            ?? throw new KeyNotFoundException($"User {senderId} not found.");

        var receiver = await dbContext.Users.FindAsync(receiverId)
            ?? throw new KeyNotFoundException($"User {receiverId} not found.");

        var friendship = new Models.Entities.Friendship
        {
            SenderId = senderId,
            ReceiverId = receiverId,
            Status = FriendshipStatus.Pending
        };

        dbContext.Friendships.Add(friendship);
        await dbContext.SaveChangesAsync();

        var dto = MapToDto(friendship, sender, receiver);

        await hubContext.Clients
            .Group($"user-{receiverId}")
            .SendAsync("FriendRequestReceived", dto);

        return dto;
    }

    public async Task<GetFriendshipDto?> GetStatusAsync(Guid userId, Guid targetId)
    {
        var friendship = await dbContext.Friendships
            .Include(f => f.Sender)
            .Include(f => f.Receiver)
            .FirstOrDefaultAsync(f =>
                (f.SenderId == userId && f.ReceiverId == targetId) ||
                (f.SenderId == targetId && f.ReceiverId == userId));

        return friendship is null ? null : MapToDto(friendship, friendship.Sender, friendship.Receiver);
    }

    public async Task<List<GetFriendshipDto>> GetIncomingRequestsAsync(Guid userId)
    {
        return await dbContext.Friendships
            .Include(f => f.Sender)
            .Include(f => f.Receiver)
            .Where(f => f.ReceiverId == userId && f.Status == FriendshipStatus.Pending)
            .OrderByDescending(f => f.CreatedAt)
            .Select(f => MapToDto(f, f.Sender, f.Receiver))
            .ToListAsync();
    }

    public async Task<List<GetFriendshipDto>> GetRequestHistoryAsync(Guid userId)
    {
        return await dbContext.Friendships
            .Include(f => f.Sender)
            .Include(f => f.Receiver)
            .Where(f =>
                (f.SenderId == userId || f.ReceiverId == userId) &&
                f.Status != FriendshipStatus.Pending)
            .OrderByDescending(f => f.UpdatedAt ?? f.CreatedAt)
            .Select(f => MapToDto(f, f.Sender, f.Receiver))
            .ToListAsync();
    }

    public async Task<GetFriendshipDto> AcceptAsync(Guid requestId, Guid currentUserId)
    {
        logger.LogInformation("[Friendship] UserId={UserId} accepting RequestId={RequestId}", currentUserId, requestId);

        var friendship = await dbContext.Friendships
            .Include(f => f.Sender)
            .Include(f => f.Receiver)
            .FirstOrDefaultAsync(f => f.Id == requestId)
            ?? throw new KeyNotFoundException($"Friend request {requestId} not found.");

        if (friendship.ReceiverId != currentUserId)
            throw new UnauthorizedAccessException("Only the receiver can accept a friend request.");

        if (friendship.Status != FriendshipStatus.Pending)
            throw new InvalidOperationException("Only pending requests can be accepted.");

        friendship.Status = FriendshipStatus.Accepted;
        friendship.UpdatedAt = DateTime.UtcNow;

        await dbContext.SaveChangesAsync();

        var dto = MapToDto(friendship, friendship.Sender, friendship.Receiver);

        await hubContext.Clients
            .Group($"user-{friendship.SenderId}")
            .SendAsync("FriendRequestAccepted", dto);

        return dto;
    }

    public async Task<GetFriendshipDto> RejectAsync(Guid requestId, Guid currentUserId)
    {
        logger.LogInformation("[Friendship] UserId={UserId} rejecting RequestId={RequestId}", currentUserId, requestId);

        var friendship = await dbContext.Friendships
            .Include(f => f.Sender)
            .Include(f => f.Receiver)
            .FirstOrDefaultAsync(f => f.Id == requestId)
            ?? throw new KeyNotFoundException($"Friend request {requestId} not found.");

        if (friendship.ReceiverId != currentUserId)
            throw new UnauthorizedAccessException("Only the receiver can reject a friend request.");

        if (friendship.Status != FriendshipStatus.Pending)
            throw new InvalidOperationException("Only pending requests can be rejected.");

        friendship.Status = FriendshipStatus.Rejected;
        friendship.UpdatedAt = DateTime.UtcNow;

        await dbContext.SaveChangesAsync();

        return MapToDto(friendship, friendship.Sender, friendship.Receiver);
    }

    public async Task<List<FriendActivityDto>> GetFriendsActivityAsync(Guid userId, IReadOnlyList<Guid> onlineUserIds)
    {
        var friendships = await dbContext.Friendships
            .Where(f =>
                (f.SenderId == userId || f.ReceiverId == userId) &&
                f.Status == FriendshipStatus.Accepted)
            .Include(f => f.Sender)
            .Include(f => f.Receiver)
            .ToListAsync();

        return friendships
            .Select(f =>
            {
                var friend = f.SenderId == userId ? f.Receiver : f.Sender;
                var isOnline = onlineUserIds.Contains(friend.Id);
                return new FriendActivityDto(
                    friend.Id, friend.DisplayName, friend.ProfileImageUrl,
                    isOnline, friend.IsListening,
                    friend.CurrentlyPlayingTitle, friend.CurrentlyPlayingArtist, friend.CurrentlyPlayingArtistUrl,
                    friend.CurrentlyPlayingCoverUrl, friend.CurrentlyPlayingUri, friend.CurrentlyPlayingProgressMs,
                    friend.LastPlayedTitle, friend.LastPlayedArtist, friend.LastPlayedArtistUrl, friend.LastPlayedUri,
                    friend.LastPlayedCoverUrl,
                    friend.MusicStatusUpdatedAt, friend.LastSeen);
            })
            .OrderByDescending(f => f.IsOnline && f.IsListening)
            .ThenByDescending(f => f.IsOnline)
            .ThenByDescending(f => f.LastSeen)
            .ToList();
    }

    private static GetFriendshipDto MapToDto(Models.Entities.Friendship f, UserEntity sender, UserEntity receiver) =>
        new(f.Id, f.SenderId, sender.DisplayName, sender.ProfileImageUrl,
            f.ReceiverId, receiver.DisplayName, receiver.ProfileImageUrl,
            f.Status, f.CreatedAt, f.UpdatedAt);
}
