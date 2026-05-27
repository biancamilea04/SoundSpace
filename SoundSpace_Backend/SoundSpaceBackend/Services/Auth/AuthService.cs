using System.Net.Http.Headers;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using SoundSpaceBackend.Controllers.Auth.Responses;
using SoundSpaceBackend.Models.DTOs;
using SoundSpaceBackend.Services.Auth.Abstractions;
using SoundSpaceBackend.Services.SpotifyToken.Abstractions;

namespace SoundSpaceBackend.Services.Auth;

public class AuthService(
    IHttpClientFactory httpClientFactory,
    ISpotifyTokenService spotifyTokenService,
    ILogger<AuthService> logger) : IAuthService
{
    private static string SpotifyApiBaseUrl =>
        Environment.GetEnvironmentVariable("SPOTIFY_API_BASE_URL") ?? "";

    public string GenerateSpotifyLoginUrl()
    {
        var clientId    = Environment.GetEnvironmentVariable("SPOTIFY_CLIENT_ID");
        var redirectUri = Environment.GetEnvironmentVariable("SPOTIFY_REDIRECT_URI");

        const string scopes =
            "user-read-private user-read-email user-read-recently-played " +
            "user-read-currently-playing user-read-playback-state user-top-read " +
            "user-modify-playback-state";

        var url = $"https://accounts.spotify.com/authorize" +
                  $"?response_type=code" +
                  $"&client_id={clientId}" +
                  $"&scope={Uri.EscapeDataString(scopes)}" +
                  $"&redirect_uri={Uri.EscapeDataString(redirectUri!)}" +
                  $"&show_dialog=true";

        logger.LogInformation("[Auth] Generated Spotify login URL for clientId={ClientId}", clientId);
        return url;
    }

    public Task<SpotifyTokenResponse?> ExchangeCodeForTokensAsync(string code)
        => spotifyTokenService.ExchangeCodeForTokensAsync(code);

    public async Task<SpotifyProfileDto> GetSpotifyUserProfileAsync(string accessToken)
    {
        logger.LogInformation("[Auth] Fetching Spotify user profile. BaseUrl={Url}", SpotifyApiBaseUrl);

        var client = httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", accessToken);

        var profileResponse = await client.GetAsync(SpotifyApiBaseUrl);

        if (!profileResponse.IsSuccessStatusCode)
        {
            var body = await profileResponse.Content.ReadAsStringAsync();
            logger.LogError("[Auth] Failed to fetch Spotify profile. Status={Status} Body={Body}",
                profileResponse.StatusCode, body);
            
            if ((int)profileResponse.StatusCode == 429) 
            {
                if (profileResponse.Headers.TryGetValues("Retry-After", out var values))
                {
                    var retryAfter = values.First();
                    Console.WriteLine($"[RATE LIMIT] Spotify says wait {retryAfter} seconds.");
                }
            }
            throw new HttpRequestException($"Spotify API error: {profileResponse.StatusCode}");
        }

        var profileJson = await profileResponse.Content.ReadAsStringAsync();

        var spotifyProfile = JsonSerializer.Deserialize<SpotifyProfileDto>(profileJson);
        if (spotifyProfile == null)
            throw new JsonException("Failed to deserialize Spotify user profile");

        logger.LogInformation("[Auth] Fetched profile for Spotify user {SpotifyId}", spotifyProfile.Id);
        return spotifyProfile;
    }
}