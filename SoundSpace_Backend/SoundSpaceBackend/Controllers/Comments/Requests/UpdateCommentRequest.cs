using System.ComponentModel.DataAnnotations;

namespace SoundSpaceBackend.Controllers.Comments.Requests;

public record UpdateCommentRequest([Required][MaxLength(2000)] string Content);
