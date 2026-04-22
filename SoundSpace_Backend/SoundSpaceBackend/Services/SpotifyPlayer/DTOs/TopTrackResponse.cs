using System.Text.Json.Serialization;

namespace SoundSpaceBackend.Services.SpotifyPlayer.DTOs;

public record TopTrackResponse(
    [property: JsonPropertyName("name")] string Name,
    [property: JsonPropertyName("artistName")] string ArtistName,
    [property: JsonPropertyName("artistUrl")] string? ArtistUrl,
    [property: JsonPropertyName("imageUrl")] string? ImageUrl,
    [property: JsonPropertyName("spotifyUrl")] string? SpotifyUrl
);
