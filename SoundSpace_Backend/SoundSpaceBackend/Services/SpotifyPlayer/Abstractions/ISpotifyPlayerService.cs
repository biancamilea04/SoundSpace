using SoundSpaceBackend.Services.SpotifyPlayer.DTOs;

namespace SoundSpaceBackend.Services.SpotifyPlayer.Abstractions;

public interface ISpotifyPlayerService
{
    Task<NowPlayingResponse?> GetCurrentlyPlayingTrackAsync(string spotifyId);
    Task<List<SpotifyMediaItemResponse>> GetRecentlyPlayedTracksAsync(string spotifyId, string type = "track");
    Task<List<SpotifyMediaItemResponse>> SearchAsync(string spotifyId, string query);
    Task<SpotifyMediaItemResponse?> LookupByUriAsync(string spotifyId, string uri);
}