using System.Net.Http.Headers;
using System.Text.Json;
using AutoMapper;
using Microsoft.Extensions.Logging;
using SoundSpaceBackend.Services.SpotifyPlayer.Abstractions;
using SoundSpaceBackend.Services.SpotifyPlayer.DTOs;
using SoundSpaceBackend.Services.SpotifyToken.Abstractions;

namespace SoundSpaceBackend.Services.SpotifyPlayer;

public class SpotifyPlayerService(
    ISpotifyTokenService spotifyTokenService,
    IHttpClientFactory httpClientFactory,
    IMapper mapper,
    ILogger<SpotifyPlayerService> logger) : ISpotifyPlayerService
{
    private const string CurrentlyPlayingUrl =
        "https://api.spotify.com/v1/me/player/currently-playing";

    private const string RecentlyPlayedUrl =
        "https://api.spotify.com/v1/me/player/recently-played?limit=1";

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public async Task<NowPlayingResponse?> GetCurrentlyPlayingTrackAsync(string spotifyId)
    {
        logger.LogInformation("[SpotifyPlayer] Fetching currently playing for SpotifyId={SpotifyId}", spotifyId);

        var accessToken = await spotifyTokenService.GetValidAccessTokenAsync(spotifyId);
        if (accessToken == null)
        {
            logger.LogWarning("[SpotifyPlayer] No valid access token for SpotifyId={SpotifyId}", spotifyId);
            return null;
        }

        var client = httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", accessToken);

        var response = await client.GetAsync(CurrentlyPlayingUrl);

        if (response.StatusCode == System.Net.HttpStatusCode.NoContent)
        {
            logger.LogInformation("[SpotifyPlayer] Nothing currently playing for SpotifyId={SpotifyId}. Falling back to recently played.", spotifyId);
            return await GetRecentlyPlayedTrackAsync(spotifyId, accessToken);
        }

        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync();
            logger.LogError("[SpotifyPlayer] Spotify API error. Status={Status} Body={Body}",
                response.StatusCode, body);
            return null;
        }

        var json = await response.Content.ReadAsStringAsync();
        var spotifyData = JsonSerializer.Deserialize<SpotifyCurrentlyPlayingDto>(json, JsonOptions);

        if (spotifyData?.Item == null)
        {
            logger.LogInformation("[SpotifyPlayer] Response had no track item for SpotifyId={SpotifyId}. Falling back to recently played.", spotifyId);
            return await GetRecentlyPlayedTrackAsync(spotifyId, accessToken);
        }

        var result = mapper.Map<NowPlayingResponse>(spotifyData);
        logger.LogInformation("[SpotifyPlayer] Returning track '{Track}' for SpotifyId={SpotifyId}",
            result.SongTitle, spotifyId);

        return result;
    }

    private async Task<NowPlayingResponse?> GetRecentlyPlayedTrackAsync(string spotifyId, string accessToken)
    {
        var client = httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", accessToken);

        var response = await client.GetAsync(RecentlyPlayedUrl);
        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync();
            logger.LogError("[SpotifyPlayer] Fast-fallback Spotify API error. Status={Status} Body={Body}",
                response.StatusCode, body);
            return null;
        }

        var json = await response.Content.ReadAsStringAsync();
        var recentlyPlayedData = JsonSerializer.Deserialize<SpotifyRecentlyPlayedDto>(json, JsonOptions);

        var latestTrack = recentlyPlayedData?.Items?.FirstOrDefault();
        if (latestTrack?.Track == null)
        {
            logger.LogWarning("[SpotifyPlayer] Response had no recent track history for SpotifyId={SpotifyId}", spotifyId);
            return null;
        }

        var result = mapper.Map<NowPlayingResponse>(latestTrack);
        logger.LogInformation("[SpotifyPlayer] Returning recently played track '{Track}' for SpotifyId={SpotifyId}",
            result.SongTitle, spotifyId);

        return result;
    }
}