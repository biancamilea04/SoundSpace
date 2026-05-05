namespace SoundSpaceBackend.Controllers.Friendships.Responses;

public record FriendshipResponse(
    Guid Id,
    Guid SenderId,
    string SenderDisplayName,
    string? SenderProfileImageUrl,
    Guid ReceiverId,
    string ReceiverDisplayName,
    string? ReceiverProfileImageUrl,
    string Status,
    DateTime CreatedAt,
    DateTime? UpdatedAt);
