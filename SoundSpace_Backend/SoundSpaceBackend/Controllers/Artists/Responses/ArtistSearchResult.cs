namespace SoundSpaceBackend.Controllers.Artists.Responses;

public record ArtistSearchResult(
    string Name,
    string? SpotifyId,
    string? ImageUrl,
    string? SpotifyUrl,
    List<string> Genres
);
