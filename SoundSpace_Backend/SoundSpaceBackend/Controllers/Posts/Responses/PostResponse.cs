namespace SoundSpaceBackend.Controllers.Posts.Responses;

public record PostResponse(
    Guid Id,
    Guid UserId,
    string DisplayName,
    string? ProfileImageUrl,
    string Content,
    string? SpotifyUri,
    DateTime CreatedAt);
