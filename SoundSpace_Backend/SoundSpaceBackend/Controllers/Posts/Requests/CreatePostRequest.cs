using System.ComponentModel.DataAnnotations;

namespace SoundSpaceBackend.Controllers.Posts.Requests;

public record CreatePostRequest(
    [Required] [MaxLength(2000)] string Content,
    [MaxLength(500)] string? SpotifyUri,
    [MaxLength(500)] string? SpotifyName,
    [MaxLength(500)] string? SpotifyCoverUrl,
    [MaxLength(500)] string? SpotifySubtitle,
    [MaxLength(50)] string? SpotifyMediaType);
