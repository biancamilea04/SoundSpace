using System.Text.Json.Serialization;

namespace SoundSpaceBackend.Services.SpotifyPlayer.DTOs;

public record RecentStreamResponse(
    [property: JsonPropertyName("title")] string Name,
    [property: JsonPropertyName("artistName")] string ArtistName,
    [property: JsonPropertyName("artistUrl")] string? ArtistUrl,
    [property: JsonPropertyName("imageUrl")] string? ImageUrl,
    [property: JsonPropertyName("spotifyUrl")] string? SpotifyUrl,
    [property: JsonPropertyName("spotifyId")] string? SpotifyId,
    [property: JsonPropertyName("playedAt")] DateTime PlayedAt
);
