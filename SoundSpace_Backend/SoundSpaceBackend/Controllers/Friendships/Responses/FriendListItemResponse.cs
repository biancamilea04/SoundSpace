namespace SoundSpaceBackend.Controllers.Friendships.Responses;

public record FriendListItemResponse(
    Guid UserId,
    string DisplayName,
    string? ProfileImageUrl);
