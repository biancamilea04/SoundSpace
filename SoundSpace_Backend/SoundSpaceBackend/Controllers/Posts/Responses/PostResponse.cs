namespace SoundSpaceBackend.Controllers.Posts.Responses;

public record PostResponse(
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
    int LikeCount,
    bool IsLikedByCurrentUser,
    Guid? EventId = null,
    string? EventTitle = null);
