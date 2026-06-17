namespace SoundSpaceBackend.Controllers.Users.Responses;

public record UserMusicStatusResponse(
    Guid UserId,
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
    string? LastPlayedCoverUrl
);
