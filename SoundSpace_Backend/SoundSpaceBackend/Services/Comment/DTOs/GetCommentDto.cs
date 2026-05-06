namespace SoundSpaceBackend.Services.Comment.DTOs;

public record GetCommentDto(
    Guid Id,
    Guid PostId,
    Guid UserId,
    string DisplayName,
    string? ProfileImageUrl,
    string Content,
    Guid? ParentCommentId,
    DateTime CreatedAt,
    DateTime? UpdatedAt);
