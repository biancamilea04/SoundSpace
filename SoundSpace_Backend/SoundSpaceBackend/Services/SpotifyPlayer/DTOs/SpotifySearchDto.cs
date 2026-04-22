using System.Text.Json.Serialization;

namespace SoundSpaceBackend.Services.SpotifyPlayer.DTOs;

public class SpotifySearchResponseDto
{
    [JsonPropertyName("tracks")]
    public SpotifySearchPageDto<SpotifyTrackDto>? Tracks { get; set; }

    [JsonPropertyName("albums")]
    public SpotifySearchPageDto<SpotifyAlbumDto>? Albums { get; set; }

    [JsonPropertyName("episodes")]
    public SpotifySearchPageDto<SpotifyEpisodeDto>? Episodes { get; set; }
}

public class SpotifySearchPageDto<T>
{
    [JsonPropertyName("items")]
    public List<T> Items { get; set; } = [];
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
}

public class SpotifyEpisodeShowDto
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("external_urls")]
    public SpotifyExternalUrlsDto? ExternalUrls { get; set; }
}
