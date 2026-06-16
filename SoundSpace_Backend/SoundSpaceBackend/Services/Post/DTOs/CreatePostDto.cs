namespace SoundSpaceBackend.Services.Post.DTOs;

public record CreatePostDto(
    string Content,
    string? SpotifyUri,
    string? SpotifyName,
    string? SpotifyCoverUrl,
    string? SpotifySubtitle,
    string? SpotifySubtitleUrl,
    string? SpotifyMediaType,
    string? PreviewUrl,
    int? PreviewStartSecond,
    int? PreviewDuration,
    Guid? EventId = null);
