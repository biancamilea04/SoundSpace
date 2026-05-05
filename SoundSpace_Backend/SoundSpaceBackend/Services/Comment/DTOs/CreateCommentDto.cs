namespace SoundSpaceBackend.Services.Comment.DTOs;

public record CreateCommentDto(string Content, Guid PostId, Guid? ParentCommentId);
