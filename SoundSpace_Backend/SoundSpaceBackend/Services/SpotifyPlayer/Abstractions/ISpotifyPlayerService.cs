using SoundSpaceBackend.Services.SpotifyPlayer.DTOs;

namespace SoundSpaceBackend.Services.SpotifyPlayer.Abstractions;

public interface ISpotifyPlayerService
{
    Task<NowPlayingResponse?> GetCurrentlyPlayingTrackAsync(string spotifyId);
    Task<List<TopArtistResponse>> GetTopArtistsAsync(string spotifyId);
    Task<List<TopTrackResponse>> GetTopTracksAsync(string spotifyId);
    Task<List<RecentStreamResponse>> GetRecentStreamsAsync(string spotifyId);
}