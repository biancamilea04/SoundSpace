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
    string? SpotifyMediaType,
    DateTime CreatedAt);
