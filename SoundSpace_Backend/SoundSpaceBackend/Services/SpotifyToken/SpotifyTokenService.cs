using System.Net.Http.Headers;
using Microsoft.Extensions.Logging;
using SoundSpaceBackend.Models.DTOs;
using SoundSpaceBackend.Persistence;
using SoundSpaceBackend.Services.SpotifyToken.Abstractions;

namespace SoundSpaceBackend.Services.SpotifyToken;

public class SpotifyTokenService(
    ApplicationContext dbContext,
    IHttpClientFactory httpClientFactory,
    ILogger<SpotifyTokenService> logger) : ISpotifyTokenService
{
    private static string SpotifyTokenUrl =>
        Environment.GetEnvironmentVariable("SPOTIFY_API_TOKEN_URL")
        ?? "https://accounts.spotify.com/api/token";


    public async Task<SpotifyTokenResponse?> ExchangeCodeForTokensAsync(string code)
    {
        var clientId     = Environment.GetEnvironmentVariable("SPOTIFY_CLIENT_ID");
        var clientSecret = Environment.GetEnvironmentVariable("SPOTIFY_CLIENT_SECRET");
        var redirectUri  = Environment.GetEnvironmentVariable("SPOTIFY_REDIRECT_URI");

        logger.LogInformation("[SpotifyToken] Exchanging code. TokenUrl={Url} RedirectUri={Uri}",
            SpotifyTokenUrl, redirectUri);

        var client = httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Basic",
                Convert.ToBase64String(
                    System.Text.Encoding.UTF8.GetBytes($"{clientId}:{clientSecret}")));

        var body = new FormUrlEncodedContent([
            new KeyValuePair<string, string>("grant_type", "authorization_code"),
            new KeyValuePair<string, string>("code", code),
            new KeyValuePair<string, string>("redirect_uri", redirectUri!)
        ]);

        var response = await client.PostAsync(SpotifyTokenUrl, body);

        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync();
            logger.LogError("[SpotifyToken] Token exchange failed. Status={Status} Body={Body}",
                response.StatusCode, errorBody);
            return null;
        }

        return await response.Content.ReadFromJsonAsync<SpotifyTokenResponse>();
    }

    public async Task<SpotifyTokenResponse?> RefreshAccessTokenAsync(string refreshToken)
    {
        var clientId     = Environment.GetEnvironmentVariable("SPOTIFY_CLIENT_ID");
        var clientSecret = Environment.GetEnvironmentVariable("SPOTIFY_CLIENT_SECRET");

        var client = httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Basic",
                Convert.ToBase64String(
                    System.Text.Encoding.UTF8.GetBytes($"{clientId}:{clientSecret}")));

        var body = new FormUrlEncodedContent([
            new KeyValuePair<string, string>("grant_type", "refresh_token"),
            new KeyValuePair<string, string>("refresh_token", refreshToken)
        ]);

        var response = await client.PostAsync(SpotifyTokenUrl, body);

        if (response.IsSuccessStatusCode) return await response.Content.ReadFromJsonAsync<SpotifyTokenResponse>();
        
        var errorBody = await response.Content.ReadAsStringAsync();
        logger.LogError("[SpotifyToken] Token refresh failed. Status={Status} Body={Body}",
            response.StatusCode, errorBody);
        return null;

    }

    public async Task<string?> GetValidAccessTokenAsync(string spotifyId)
    {
        var user = dbContext.Users.FirstOrDefault(u => u.SpotifyId == spotifyId);
        if (user == null) return null;

        if (user.SpotifyTokenExpiresAt > DateTime.UtcNow.AddSeconds(60))
            return user.SpotifyAccessToken;

        if (string.IsNullOrEmpty(user.SpotifyRefreshToken))
            return null;

        var newTokens = await RefreshAccessTokenAsync(user.SpotifyRefreshToken);
        if (newTokens == null) return null;

        user.SpotifyAccessToken    = newTokens.AccessToken;
        user.SpotifyTokenExpiresAt = DateTime.UtcNow.AddSeconds(newTokens.ExpiresIn);

        if (!string.IsNullOrEmpty(newTokens.RefreshToken))
            user.SpotifyRefreshToken = newTokens.RefreshToken;

        dbContext.Users.Update(user);
        await dbContext.SaveChangesAsync();

        return newTokens.AccessToken;
    }
}
