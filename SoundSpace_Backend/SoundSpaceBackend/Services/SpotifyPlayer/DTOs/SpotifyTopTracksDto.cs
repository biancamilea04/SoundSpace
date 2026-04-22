using System.Text.Json.Serialization;

namespace SoundSpaceBackend.Services.SpotifyPlayer.DTOs;

public class SpotifyTopTracksDto
{
    [JsonPropertyName("items")]
    public List<SpotifyTrackDto> Items { get; set; } = [];
}
