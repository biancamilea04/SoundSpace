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

        foreach (var timeRange in timeRanges)
        {
            var response = await client.GetAsync($"{TopArtistsBaseUrl}?limit=50&time_range={timeRange}");

            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync();
                logger.LogError("[SpotifyPlayer] Top artists (genres) API error for time_range={TimeRange}. Status={Status} Body={Body}",
                    timeRange, response.StatusCode, body);
                continue;
            }

            var json = await response.Content.ReadAsStringAsync();
            var spotifyData = JsonSerializer.Deserialize<SpotifyTopArtistsDto>(json, JsonOptions);

            if (spotifyData?.Items == null || spotifyData.Items.Count == 0)
            {
                logger.LogWarning("[SpotifyPlayer] No top artists returned for time_range={TimeRange}", timeRange);
                continue;
            }

            logger.LogDebug("[SpotifyPlayer] time_range={TimeRange}: {ArtistCount} artists, total genre entries={GenreCount}",
                timeRange, spotifyData.Items.Count, spotifyData.Items.SelectMany(a => a.Genres).Count());

            var topGenres = spotifyData.Items
                .SelectMany(a => a.Genres)
                .GroupBy(g => g)
                .OrderByDescending(g => g.Count())
                .Take(maxGenres)
                .Select(g => g.Key)
                .ToList();

            if (topGenres.Count > 0)
                return topGenres;

            logger.LogWarning("[SpotifyPlayer] Artists returned for time_range={TimeRange} but all have empty genre lists", timeRange);
        }

        logger.LogInformation("[SpotifyPlayer] Falling back to top-tracks artist genre lookup");
        return await GetGenresViaTopTracksArtistsAsync(client, maxGenres);
    }

    private async Task<List<string>> GetGenresViaTopTracksArtistsAsync(HttpClient client, int maxGenres)
    {
        var tracksResponse = await client.GetAsync($"{TopTracksBaseUrl}?limit=50&time_range=long_term");
        if (!tracksResponse.IsSuccessStatusCode)
        {
            logger.LogWarning("[SpotifyPlayer] Top-tracks artist fallback: request failed. Status={Status}", tracksResponse.StatusCode);
            return [];
        }

        var tracksJson = await tracksResponse.Content.ReadAsStringAsync();
        var tracksData = JsonSerializer.Deserialize<SpotifyTopTracksDto>(tracksJson, JsonOptions);

        var artistIds = tracksData?.Items?
            .SelectMany(t => t.Artists)
            .Where(a => a.Id != null)
            .Select(a => a.Id!)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Take(50)
            .ToList() ?? [];

        if (artistIds.Count == 0)
        {
            logger.LogWarning("[SpotifyPlayer] Top-tracks artist fallback: no artist IDs found in top tracks");
            return [];
        }

        // Batch fetch — /v1/artists accepts up to 50 IDs in one request
        var ids = string.Join(",", artistIds);
        var batchResponse = await client.GetAsync($"https://api.spotify.com/v1/artists?ids={ids}");
        if (!batchResponse.IsSuccessStatusCode)
        {
            logger.LogWarning("[SpotifyPlayer] Top-tracks artist fallback: batch fetch failed. Status={Status}", batchResponse.StatusCode);
            return [];
        }

        var batchJson = await batchResponse.Content.ReadAsStringAsync();
        var batchData = JsonSerializer.Deserialize<SpotifyArtistsBatchDto>(batchJson, JsonOptions);

        var genres = batchData?.Artists?
            .Where(a => a.Genres.Count > 0)
            .SelectMany(a => a.Genres)
            .GroupBy(g => g, StringComparer.OrdinalIgnoreCase)
            .OrderByDescending(g => g.Count())
            .Take(maxGenres)
            .Select(g => g.Key)
            .ToList() ?? [];

        if (genres.Count == 0)
            logger.LogWarning("[SpotifyPlayer] Top-tracks artist fallback: artists from top tracks also have no genre data");

        return genres;
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

    public async Task<List<SpotifyMediaItemResponse>> GetRecentlyPlayedTracksAsync(string spotifyId, string type = "track")
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

        if (type == "episode")
        {
            var response = await client.GetAsync(
                "https://api.spotify.com/v1/me/episodes?limit=10");

            if (!response.IsSuccessStatusCode)
            {
                logger.LogError("[SpotifyPlayer] saved episodes failed. Status={Status}", response.StatusCode);
                return [];
            }

            var json = await response.Content.ReadAsStringAsync();
            var data = JsonSerializer.Deserialize<SpotifySavedEpisodesDto>(json, JsonOptions);

            var items = new List<SpotifyMediaItemResponse>();

            foreach (var item in data?.Items ?? [])
            {
                var episode = item.Episode;
                if (episode?.Uri == null) continue;

                items.Add(new SpotifyMediaItemResponse(
                    episode.Uri,
                    episode.Name,
                    "episode",
                    episode.Images.FirstOrDefault()?.Url ?? string.Empty,
                    episode.Show?.Name ?? string.Empty,
                    episode.ExternalUrls?.Spotify ?? string.Empty,
                    episode.Show?.ExternalUrls?.Spotify ?? string.Empty
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

            trackItems.Add(new SpotifyMediaItemResponse(
                track.Uri,
                track.Name,
                "track",
                track.Album?.Images.FirstOrDefault()?.Url ?? string.Empty,
                string.Join(", ", track.Artists.Select(a => a.Name)),
                track.ExternalUrls?.Spotify ?? string.Empty,
                track.Artists.FirstOrDefault()?.ExternalUrls?.Spotify ?? string.Empty
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
            $"https://api.spotify.com/v1/search?q={encodedQuery}&type=track,album,episode&limit=10");

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
                track.Artists.FirstOrDefault()?.ExternalUrls?.Spotify ?? string.Empty
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

        foreach (var episode in data?.Episodes?.Items ?? [])
        {
            if (episode.Uri == null)
                continue;

            items.Add(new SpotifyMediaItemResponse(
                episode.Uri,
                episode.Name,
                "episode",
                episode.Images.FirstOrDefault()?.Url ?? string.Empty,
                episode.Show?.Name ?? string.Empty,
                episode.ExternalUrls?.Spotify ?? string.Empty,
                episode.Show?.ExternalUrls?.Spotify ?? string.Empty
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
            "episode" => await LookupEpisodeAsync(client, id, uri),
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

    private async Task<SpotifyMediaItemResponse?> LookupEpisodeAsync(HttpClient client, string id, string uri)
    {
        var response = await client.GetAsync($"https://api.spotify.com/v1/episodes/{id}");
        if (!response.IsSuccessStatusCode) return null;

        var json = await response.Content.ReadAsStringAsync();
        var episode = JsonSerializer.Deserialize<SpotifyEpisodeDto>(json, JsonOptions);
        if (episode == null) return null;

        return new SpotifyMediaItemResponse(
            uri,
            episode.Name,
            "episode",
            episode.Images.FirstOrDefault()?.Url ?? string.Empty,
            episode.Show?.Name ?? string.Empty,
            episode.ExternalUrls?.Spotify ?? string.Empty,
            episode.Show?.ExternalUrls?.Spotify ?? string.Empty
        );
    }
}