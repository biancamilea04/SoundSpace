namespace SoundSpaceBackend.Services.Post.DTOs;

public record GetPostDto(
    Guid Id,
    Guid UserId,
    string DisplayName,
    string? ProfileImageUrl,
    string Content,
    string? SpotifyUri,
    DateTime CreatedAt);
