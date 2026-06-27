namespace SoundSpaceBackend.Services.Post.DTOs;

public record UpdatePostDto(
    string Content,
    string? SpotifyUri,
    string? SpotifyName,
    string? SpotifyCoverUrl,
    string? SpotifySubtitle,
    string? SpotifySubtitleUrl,
    string? SpotifyMediaType,
    string? PreviewUrl,
    int? PreviewStartSecond,
    int? PreviewDuration
);
