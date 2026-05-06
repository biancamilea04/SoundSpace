namespace SoundSpaceBackend.Controllers.Comments.Responses;

public record CommentResponse(
    Guid Id,
    Guid PostId,
    Guid UserId,
    string DisplayName,
    string? ProfileImageUrl,
    string Content,
    Guid? ParentCommentId,
    DateTime CreatedAt,
    DateTime? UpdatedAt);
