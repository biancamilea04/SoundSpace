namespace SoundSpaceBackend.Services.Conversation.DTOs;

public record RecentContactDto(
    Guid Id,
    string DisplayName,
    string? ProfileImageUrl
);
