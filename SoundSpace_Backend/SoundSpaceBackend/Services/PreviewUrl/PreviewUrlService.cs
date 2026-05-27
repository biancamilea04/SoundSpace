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
        var previewUrl = await TryGetSpotifyPreviewAsync(spotifyId, spotifyUri);
        if (previewUrl != null)
            return previewUrl;

        logger.LogInformation("[PreviewUrl] Spotify preview null for URI={Uri}; falling back to iTunes", spotifyUri);
        return await TryGetItunesPreviewAsync(artistName, trackName);
    }

    private async Task<string?> TryGetSpotifyPreviewAsync(string spotifyId, string spotifyUri)
    {
        var parts = spotifyUri.Split(':');
        if (parts.Length != 3 || parts[1] != "track")
            return null;

        var accessToken = await spotifyTokenService.GetValidAccessTokenAsync(spotifyId);
        if (accessToken == null)
            return null;

        var client = httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        var response = await client.GetAsync($"https://api.spotify.com/v1/tracks/{parts[2]}");
        if (!response.IsSuccessStatusCode)
        {
            logger.LogWarning("[PreviewUrl] Spotify track lookup failed. Status={Status}", response.StatusCode);
            return null;
        }

        var json = await response.Content.ReadAsStringAsync();
        var track = JsonSerializer.Deserialize<SpotifyTrackDto>(json, JsonOptions);
        return track?.PreviewUrl;
    }

    private async Task<string?> TryGetItunesPreviewAsync(string? artistName, string? trackName)
    {
        if (string.IsNullOrWhiteSpace(artistName) || string.IsNullOrWhiteSpace(trackName))
            return null;

        var term = Uri.EscapeDataString($"{artistName} {trackName}");
        var client = httpClientFactory.CreateClient();

        try
        {
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
                return null;

            var first = results[0];
            return first.TryGetProperty("previewUrl", out var urlEl) ? urlEl.GetString() : null;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "[PreviewUrl] iTunes lookup threw an exception");
            return null;
        }
    }
}
