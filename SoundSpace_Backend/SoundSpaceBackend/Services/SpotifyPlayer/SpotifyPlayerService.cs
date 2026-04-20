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
    private const string Bearer = "Bearer";
    private const string CurrentlyPlayingUrl =
        "https://api.spotify.com/v1/me/player/currently-playing";

    private const string RecentlyPlayedUrl =
        "https://api.spotify.com/v1/me/player/recently-played?limit=1";

    private const string TopArtistsBaseUrl =
        "https://api.spotify.com/v1/me/top/artists";

    private const string TopTracksBaseUrl =
        "https://api.spotify.com/v1/me/top/tracks";

    private const string RecentStreamsBaseUrl =
        "https://api.spotify.com/v1/me/player/recently-played";

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public async Task<List<TopArtistResponse>> GetTopArtistsAsync(string spotifyId, int limit = 5)
    {
        var accessToken = await spotifyTokenService.GetValidAccessTokenAsync(spotifyId);
        if (accessToken == null)
        {
            logger.LogWarning("[SpotifyPlayer] No valid access token for SpotifyId={SpotifyId}", spotifyId);
            return [];
        }

        var client = httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue(Bearer, accessToken);

        var response = await client.GetAsync($"{TopArtistsBaseUrl}?limit={limit}");

        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync();
            logger.LogError("[SpotifyPlayer] Top artists API error. Status={Status} Body={Body}",
                response.StatusCode, body);
            return [];
        }

        var json = await response.Content.ReadAsStringAsync();
        var spotifyData = JsonSerializer.Deserialize<SpotifyTopArtistsDto>(json, JsonOptions);

        if (spotifyData?.Items == null || spotifyData.Items.Count == 0)
        {
            return [];
        }

        var result = spotifyData.Items.Select(a => new TopArtistResponse(
            a.Name,
            a.Images?.FirstOrDefault()?.Url,
            a.ExternalUrls?.Spotify
        )).ToList();

        return result;
    }

    public async Task<List<TopTrackResponse>> GetTopTracksAsync(string spotifyId, int limit = 5)
    {
        var accessToken = await spotifyTokenService.GetValidAccessTokenAsync(spotifyId);
        if (accessToken == null)
        {
            logger.LogWarning("[SpotifyPlayer] No valid access token for SpotifyId={SpotifyId}", spotifyId);
            return [];
        }

        var client = httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue(Bearer, accessToken);

        var response = await client.GetAsync($"{TopTracksBaseUrl}?limit={limit}");

        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync();
            logger.LogError("[SpotifyPlayer] Top tracks API error. Status={Status} Body={Body}",
                response.StatusCode, body);
            return [];
        }

        var json = await response.Content.ReadAsStringAsync();
        var spotifyData = JsonSerializer.Deserialize<SpotifyTopTracksDto>(json, JsonOptions);

        if (spotifyData?.Items == null || spotifyData.Items.Count == 0)
        {
            return [];
        }

        var result = spotifyData.Items.Select(t => new TopTrackResponse(
            t.Name,
            t.Artists.FirstOrDefault()?.Name ?? "Unknown Artist",
            t.Artists.FirstOrDefault()?.ExternalUrls?.Spotify,
            t.Album?.Images?.FirstOrDefault()?.Url,
            t.ExternalUrls?.Spotify
        )).ToList();

       return result;
    }

    public async Task<List<RecentStreamResponse>> GetRecentStreamsAsync(string spotifyId, int limit = 5)
    {
        var accessToken = await spotifyTokenService.GetValidAccessTokenAsync(spotifyId);
        if (accessToken == null)
        {
            logger.LogWarning("[SpotifyPlayer] No valid access token for SpotifyId={SpotifyId}", spotifyId);
            return [];
        }

        var client = httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue(Bearer, accessToken);

        var response = await client.GetAsync($"{RecentStreamsBaseUrl}?limit={limit}");

        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync();
            logger.LogError("[SpotifyPlayer] Recent streams API error. Status={Status} Body={Body}",
                response.StatusCode, body);
            return [];
        }

        var json = await response.Content.ReadAsStringAsync();
        var spotifyData = JsonSerializer.Deserialize<SpotifyRecentlyPlayedDto>(json, JsonOptions);

        if (spotifyData?.Items == null || spotifyData.Items.Count == 0)
        {
           return [];
        }

        var result = spotifyData.Items
            .Where(s => s.Track != null)
            .Select(s => new RecentStreamResponse(
                s.Track!.Name,
                s.Track!.Artists.FirstOrDefault()?.Name ?? "Unknown Artist",
                s.Track!.Artists.FirstOrDefault()?.ExternalUrls?.Spotify,
                s.Track!.Album?.Images?.FirstOrDefault()?.Url,
                s.Track!.ExternalUrls?.Spotify
            )).ToList();
        
        return result;
    }

    public async Task<NowPlayingResponse?> GetCurrentlyPlayingTrackAsync(string spotifyId)
    {
        var accessToken = await spotifyTokenService.GetValidAccessTokenAsync(spotifyId);
        if (accessToken == null)
        {
            logger.LogWarning("[SpotifyPlayer] No valid access token for SpotifyId={SpotifyId}", spotifyId);
            return null;
        }

        var client = httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue(Bearer, accessToken);

        var response = await client.GetAsync(CurrentlyPlayingUrl);

        if (response.StatusCode == System.Net.HttpStatusCode.NoContent)
        {
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
            return await GetRecentlyPlayedTrackAsync(spotifyId, accessToken);
        }

        var result = mapper.Map<NowPlayingResponse>(spotifyData);
        return result;
    }

    private async Task<NowPlayingResponse?> GetRecentlyPlayedTrackAsync(string spotifyId, string accessToken)
    {
        var client = httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue(Bearer, accessToken);

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
        return result;
    }
}