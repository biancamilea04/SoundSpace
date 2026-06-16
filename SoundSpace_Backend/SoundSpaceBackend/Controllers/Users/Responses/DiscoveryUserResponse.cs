namespace SoundSpaceBackend.Controllers.Users.Responses;

public record SharedArtistInfo(string SpotifyArtistId, string Name, string? ImageUrl);

public record DiscoveryUserResponse(
    Guid    Id,
    string  DisplayName,
    string? ProfileImageUrl,
    string? Country,
    double  FinalScore,
    int     SharedArtistCount,
    bool    IsListening,
    string? CurrentlyPlayingTitle,
    string? CurrentlyPlayingArtist,
    string? CurrentlyPlayingCoverUrl,
    List<SharedArtistInfo> SharedArtists,
    bool    IsCountryFallback
);
