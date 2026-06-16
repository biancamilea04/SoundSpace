using SoundSpaceBackend.Services.Friendship.DTOs;

namespace SoundSpaceBackend.Services.Friendship.Abstractions;

public interface IFriendshipService
{
    Task<GetFriendshipDto> SendRequestAsync(Guid senderId, Guid receiverId);
    Task<GetFriendshipDto?> GetStatusAsync(Guid userId, Guid targetId);
    Task<List<GetFriendshipDto>> GetIncomingRequestsAsync(Guid userId);
    Task<List<GetFriendshipDto>> GetRequestHistoryAsync(Guid userId);
    Task<GetFriendshipDto> AcceptAsync(Guid requestId, Guid currentUserId);
    Task<GetFriendshipDto> RejectAsync(Guid requestId, Guid currentUserId);
    Task<List<FriendActivityDto>> GetFriendsActivityAsync(Guid userId, IReadOnlyList<Guid> onlineUserIds);
    Task<List<FriendListItemDto>> GetFriendsListAsync(Guid profileUserId);
    Task RemoveFriendAsync(Guid currentUserId, Guid targetUserId);
}
