namespace SoundSpaceBackend.Services.Friendship.DTOs;

public record FriendListItemDto(
    Guid UserId,
    string DisplayName,
    string? ProfileImageUrl);
