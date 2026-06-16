namespace SoundSpaceBackend.Services.Conversation.DTOs;

public record ParticipantDto(
    Guid UserId,
    string DisplayName,
    string? ProfileImageUrl,
    DateTime? LastSeen
);

public record MessageDto(
    Guid Id,
    Guid ConversationId,
    Guid SenderId,
    string? Text,
    DateTime CreatedAt,
    bool IsDeleted,
    bool IsRead,
    DateTime? ReadAt,
    DateTime? EditedAt,
    string SenderDisplayName = "",
    string? SenderProfileImageUrl = null
);

public record ConversationSummaryDto(
    Guid Id,
    bool IsGroup,
    DateTime CreatedAt,
    List<ParticipantDto> Participants,
    MessageDto? LastMessage,
    int UnreadCount
);
