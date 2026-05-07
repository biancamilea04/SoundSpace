namespace SoundSpaceBackend.Controllers.Friendships.Responses;

public record FriendActivityResponse(
    Guid UserId,
    string DisplayName,
    string? ProfileImageUrl,
    bool IsOnline,
    bool IsListening,
    string? CurrentlyPlayingTitle,
    string? CurrentlyPlayingArtist,
    string? CurrentlyPlayingArtistUrl,
    string? CurrentlyPlayingCoverUrl,
    string? CurrentlyPlayingUri,
    int CurrentlyPlayingProgressMs,
    string? LastPlayedTitle,
    string? LastPlayedArtist,
    string? LastPlayedArtistUrl,
    string? LastPlayedUri,
    string? LastPlayedCoverUrl,
    DateTime? MusicStatusUpdatedAt,
    DateTime? LastSeen
);
