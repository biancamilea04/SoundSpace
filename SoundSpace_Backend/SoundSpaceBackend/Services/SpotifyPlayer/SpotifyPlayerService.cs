using System.Net.Http.Headers;
using System.Text.Json;
using AutoMapper;
using Microsoft.Extensions.Logging;
using SoundSpaceBackend.Controllers.Artists.Responses;
using SoundSpaceBackend.Services.PreviewUrl.Abstractions;
using SoundSpaceBackend.Services.SpotifyPlayer.Abstractions;
using SoundSpaceBackend.Services.SpotifyPlayer.DTOs;
using SoundSpaceBackend.Services.SpotifyToken.Abstractions;

namespace SoundSpaceBackend.Services.SpotifyPlayer;

public class SpotifyPlayerService(
    ISpotifyTokenService spotifyTokenService,
    IHttpClientFactory httpClientFactory,
    IMapper mapper,
    IPreviewUrlService previewUrlService,
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

    private const string DevicesUrl = "https://api.spotify.com/v1/me/player/devices";

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
            a.ExternalUrls?.Spotify,
            a.Id
        )).ToList();

        return result;
    }

    public async Task<List<string>> GetTopGenresAsync(string spotifyId, int maxGenres = 10)
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

        string[] timeRanges = ["medium_term", "short_term", "long_term"];
        var allArtists = new Dictionary<string, SpotifyTopArtistItemDto>();

        foreach (var timeRange in timeRanges)
        {
            var response = await client.GetAsync($"{TopArtistsBaseUrl}?limit=50&time_range={timeRange}");

            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync();
                logger.LogError(
                    "[SpotifyPlayer] Top artists API error for time_range={TimeRange}. Status={Status} Body={Body}",
                    timeRange, response.StatusCode, body);
                continue;
            }

            var json = await response.Content.ReadAsStringAsync();
            var spotifyData = JsonSerializer.Deserialize<SpotifyTopArtistsDto>(json, JsonOptions);

            if (spotifyData?.Items == null || spotifyData.Items.Count == 0)
                continue;

            foreach (var artist in spotifyData.Items)
                allArtists.TryAdd(artist.Id ?? artist.Name, artist);
        }

        var topGenres = allArtists.Values
            .SelectMany(a => a.Genres)
            .GroupBy(g => g)
            .OrderByDescending(g => g.Count())
            .Take(maxGenres)
            .Select(g => g.Key)
            .ToList();

        logger.LogInformation("[SpotifyPlayer] Extracted top genres from {ArtistCount} unique artists: {Genres}",
            allArtists.Count, string.Join(", ", topGenres));

        return topGenres;
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
            t.ExternalUrls?.Spotify,
            t.Id,
            t.PreviewUrl
        )).ToList();

       var resolveTasks = result
            .Select((r, i) => new { r, i })
            .Where(x => x.r.PreviewUrl == null && x.r.SpotifyId != null)
            .Select(async x =>
            {
                var uri = $"spotify:track:{x.r.SpotifyId}";
                var url = await previewUrlService.ResolveAsync(spotifyId, uri, x.r.ArtistName, x.r.Name);
                return (index: x.i, url);
            });

        foreach (var (index, url) in await Task.WhenAll(resolveTasks))
            result[index] = result[index] with { PreviewUrl = url };

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
                s.Track!.ExternalUrls?.Spotify,
                s.Track!.Id,
                s.PlayedAt
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
            logger.LogInformation(
                "[SpotifyPlayer] Nothing currently playing for SpotifyId={SpotifyId}. Falling back to recently played",
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
                "[SpotifyPlayer] Response had no track item for SpotifyId={SpotifyId}. Falling back to recently played",
                spotifyId);
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
            logger.LogWarning("[SpotifyPlayer] Response had no recent track history for SpotifyId={SpotifyId}",
                spotifyId);
            return null;
        }

        var result = mapper.Map<NowPlayingResponse>(latestTrack);
        return result;
    }

    public async Task<List<SpotifyMediaItemResponse>> GetRecentlyPlayedTracksAsync(string spotifyId,
        string type = "track")
    {
        var accessToken = await spotifyTokenService.GetValidAccessTokenAsync(spotifyId);
        if (accessToken == null) return [];

        var client = httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", accessToken);

        if (type == "album")
        {
            var response = await client.GetAsync(
                "https://api.spotify.com/v1/me/player/recently-played?limit=50");

            if (!response.IsSuccessStatusCode)
            {
                logger.LogError("[SpotifyPlayer] recently-played (album) failed. Status={Status}", response.StatusCode);
                return [];
            }

            var json = await response.Content.ReadAsStringAsync();
            var data = JsonSerializer.Deserialize<SpotifyRecentlyPlayedDto>(json, JsonOptions);

            var seen = new HashSet<string>();
            var items = new List<SpotifyMediaItemResponse>();

            foreach (var item in data?.Items ?? [])
            {
                var album = item.Track?.Album;
                if (album?.Uri == null || !seen.Add(album.Uri)) continue;
                if (items.Count == 10) break;

                items.Add(new SpotifyMediaItemResponse(
                    album.Uri,
                    album.Name,
                    "album",
                    album.Images.FirstOrDefault()?.Url ?? string.Empty,
                    string.Join(", ", album.Artists.Select(a => a.Name)),
                    album.ExternalUrls?.Spotify ?? string.Empty,
                    album.Artists.FirstOrDefault()?.ExternalUrls?.Spotify ?? string.Empty
                ));
            }

            return items;
        }

        if (type == "show")
        {
            var response = await client.GetAsync(
                "https://api.spotify.com/v1/me/shows?limit=10");

            if (!response.IsSuccessStatusCode)
            {
                logger.LogError("[SpotifyPlayer] saved shows failed. Status={Status}", response.StatusCode);
                return [];
            }

            var json = await response.Content.ReadAsStringAsync();
            var data = JsonSerializer.Deserialize<SpotifySavedShowsDto>(json, JsonOptions);

            var items = new List<SpotifyMediaItemResponse>();

            foreach (var item in data?.Items ?? [])
            {
                var show = item.Show;
                if (show?.Uri == null) continue;

                items.Add(new SpotifyMediaItemResponse(
                    show.Uri,
                    show.Name,
                    "show",
                    show.Images.FirstOrDefault()?.Url ?? string.Empty,
                    show.Publisher,
                    show.ExternalUrls?.Spotify ?? string.Empty,
                    string.Empty
                ));
            }

            return items;
        }

        var trackResponse = await client.GetAsync(
            "https://api.spotify.com/v1/me/player/recently-played?limit=10");

        if (!trackResponse.IsSuccessStatusCode)
        {
            logger.LogError("[SpotifyPlayer] recently-played list failed. Status={Status}", trackResponse.StatusCode);
            return [];
        }

        var trackJson = await trackResponse.Content.ReadAsStringAsync();
        var trackData = JsonSerializer.Deserialize<SpotifyRecentlyPlayedDto>(trackJson, JsonOptions);

        var seenTracks = new HashSet<string>();
        var trackItems = new List<SpotifyMediaItemResponse>();

        foreach (var item in trackData?.Items ?? [])
        {
            var track = item.Track;
            if (track?.Uri == null || !seenTracks.Add(track.Uri)) continue;

            logger.LogInformation("[SpotifyPlayer] RecentlyPlayed track={Name} uri={Uri} preview_url={PreviewUrl}",
                track.Name, track.Uri, track.PreviewUrl);

            trackItems.Add(new SpotifyMediaItemResponse(
                track.Uri,
                track.Name,
                "track",
                track.Album?.Images.FirstOrDefault()?.Url ?? string.Empty,
                string.Join(", ", track.Artists.Select(a => a.Name)),
                track.ExternalUrls?.Spotify ?? string.Empty,
                track.Artists.FirstOrDefault()?.ExternalUrls?.Spotify ?? string.Empty,
                track.PreviewUrl
            ));
        }

        return trackItems;
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
                string.Join(", ", track.Artists.Select(a => a.Name)),
                track.ExternalUrls?.Spotify ?? string.Empty,
                track.Artists.FirstOrDefault()?.ExternalUrls?.Spotify ?? string.Empty,
                track.PreviewUrl
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
                string.Join(", ", album.Artists.Select(a => a.Name)),
                album.ExternalUrls?.Spotify ?? string.Empty,
                album.Artists.FirstOrDefault()?.ExternalUrls?.Spotify ?? string.Empty
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
                show.Publisher,
                show.ExternalUrls?.Spotify ?? string.Empty,
                string.Empty
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
            string.Join(", ", track.Artists.Select(a => a.Name)),
            track.ExternalUrls?.Spotify ?? string.Empty,
            track.Artists.FirstOrDefault()?.ExternalUrls?.Spotify ?? string.Empty
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
            string.Join(", ", album.Artists.Select(a => a.Name)),
            album.ExternalUrls?.Spotify ?? string.Empty,
            album.Artists.FirstOrDefault()?.ExternalUrls?.Spotify ?? string.Empty
        );
    }

    private async Task<SpotifyMediaItemResponse?> LookupShowAsync(HttpClient client, string id, string uri)
    {
        var response = await client.GetAsync($"https://api.spotify.com/v1/shows/{id}");
        if (!response.IsSuccessStatusCode) return null;

        var json = await response.Content.ReadAsStringAsync();
        var show = JsonSerializer.Deserialize<SpotifyShowDetailDto>(json, JsonOptions);
        if (show == null) return null;

        var previewUrl = show.Episodes?.Items
            .FirstOrDefault(e => e.PreviewUrl != null)?.PreviewUrl;

        return new SpotifyMediaItemResponse(
            uri,
            show.Name,
            "show",
            show.Images.FirstOrDefault()?.Url ?? string.Empty,
            show.Publisher,
            show.ExternalUrls?.Spotify ?? string.Empty,
            string.Empty,
            previewUrl
        );
    }

    public async Task<List<ArtistSearchResult>> SearchArtistsAsync(string spotifyId, string query)
    {
        var accessToken = await spotifyTokenService.GetValidAccessTokenAsync(spotifyId);
        if (accessToken == null) return [];

        var client = httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue(Bearer, accessToken);

        var encodedQuery = Uri.EscapeDataString(query);
        var response = await client.GetAsync(
            $"https://api.spotify.com/v1/search?q={encodedQuery}&type=artist&limit=10");

        if (response.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
            throw new HttpRequestException("rate-limited", null, System.Net.HttpStatusCode.TooManyRequests);

        if (!response.IsSuccessStatusCode)
        {
            logger.LogError("[SpotifyPlayer] Artist search failed. Status={Status}", response.StatusCode);
            return [];
        }

        var json = await response.Content.ReadAsStringAsync();
        var data = JsonSerializer.Deserialize<SpotifySearchResponseDto>(json, JsonOptions);

        return (data?.Artists?.Items ?? [])
            .Select(a => new ArtistSearchResult(
                a.Name,
                a.Id,
                a.Images.FirstOrDefault()?.Url,
                a.ExternalUrls?.Spotify,
                a.Genres))
            .ToList();
    }

    public async Task<PlayTrackResultCode> PlayTrackAsync(string spotifyId, string trackUri, int positionMs = 0)
    {
        var accessToken = await spotifyTokenService.GetValidAccessTokenAsync(spotifyId);
        if (accessToken == null) return PlayTrackResultCode.Error;

        var client = httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(Bearer, accessToken);

        var deviceId = await GetActiveDeviceIdAsync(client);
        if (deviceId == null) return PlayTrackResultCode.NoActiveDevice;

        var body = JsonSerializer.Serialize(new
        {
            uris = new[] { trackUri },
            position_ms = positionMs
        });

        var response = await client.PutAsync(
            $"https://api.spotify.com/v1/me/player/play?device_id={deviceId}",
            new StringContent(body, System.Text.Encoding.UTF8, "application/json"));

        if (response.IsSuccessStatusCode) return PlayTrackResultCode.Success;

        if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
            return PlayTrackResultCode.NoActiveDevice;

        if (response.StatusCode == System.Net.HttpStatusCode.Forbidden)
            return PlayTrackResultCode.PremiumRequired;

        var errorBody = await response.Content.ReadAsStringAsync();
        logger.LogError("[SpotifyPlayer] PlayTrack error. Status={Status} Body={Body}", response.StatusCode, errorBody);
        return PlayTrackResultCode.Error;
    }

    private async Task<string?> GetActiveDeviceIdAsync(HttpClient client)
    {
        var response = await client.GetAsync(DevicesUrl);
        if (!response.IsSuccessStatusCode) return null;

        var json = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(json);
        if (!doc.RootElement.TryGetProperty("devices", out var devicesEl)) return null;

        string? firstId = null;
        foreach (var device in devicesEl.EnumerateArray())
        {
            var id = device.TryGetProperty("id", out var idEl) ? idEl.GetString() : null;
            if (id == null) continue;

            firstId ??= id;
            var isActive = device.TryGetProperty("is_active", out var activeEl) && activeEl.GetBoolean();
            if (isActive) return id;
        }

        return firstId;
    }
}