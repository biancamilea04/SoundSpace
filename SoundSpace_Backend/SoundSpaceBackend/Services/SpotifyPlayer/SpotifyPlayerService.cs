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
            logger.LogInformation(
                "[SpotifyPlayer] Nothing currently playing for SpotifyId={SpotifyId}. Falling back to recently played.",
                spotifyId);
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
            logger.LogInformation(
                "[SpotifyPlayer] Response had no track item for SpotifyId={SpotifyId}. Falling back to recently played.",
                spotifyId);
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
            logger.LogWarning("[SpotifyPlayer] Response had no recent track history for SpotifyId={SpotifyId}",
                spotifyId);
            return null;
        }

        var result = mapper.Map<NowPlayingResponse>(latestTrack);
        logger.LogInformation("[SpotifyPlayer] Returning recently played track '{Track}' for SpotifyId={SpotifyId}",
            result.SongTitle, spotifyId);

        return result;
    }

    public async Task<List<SpotifyMediaItemResponse>> GetRecentlyPlayedTracksAsync(string spotifyId)
    {
        var accessToken = await spotifyTokenService.GetValidAccessTokenAsync(spotifyId);
        if (accessToken == null) return [];

        var client = httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", accessToken);

        var response = await client.GetAsync(
            "https://api.spotify.com/v1/me/player/recently-played?limit=10");

        if (!response.IsSuccessStatusCode)
        {
            logger.LogError("[SpotifyPlayer] recently-played list failed. Status={Status}", response.StatusCode);
            return [];
        }

        var json = await response.Content.ReadAsStringAsync();
        var data = JsonSerializer.Deserialize<SpotifyRecentlyPlayedDto>(json, JsonOptions);

        var seen = new HashSet<string>();
        var items = new List<SpotifyMediaItemResponse>();

        foreach (var item in data?.Items ?? [])
        {
            var track = item.Track;
            if (track?.Uri == null || !seen.Add(track.Uri)) continue;

            items.Add(new SpotifyMediaItemResponse(
                track.Uri,
                track.Name,
                "track",
                track.Album?.Images.FirstOrDefault()?.Url ?? string.Empty,
                string.Join(", ", track.Artists.Select(a => a.Name))
            ));
        }

        return items;
    }

    public async Task<List<SpotifyMediaItemResponse>> SearchAsync(string spotifyId, string query)
    {
        var accessToken = await spotifyTokenService.GetValidAccessTokenAsync(spotifyId);
        if (accessToken == null)
        {
            return [];
        }

        var client = httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", accessToken);

        var encodedQuery = Uri.EscapeDataString(query);
        var response = await client.GetAsync(
            $"https://api.spotify.com/v1/search?q={encodedQuery}&type=track,album,show&limit=10");

        if (response.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
            throw new HttpRequestException("rate-limited", null, System.Net.HttpStatusCode.TooManyRequests);

        if (!response.IsSuccessStatusCode)
        {
            logger.LogError("[SpotifyPlayer] Search failed. Status={Status}", response.StatusCode);
            return [];
        }

        var json = await response.Content.ReadAsStringAsync();
        var data = JsonSerializer.Deserialize<SpotifySearchResponseDto>(json, JsonOptions);

        var items = new List<SpotifyMediaItemResponse>();

        foreach (var track in data?.Tracks?.Items ?? [])
        {
            if (track.Uri == null) 
                continue;
            
            items.Add(new SpotifyMediaItemResponse(
                track.Uri,
                track.Name,
                "track",
                track.Album?.Images.FirstOrDefault()?.Url ?? string.Empty,
                string.Join(", ", track.Artists.Select(a => a.Name))
            ));
        }

        foreach (var album in data?.Albums?.Items ?? [])
        {
            if (album.Uri == null) 
                continue;
            
            items.Add(new SpotifyMediaItemResponse(
                album.Uri,
                album.Name,
                "album",
                album.Images.FirstOrDefault()?.Url ?? string.Empty,
                string.Join(", ", album.Artists.Select(a => a.Name))
            ));
        }

        foreach (var show in data?.Shows?.Items ?? [])
        {
            if (show.Uri == null) 
                continue;
            
            items.Add(new SpotifyMediaItemResponse(
                show.Uri,
                show.Name,
                "show",
                show.Images.FirstOrDefault()?.Url ?? string.Empty,
                show.Publisher
            ));
        }

        return items;
    }

    public async Task<SpotifyMediaItemResponse?> LookupByUriAsync(string spotifyId, string uri)
    {
        var parts = uri.Split(':');
        if (parts.Length != 3 || parts[0] != "spotify")
        {
            logger.LogWarning("[SpotifyPlayer] Invalid Spotify URI format: {Uri}", uri);
            return null;
        }

        var type = parts[1];
        var id = parts[2];

        var accessToken = await spotifyTokenService.GetValidAccessTokenAsync(spotifyId);
        if (accessToken == null) 
            return null;

        var client = httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", accessToken);

        return type switch
        {
            "track" => await LookupTrackAsync(client, id, uri),
            "album" => await LookupAlbumAsync(client, id, uri),
            "show" => await LookupShowAsync(client, id, uri),
            _ => null
        };
    }

    private async Task<SpotifyMediaItemResponse?> LookupTrackAsync(HttpClient client, string id, string uri)
    {
        var response = await client.GetAsync($"https://api.spotify.com/v1/tracks/{id}");
        if (!response.IsSuccessStatusCode) return null;

        var json = await response.Content.ReadAsStringAsync();
        var track = JsonSerializer.Deserialize<SpotifyTrackDto>(json, JsonOptions);
        if (track == null) return null;

        return new SpotifyMediaItemResponse(
            uri,
            track.Name,
            "track",
            track.Album?.Images.FirstOrDefault()?.Url ?? string.Empty,
            string.Join(", ", track.Artists.Select(a => a.Name))
        );
    }

    private async Task<SpotifyMediaItemResponse?> LookupAlbumAsync(HttpClient client, string id, string uri)
    {
        var response = await client.GetAsync($"https://api.spotify.com/v1/albums/{id}");
        if (!response.IsSuccessStatusCode) return null;

        var json = await response.Content.ReadAsStringAsync();
        var album = JsonSerializer.Deserialize<SpotifyAlbumDto>(json, JsonOptions);
        if (album == null) return null;

        return new SpotifyMediaItemResponse(
            uri,
            album.Name,
            "album",
            album.Images.FirstOrDefault()?.Url ?? string.Empty,
            string.Join(", ", album.Artists.Select(a => a.Name))
        );
    }

    private async Task<SpotifyMediaItemResponse?> LookupShowAsync(HttpClient client, string id, string uri)
    {
        var response = await client.GetAsync($"https://api.spotify.com/v1/shows/{id}");
        if (!response.IsSuccessStatusCode) return null;

        var json = await response.Content.ReadAsStringAsync();
        var show = JsonSerializer.Deserialize<SpotifyShowDto>(json, JsonOptions);
        if (show == null) return null;

        return new SpotifyMediaItemResponse(
            uri,
            show.Name,
            "show",
            show.Images.FirstOrDefault()?.Url ?? string.Empty,
            show.Publisher
        );
    }
}