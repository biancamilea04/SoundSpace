using System.ComponentModel.DataAnnotations;

namespace SoundSpaceBackend.Controllers.Comments.Requests;

public record CreateCommentRequest(
    [Required][MaxLength(2000)] string Content,
    [Required] Guid PostId,
    Guid? ParentCommentId);
