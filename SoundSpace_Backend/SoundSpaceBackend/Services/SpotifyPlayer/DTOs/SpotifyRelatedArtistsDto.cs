using System.Text.Json.Serialization;

namespace SoundSpaceBackend.Services.SpotifyPlayer.DTOs;

public class SpotifyRelatedArtistsDto
{
    [JsonPropertyName("artists")]
    public List<SpotifyTopArtistItemDto> Artists { get; set; } = [];
}
