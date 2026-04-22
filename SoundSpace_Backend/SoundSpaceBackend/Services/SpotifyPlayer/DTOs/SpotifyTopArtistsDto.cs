using System.Text.Json.Serialization;

namespace SoundSpaceBackend.Services.SpotifyPlayer.DTOs;

public class SpotifyTopArtistsDto
{
    [JsonPropertyName("items")]
    public List<SpotifyTopArtistItemDto> Items { get; set; } = [];
}

public class SpotifyTopArtistItemDto
{
    [JsonPropertyName("id")]
    public string? Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("images")]
    public List<SpotifyImageDto> Images { get; set; } = [];

    [JsonPropertyName("external_urls")]
    public SpotifyExternalUrlsDto? ExternalUrls { get; set; }

    [JsonPropertyName("genres")]
    public List<string> Genres { get; set; } = [];

    [JsonPropertyName("popularity")]
    public int Popularity { get; set; }

    [JsonPropertyName("type")]
    public string? Type { get; set; }

    [JsonPropertyName("uri")]
    public string? Uri { get; set; }

    [JsonPropertyName("href")]
    public string? Href { get; set; }
}
