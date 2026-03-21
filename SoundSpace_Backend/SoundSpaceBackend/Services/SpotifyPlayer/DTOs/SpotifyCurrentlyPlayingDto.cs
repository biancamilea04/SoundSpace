using System.Text.Json.Serialization;

namespace SoundSpaceBackend.Services.SpotifyPlayer.DTOs;

public class SpotifyCurrentlyPlayingDto
{
    [JsonPropertyName("is_playing")]
    public bool IsPlaying { get; set; }

    [JsonPropertyName("progress_ms")]
    public int ProgressMs { get; set; }

    [JsonPropertyName("timestamp")]
    public long Timestamp { get; set; }

    [JsonPropertyName("currently_playing_type")]
    public string? CurrentlyPlayingType { get; set; }

    [JsonPropertyName("repeat_state")]
    public string? RepeatState { get; set; }

    [JsonPropertyName("shuffle_state")]
    public bool ShuffleState { get; set; }

    [JsonPropertyName("item")]
    public SpotifyTrackDto? Item { get; set; }

    [JsonPropertyName("device")]
    public SpotifyDeviceDto? Device { get; set; }

    [JsonPropertyName("context")]
    public SpotifyContextDto? Context { get; set; }

    [JsonPropertyName("actions")]
    public SpotifyActionsDto? Actions { get; set; }
}

public class SpotifyTrackDto
{
    [JsonPropertyName("id")]
    public string? Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("duration_ms")]
    public int DurationMs { get; set; }

    [JsonPropertyName("explicit")]
    public bool Explicit { get; set; }

    [JsonPropertyName("popularity")]
    public int Popularity { get; set; }

    [JsonPropertyName("track_number")]
    public int TrackNumber { get; set; }

    [JsonPropertyName("disc_number")]
    public int DiscNumber { get; set; }

    [JsonPropertyName("preview_url")]
    public string? PreviewUrl { get; set; }

    [JsonPropertyName("uri")]
    public string? Uri { get; set; }

    [JsonPropertyName("href")]
    public string? Href { get; set; }

    [JsonPropertyName("is_local")]
    public bool IsLocal { get; set; }

    [JsonPropertyName("is_playable")]
    public bool IsPlayable { get; set; }

    [JsonPropertyName("type")]
    public string? Type { get; set; }

    [JsonPropertyName("artists")]
    public List<SpotifyArtistDto> Artists { get; set; } = [];

    [JsonPropertyName("album")]
    public SpotifyAlbumDto? Album { get; set; }

    [JsonPropertyName("external_urls")]
    public SpotifyExternalUrlsDto? ExternalUrls { get; set; }

    [JsonPropertyName("external_ids")]
    public SpotifyExternalIdsDto? ExternalIds { get; set; }

    [JsonPropertyName("available_markets")]
    public List<string> AvailableMarkets { get; set; } = [];
}

public class SpotifyAlbumDto
{
    [JsonPropertyName("id")]
    public string? Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("album_type")]
    public string? AlbumType { get; set; }

    [JsonPropertyName("total_tracks")]
    public int TotalTracks { get; set; }

    [JsonPropertyName("release_date")]
    public string? ReleaseDate { get; set; }

    [JsonPropertyName("release_date_precision")]
    public string? ReleaseDatePrecision { get; set; }

    [JsonPropertyName("uri")]
    public string? Uri { get; set; }

    [JsonPropertyName("href")]
    public string? Href { get; set; }

    [JsonPropertyName("type")]
    public string? Type { get; set; }

    [JsonPropertyName("images")]
    public List<SpotifyImageDto> Images { get; set; } = [];

    [JsonPropertyName("artists")]
    public List<SpotifyArtistDto> Artists { get; set; } = [];

    [JsonPropertyName("external_urls")]
    public SpotifyExternalUrlsDto? ExternalUrls { get; set; }

    [JsonPropertyName("available_markets")]
    public List<string> AvailableMarkets { get; set; } = [];
}

public class SpotifyArtistDto
{
    [JsonPropertyName("id")]
    public string? Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("type")]
    public string? Type { get; set; }

    [JsonPropertyName("uri")]
    public string? Uri { get; set; }

    [JsonPropertyName("href")]
    public string? Href { get; set; }

    [JsonPropertyName("external_urls")]
    public SpotifyExternalUrlsDto? ExternalUrls { get; set; }
}

public class SpotifyImageDto
{
    [JsonPropertyName("url")]
    public string Url { get; set; } = string.Empty;

    [JsonPropertyName("height")]
    public int? Height { get; set; }

    [JsonPropertyName("width")]
    public int? Width { get; set; }
}

public class SpotifyDeviceDto
{
    [JsonPropertyName("id")]
    public string? Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("type")]
    public string? Type { get; set; }

    [JsonPropertyName("is_active")]
    public bool IsActive { get; set; }

    [JsonPropertyName("is_private_session")]
    public bool IsPrivateSession { get; set; }

    [JsonPropertyName("is_restricted")]
    public bool IsRestricted { get; set; }

    [JsonPropertyName("volume_percent")]
    public int VolumePercent { get; set; }

    [JsonPropertyName("supports_volume")]
    public bool SupportsVolume { get; set; }
}

public class SpotifyContextDto
{
    [JsonPropertyName("type")]
    public string? Type { get; set; }

    [JsonPropertyName("href")]
    public string? Href { get; set; }

    [JsonPropertyName("uri")]
    public string? Uri { get; set; }

    [JsonPropertyName("external_urls")]
    public SpotifyExternalUrlsDto? ExternalUrls { get; set; }
}

public class SpotifyActionsDto
{
    [JsonPropertyName("interrupting_playback")]
    public bool InterruptingPlayback { get; set; }

    [JsonPropertyName("pausing")]
    public bool Pausing { get; set; }

    [JsonPropertyName("resuming")]
    public bool Resuming { get; set; }

    [JsonPropertyName("seeking")]
    public bool Seeking { get; set; }

    [JsonPropertyName("skipping_next")]
    public bool SkippingNext { get; set; }

    [JsonPropertyName("skipping_prev")]
    public bool SkippingPrev { get; set; }

    [JsonPropertyName("toggling_repeat_context")]
    public bool TogglingRepeatContext { get; set; }

    [JsonPropertyName("toggling_shuffle")]
    public bool TogglingShuffle { get; set; }

    [JsonPropertyName("toggling_repeat_track")]
    public bool TogglingRepeatTrack { get; set; }

    [JsonPropertyName("transferring_playback")]
    public bool TransferringPlayback { get; set; }
}

public class SpotifyExternalUrlsDto
{
    [JsonPropertyName("spotify")]
    public string? Spotify { get; set; }
}

public class SpotifyExternalIdsDto
{
    [JsonPropertyName("isrc")]
    public string? Isrc { get; set; }

    [JsonPropertyName("ean")]
    public string? Ean { get; set; }

    [JsonPropertyName("upc")]
    public string? Upc { get; set; }
}
