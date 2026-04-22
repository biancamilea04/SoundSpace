using System.Text.Json.Serialization;

namespace SoundSpaceBackend.Services.SpotifyPlayer.DTOs;

public class SpotifyArtistsBatchDto
{
    [JsonPropertyName("artists")]
    public List<SpotifyTopArtistItemDto> Artists { get; set; } = [];
}
