using SoundSpaceBackend.Models.DTOs;

namespace SoundSpaceBackend.Services.Abstractions;

public interface IAuthService
{
    string GenerateSpotifyLoginUrl();
    Task<SpotifyTokenResponse?> ExchangeCodeForTokensAsync(string code);
    Task<string?> GetSpotifyUserProfileAsync(string accessToken);
}