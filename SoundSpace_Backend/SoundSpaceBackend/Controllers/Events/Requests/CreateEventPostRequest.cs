using System.ComponentModel.DataAnnotations;

namespace SoundSpaceBackend.Controllers.Events.Requests;

public record CreateEventPostRequest(
    [Required] [MaxLength(2000)] string Content,
    [MaxLength(500)] string? SpotifyUri,
    [MaxLength(500)] string? SpotifyName,
    [MaxLength(500)] string? SpotifyCoverUrl,
    [MaxLength(500)] string? SpotifySubtitle,
    [MaxLength(50)] string? SpotifyMediaType,
    [MaxLength(500)] string? PreviewUrl,
    int? PreviewStartSecond,
    int? PreviewDuration);
