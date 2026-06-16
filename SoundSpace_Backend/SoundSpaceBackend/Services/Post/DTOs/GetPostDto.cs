namespace SoundSpaceBackend.Services.Post.DTOs;

public record GetPostDto(
    Guid Id,
    Guid UserId,
    string DisplayName,
    string? ProfileImageUrl,
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
    DateTime CreatedAt,
    Guid? EventId,
    string? EventTitle);
