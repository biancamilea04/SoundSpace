using System.Text.Json.Serialization;

namespace SoundSpaceBackend.Services.SpotifyPlayer.DTOs;

public record TopArtistResponse(
    [property: JsonPropertyName("name")] string Name,
    [property: JsonPropertyName("imageUrl")] string? ImageUrl,
    [property: JsonPropertyName("spotifyUrl")] string? SpotifyUrl,
    [property: JsonPropertyName("spotifyId")] string? SpotifyId
);
