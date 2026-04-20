using SoundSpaceBackend.Services.SpotifyPlayer.DTOs;

namespace SoundSpaceBackend.Services.SpotifyPlayer.Abstractions;

public interface ISpotifyPlayerService
{
    Task<NowPlayingResponse?> GetCurrentlyPlayingTrackAsync(string spotifyId);
    Task<List<TopArtistResponse>> GetTopArtistsAsync(string spotifyId, int limit = 5);
    Task<List<TopTrackResponse>> GetTopTracksAsync(string spotifyId, int limit = 5);
    Task<List<RecentStreamResponse>> GetRecentStreamsAsync(string spotifyId, int limit = 5);
}