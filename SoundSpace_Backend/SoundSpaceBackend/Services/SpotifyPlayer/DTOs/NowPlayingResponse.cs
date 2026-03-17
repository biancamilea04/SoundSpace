namespace SoundSpaceBackend.Services.SpotifyPlayer.DTOs;

public record NowPlayingResponse(
    // Playback state
    bool IsPlaying,
    int ProgressMs,
    int DurationMs,
    string RepeatState,
    bool ShuffleState,

    // Track
    string SongTitle,
    string SongUri,
    bool IsExplicit,

    // Artists 
    string ArtistNames,
    List<NowPlayingArtist> Artists,

    // Album
    string AlbumName,
    string AlbumUri,
    string? AlbumImageUrl,
    string? ReleaseDate,

    // Device
    string? DeviceName,
    string? DeviceType,
    int VolumePercent
);

public record NowPlayingArtist(string Name, string? Uri, string? SpotifyUrl);