using SoundSpaceBackend.Models.Enums;

namespace SoundSpaceBackend.Services.Friendship.DTOs;

public record GetFriendshipDto(
    Guid Id,
    Guid SenderId,
    string SenderDisplayName,
    string? SenderProfileImageUrl,
    Guid ReceiverId,
    string ReceiverDisplayName,
    string? ReceiverProfileImageUrl,
    FriendshipStatus Status,
    DateTime CreatedAt,
    DateTime? UpdatedAt);
