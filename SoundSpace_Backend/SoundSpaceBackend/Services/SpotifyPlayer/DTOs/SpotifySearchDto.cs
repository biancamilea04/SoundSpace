using System.Text.Json.Serialization;

namespace SoundSpaceBackend.Services.SpotifyPlayer.DTOs;

public class SpotifySearchResponseDto
{
    [JsonPropertyName("tracks")]
    public SpotifySearchPageDto<SpotifyTrackDto>? Tracks { get; set; }

    [JsonPropertyName("albums")]
    public SpotifySearchPageDto<SpotifyAlbumDto>? Albums { get; set; }

    [JsonPropertyName("shows")]
    public SpotifySearchPageDto<SpotifyShowDto>? Shows { get; set; }

    [JsonPropertyName("artists")]
    public SpotifySearchPageDto<SpotifyTopArtistItemDto>? Artists { get; set; }
}

public class SpotifySearchPageDto<T>
{
    [JsonPropertyName("items")]
    public List<T> Items { get; set; } = [];
}

public class SpotifyShowDto
{
    [JsonPropertyName("uri")]
    public string? Uri { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("images")]
    public List<SpotifyImageDto> Images { get; set; } = [];

    [JsonPropertyName("publisher")]
    public string Publisher { get; set; } = string.Empty;

    [JsonPropertyName("external_urls")]
    public SpotifyExternalUrlsDto? ExternalUrls { get; set; }
}

public class SpotifyShowDetailDto
{
    [JsonPropertyName("uri")]
    public string? Uri { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("images")]
    public List<SpotifyImageDto> Images { get; set; } = [];

    [JsonPropertyName("publisher")]
    public string Publisher { get; set; } = string.Empty;

    [JsonPropertyName("external_urls")]
    public SpotifyExternalUrlsDto? ExternalUrls { get; set; }

    [JsonPropertyName("episodes")]
    public SpotifySearchPageDto<SpotifyEpisodeDto>? Episodes { get; set; }
}

public class SpotifyEpisodeDto
{
    [JsonPropertyName("uri")]
    public string? Uri { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("images")]
    public List<SpotifyImageDto> Images { get; set; } = [];

    [JsonPropertyName("show")]
    public SpotifyEpisodeShowDto? Show { get; set; }

    [JsonPropertyName("external_urls")]
    public SpotifyExternalUrlsDto? ExternalUrls { get; set; }

    [JsonPropertyName("preview_url")]
    public string? PreviewUrl { get; set; }
}

public class SpotifyEpisodeShowDto
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("external_urls")]
    public SpotifyExternalUrlsDto? ExternalUrls { get; set; }
}
