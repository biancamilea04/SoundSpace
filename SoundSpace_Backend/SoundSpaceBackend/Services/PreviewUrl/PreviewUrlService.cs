using System.Net.Http.Headers;
using System.Text.Json;
using SoundSpaceBackend.Services.PreviewUrl.Abstractions;
using SoundSpaceBackend.Services.SpotifyPlayer.DTOs;
using SoundSpaceBackend.Services.SpotifyToken.Abstractions;

namespace SoundSpaceBackend.Services.PreviewUrl;

public class PreviewUrlService(
    ISpotifyTokenService spotifyTokenService,
    IHttpClientFactory httpClientFactory,
    ILogger<PreviewUrlService> logger) : IPreviewUrlService
{
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    public async Task<string?> ResolveAsync(string spotifyId, string spotifyUri, string? artistName, string? trackName)
    {
        logger.LogInformation("[PreviewUrl] Resolving preview for URI={Uri} Artist={Artist} Track={Track}",
            spotifyUri, artistName, trackName);

        var previewUrl = await TryGetSpotifyPreviewAsync(spotifyId, spotifyUri);
        if (previewUrl != null)
        {
            logger.LogInformation("[PreviewUrl] Resolved via Spotify for URI={Uri}", spotifyUri);
            return previewUrl;
        }

        logger.LogInformation("[PreviewUrl] Spotify preview null for URI={Uri}; falling back to iTunes", spotifyUri);
        var itunesUrl = await TryGetItunesPreviewAsync(artistName, trackName);

        if (itunesUrl != null)
            logger.LogInformation("[PreviewUrl] Resolved via iTunes for Artist={Artist} Track={Track}", artistName, trackName);
        else
            logger.LogWarning("[PreviewUrl] No preview found from any source for URI={Uri} Artist={Artist} Track={Track}",
                spotifyUri, artistName, trackName);

        return itunesUrl;
    }

    private async Task<string?> TryGetSpotifyPreviewAsync(string spotifyId, string spotifyUri)
    {
        var parts = spotifyUri.Split(':');
        if (parts.Length != 3 || parts[1] != "track")
        {
            logger.LogDebug("[PreviewUrl] Skipping Spotify lookup — URI is not a track: {Uri}", spotifyUri);
            return null;
        }

        var accessToken = await spotifyTokenService.GetValidAccessTokenAsync(spotifyId);
        if (accessToken == null)
        {
            logger.LogWarning("[PreviewUrl] No valid Spotify access token for SpotifyId={SpotifyId}", spotifyId);
            return null;
        }

        var client = httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        logger.LogDebug("[PreviewUrl] Calling Spotify track API for TrackId={TrackId}", parts[2]);
        var response = await client.GetAsync($"https://api.spotify.com/v1/tracks/{parts[2]}");
        if (!response.IsSuccessStatusCode)
        {
            logger.LogWarning("[PreviewUrl] Spotify track lookup failed. TrackId={TrackId} Status={Status}",
                parts[2], response.StatusCode);
            return null;
        }

        var json = await response.Content.ReadAsStringAsync();
        var track = JsonSerializer.Deserialize<SpotifyTrackDto>(json, JsonOptions);

        logger.LogDebug("[PreviewUrl] Spotify returned preview_url={PreviewUrl} for TrackId={TrackId}",
            track?.PreviewUrl ?? "(null)", parts[2]);

        return track?.PreviewUrl;
    }

    private async Task<string?> TryGetItunesPreviewAsync(string? artistName, string? trackName)
    {
        if (string.IsNullOrWhiteSpace(artistName) || string.IsNullOrWhiteSpace(trackName))
        {
            logger.LogDebug("[PreviewUrl] Skipping iTunes lookup — missing artist or track name");
            return null;
        }

        var term = Uri.EscapeDataString($"{artistName} {trackName}");
        var client = httpClientFactory.CreateClient();

        try
        {
            logger.LogDebug("[PreviewUrl] Calling iTunes search for Artist={Artist} Track={Track}", artistName, trackName);
            var response = await client.GetAsync(
                $"https://itunes.apple.com/search?term={term}&entity=song&limit=1");

            if (!response.IsSuccessStatusCode)
            {
                logger.LogWarning("[PreviewUrl] iTunes lookup failed. Status={Status}", response.StatusCode);
                return null;
            }

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);

            if (!doc.RootElement.TryGetProperty("results", out var results) || results.GetArrayLength() == 0)
            {
                logger.LogDebug("[PreviewUrl] iTunes returned no results for Artist={Artist} Track={Track}",
                    artistName, trackName);
                return null;
            }

            var first = results[0];
            var url = first.TryGetProperty("previewUrl", out var urlEl) ? urlEl.GetString() : null;

            logger.LogDebug("[PreviewUrl] iTunes returned previewUrl={PreviewUrl} for Artist={Artist} Track={Track}",
                url ?? "(null)", artistName, trackName);

            return url;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "[PreviewUrl] iTunes lookup threw an exception for Artist={Artist} Track={Track}",
                artistName, trackName);
            return null;
        }
    }
}
