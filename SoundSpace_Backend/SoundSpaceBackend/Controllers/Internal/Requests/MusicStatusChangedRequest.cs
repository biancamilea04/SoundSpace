namespace SoundSpaceBackend.Controllers.Internal.Requests;

public record MusicStatusChangedRequest(
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
