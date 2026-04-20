using System.ComponentModel.DataAnnotations;

namespace SoundSpaceBackend.Controllers.Posts.Requests;

public record CreatePostRequest(
    [Required] [MaxLength(2000)] string Content,
    [MaxLength(500)] string? SpotifyUri);
