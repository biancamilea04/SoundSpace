using SoundSpaceBackend.Services.SpotifyPlayer.DTOs;

namespace SoundSpaceBackend.Services.SpotifyPlayer.Abstractions;

public interface ISpotifyPlayerService
{
    Task<NowPlayingResponse?> GetCurrentlyPlayingTrackAsync(string spotifyId);
    Task<List<SpotifyMediaItemResponse>> GetRecentlyPlayedTracksAsync(string spotifyId, string type = "track");
    Task<List<SpotifyMediaItemResponse>> SearchAsync(string spotifyId, string query);
    Task<SpotifyMediaItemResponse?> LookupByUriAsync(string spotifyId, string uri);
    Task<List<TopArtistResponse>> GetTopArtistsAsync(string spotifyId, int limit = 5);
    Task<List<TopTrackResponse>> GetTopTracksAsync(string spotifyId, int limit = 5);
    Task<List<RecentStreamResponse>> GetRecentStreamsAsync(string spotifyId, int limit = 5);
    Task<List<string>> GetTopGenresAsync(string spotifyId, int maxGenres = 10);
    Task<PlayTrackResultCode> PlayTrackAsync(string spotifyId, string trackUri, int positionMs = 0);
}