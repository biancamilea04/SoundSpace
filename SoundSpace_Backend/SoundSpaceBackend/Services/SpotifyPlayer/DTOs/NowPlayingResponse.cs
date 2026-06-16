namespace SoundSpaceBackend.Services.SpotifyPlayer.DTOs;

public record NowPlayingResponse(
    bool IsPlaying,
    int ProgressMs,
    int DurationMs,
    string RepeatState,
    bool ShuffleState,

    string SongTitle,
    string SongUri,
    bool IsExplicit,

    string ArtistNames,
    List<NowPlayingArtist> Artists,

    string AlbumName,
    string AlbumUri,
    string? AlbumImageUrl,
    string? ReleaseDate,

    string? DeviceName,
    string? DeviceType,
    int VolumePercent
);

public record NowPlayingArtist(string Name, string? Uri, string? SpotifyUrl);
