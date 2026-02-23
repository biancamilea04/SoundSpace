using System.Net.Http.Headers;
using SoundSpaceBackend.Models.DTOs;
using SoundSpaceBackend.Services.Abstractions;

namespace SoundSpaceBackend.Services.Auth;

public class AuthService(IHttpClientFactory httpClientFactory) :  IAuthService
{
    public string GenerateSpotifyLoginUrl()
    {
        var clientId = Environment.GetEnvironmentVariable("SPOTIFY_CLIENT_ID");
        var redirectUri = Environment.GetEnvironmentVariable("SPOTIFY_REDIRECT_URI");
        
        const string scopes = "user-read-private user-read-email user-read-recently-played";

        return $"https://accounts.spotify.com/authorize" +
               $"?response_type=code" +
               $"&client_id={clientId}" +
               $"&scope={Uri.EscapeDataString(scopes)}" +
               $"&redirect_uri={Uri.EscapeDataString(redirectUri!)}";
    }

    public async Task<SpotifyTokenResponse?> ExchangeCodeForTokensAsync(string code)
    {
        var clientId = Environment.GetEnvironmentVariable("SPOTIFY_CLIENT_ID");
        var clientSecret = Environment.GetEnvironmentVariable("SPOTIFY_CLIENT_SECRET");
        var redirectUri = Environment.GetEnvironmentVariable("SPOTIFY_REDIRECT_URI");

        var client = httpClientFactory.CreateClient();

        var tokenRequest = new FormUrlEncodedContent([
            new KeyValuePair<string, string>("grant_type", "authorization_code"),
            new KeyValuePair<string, string>("code", code),
            new KeyValuePair<string, string>("redirect_uri", redirectUri!)
        ]);

        var authHeader = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes($"{clientId}:{clientSecret}"));
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", authHeader);

        var tokenResponse = await client.PostAsync("https://accounts.spotify.com/api/token", tokenRequest);
        
        if (!tokenResponse.IsSuccessStatusCode) 
            return null;

        return await tokenResponse.Content.ReadFromJsonAsync<SpotifyTokenResponse>();
    }

    public async Task<string?> GetSpotifyUserProfileAsync(string accessToken)
    {
        var client = httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        
        var profileResponse = await client.GetAsync("https://api.spotify.com/v1/me");
        
        if (!profileResponse.IsSuccessStatusCode) 
            return null;

        return await profileResponse.Content.ReadAsStringAsync();
    }
}