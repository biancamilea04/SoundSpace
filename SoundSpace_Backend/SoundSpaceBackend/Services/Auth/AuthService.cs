using System.Net.Http.Headers;
using System.Text.Json;
using SoundSpaceBackend.Controllers.Auth.Responses;
using SoundSpaceBackend.Models.DTOs;
using SoundSpaceBackend.Services.Abstractions;

namespace SoundSpaceBackend.Services.Auth;

public class AuthService(IHttpClientFactory httpClientFactory) :  IAuthService
{
    private static readonly string SpotifyApiBaseUrl = Environment.GetEnvironmentVariable("SPOTIFY_API_BASE_URL") ?? "";
    private static readonly string SpotifyApiTokenUrl = Environment.GetEnvironmentVariable("SPOTIFY_API_TOKEN_URL") ?? "";
    public async Task<UserDto> SyncSpotifyUserAsync(string accessToken)
    {
        // This method would contain logic to fetch the user's Spotify profile using the access token,
        // and then create or update a corresponding User record in your database.
        // For now, we'll return an empty UserDto as a placeholder.
        return new UserDto();
    }
    
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

        var tokenResponse = await client.PostAsync(SpotifyApiTokenUrl, tokenRequest);
        
        if (!tokenResponse.IsSuccessStatusCode) 
            return null;

        return await tokenResponse.Content.ReadFromJsonAsync<SpotifyTokenResponse>();
    }

    public async Task<SpotifyProfileDto> GetSpotifyUserProfileAsync(string accessToken)
    {
        var client = httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        
        var profileResponse = await client.GetAsync(SpotifyApiBaseUrl);
        
        if (!profileResponse.IsSuccessStatusCode) 
            throw new HttpRequestException($"Spotify API error: {profileResponse.StatusCode}");
        
        var profileJson = await profileResponse.Content.ReadAsStringAsync();
        if (profileJson == null)
            throw new HttpRequestException($"The Spotify API returned an empty response for the user profile");
        
        var spotifyProfile = JsonSerializer.Deserialize<SpotifyProfileDto>(profileJson);
        if (spotifyProfile == null)
            throw new JsonException("Failed to deserialize Spotify user profile");

        return spotifyProfile;
    }
}