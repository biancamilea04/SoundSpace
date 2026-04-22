using System.Text.Json.Serialization;

namespace SoundSpaceBackend.Services.SpotifyPlayer.DTOs;

public class SpotifyRecentlyPlayedDto
{
    [JsonPropertyName("items")]
    public List<SpotifyPlayHistoryDto> Items { get; set; } = [];
}

public class SpotifyPlayHistoryDto
{
    [JsonPropertyName("track")]
    public SpotifyTrackDto? Track { get; set; }

    [JsonPropertyName("played_at")]
    public DateTime PlayedAt { get; set; }

    [JsonPropertyName("context")]
    public SpotifyContextDto? Context { get; set; }
}

public class SpotifySavedEpisodesDto
{
    [JsonPropertyName("items")]
    public List<SpotifySavedEpisodeItemDto> Items { get; set; } = [];
}

public class SpotifySavedEpisodeItemDto
{
    [JsonPropertyName("episode")]
    public SpotifyEpisodeDto? Episode { get; set; }
}
