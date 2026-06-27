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
            throw new InvalidOperationException("Cannot send a friend request to yourself");

        var existing = await dbContext.Friendships.FirstOrDefaultAsync(f =>
            (f.SenderId == senderId && f.ReceiverId == receiverId) ||
            (f.SenderId == receiverId && f.ReceiverId == senderId));

        if (existing is not null)
        {
            if (existing.Status != FriendshipStatus.Removed)
                throw new InvalidOperationException("A friendship or request already exists between these users");

            // Reuse the removed row to satisfy the unique constraint on (SenderId, ReceiverId)
            existing.SenderId = senderId;
            existing.ReceiverId = receiverId;
            existing.Status = FriendshipStatus.Pending;
            existing.UpdatedAt = DateTime.UtcNow;
            await dbContext.SaveChangesAsync();
        }
        else
        {
            existing = new Models.Entities.Friendship
            {
                SenderId = senderId,
                ReceiverId = receiverId,
                Status = FriendshipStatus.Pending
            };
            dbContext.Friendships.Add(existing);
            await dbContext.SaveChangesAsync();
        }

        var sender = await dbContext.Users.FindAsync(senderId)
            ?? throw new KeyNotFoundException($"User {senderId} not found");
        var receiver = await dbContext.Users.FindAsync(receiverId)
            ?? throw new KeyNotFoundException($"User {receiverId} not found");

        var dto = MapToDto(existing, sender, receiver);

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
                ((f.SenderId == userId && f.ReceiverId == targetId) ||
                 (f.SenderId == targetId && f.ReceiverId == userId)) &&
                f.Status != FriendshipStatus.Removed);

        return friendship is null ? null : MapToDto(friendship, friendship.Sender, friendship.Receiver);
    }

    public async Task<List<GetFriendshipDto>> GetIncomingRequestsAsync(Guid userId)
    {
        var friendships = await dbContext.Friendships
            .Include(f => f.Sender)
            .Include(f => f.Receiver)
            .Where(f => f.ReceiverId == userId && f.Status == FriendshipStatus.Pending)
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync();

        return friendships.Select(f => MapToDto(f, f.Sender, f.Receiver)).ToList();
    }

    public async Task<List<GetFriendshipDto>> GetRequestHistoryAsync(Guid userId)
    {
        var friendships = await dbContext.Friendships
            .Include(f => f.Sender)
            .Include(f => f.Receiver)
            .Where(f =>
                (f.SenderId == userId || f.ReceiverId == userId) &&
                f.Status != FriendshipStatus.Pending)
            .OrderByDescending(f => f.UpdatedAt ?? f.CreatedAt)
            .ToListAsync();

        return friendships.Select(f => MapToDto(f, f.Sender, f.Receiver)).ToList();
    }

    public async Task<GetFriendshipDto> AcceptAsync(Guid requestId, Guid currentUserId)
    {
        logger.LogInformation("[Friendship] UserId={UserId} accepting RequestId={RequestId}", currentUserId, requestId);

        var friendship = await dbContext.Friendships
            .Include(f => f.Sender)
            .Include(f => f.Receiver)
            .FirstOrDefaultAsync(f => f.Id == requestId)
            ?? throw new KeyNotFoundException($"Friend request {requestId} not found");

        if (friendship.ReceiverId != currentUserId)
            throw new UnauthorizedAccessException("Only the receiver can accept a friend request");

        if (friendship.Status != FriendshipStatus.Pending)
            throw new InvalidOperationException("Only pending requests can be accepted");

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
            ?? throw new KeyNotFoundException($"Friend request {requestId} not found");

        if (friendship.ReceiverId != currentUserId)
            throw new UnauthorizedAccessException("Only the receiver can reject a friend request");

        if (friendship.Status != FriendshipStatus.Pending)
            throw new InvalidOperationException("Only pending requests can be rejected");

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
            .Include(f => f.Sender).ThenInclude(u => u.CurrentlyPlaying)
            .Include(f => f.Sender).ThenInclude(u => u.LastPlayed)
            .Include(f => f.Receiver).ThenInclude(u => u.CurrentlyPlaying)
            .Include(f => f.Receiver).ThenInclude(u => u.LastPlayed)
            .ToListAsync();

        return friendships
            .Select(f =>
            {
                var friend = f.SenderId == userId ? f.Receiver : f.Sender;
                var isOnline = onlineUserIds.Contains(friend.Id);
                return new FriendActivityDto(
                    friend.Id, friend.DisplayName, friend.ProfileImageUrl,
                    isOnline, friend.CurrentlyPlaying?.IsListening ?? false,
                    friend.CurrentlyPlaying?.Title, friend.CurrentlyPlaying?.Artist, friend.CurrentlyPlaying?.ArtistUrl,
                    friend.CurrentlyPlaying?.CoverUrl, friend.CurrentlyPlaying?.Uri, friend.CurrentlyPlaying?.ProgressMs ?? 0,
                    friend.LastPlayed?.Title, friend.LastPlayed?.Artist, friend.LastPlayed?.ArtistUrl, friend.LastPlayed?.Uri,
                    friend.LastPlayed?.CoverUrl,
                    friend.CurrentlyPlaying?.UpdatedAt, friend.LastSeen);
            })
            .OrderByDescending(f => f.IsOnline && f.IsListening)
            .ThenByDescending(f => f.IsOnline)
            .ThenByDescending(f => f.LastSeen)
            .ToList();
    }

    public async Task<List<FriendListItemDto>> GetFriendsListAsync(Guid profileUserId)
    {
        var friendships = await dbContext.Friendships
            .Where(f =>
                (f.SenderId == profileUserId || f.ReceiverId == profileUserId) &&
                f.Status == FriendshipStatus.Accepted)
            .Include(f => f.Sender)
            .Include(f => f.Receiver)
            .ToListAsync();

        return friendships
            .Select(f =>
            {
                var friend = f.SenderId == profileUserId ? f.Receiver : f.Sender;
                return new FriendListItemDto(friend.Id, friend.DisplayName, friend.ProfileImageUrl);
            })
            .OrderBy(f => f.DisplayName)
            .ToList();
    }

    public async Task RemoveFriendAsync(Guid currentUserId, Guid targetUserId)
    {
        logger.LogInformation("[Friendship] UserId={CurrentUserId} removing friend UserId={TargetUserId}", currentUserId, targetUserId);

        var friendship = await dbContext.Friendships
            .FirstOrDefaultAsync(f =>
                ((f.SenderId == currentUserId && f.ReceiverId == targetUserId) ||
                 (f.SenderId == targetUserId && f.ReceiverId == currentUserId)) &&
                f.Status == FriendshipStatus.Accepted)
            ?? throw new KeyNotFoundException("Accepted friendship not found");

        friendship.Status = FriendshipStatus.Removed;
        friendship.UpdatedAt = DateTime.UtcNow;

        await dbContext.SaveChangesAsync();
    }

    private static GetFriendshipDto MapToDto(Models.Entities.Friendship f, UserEntity sender, UserEntity receiver) =>
        new(f.Id, f.SenderId, sender.DisplayName, sender.ProfileImageUrl,
            f.ReceiverId, receiver.DisplayName, receiver.ProfileImageUrl,
            f.Status, f.CreatedAt, f.UpdatedAt);
}
