using SoundSpaceBackend.Controllers.Auth.Responses;
using SoundSpaceBackend.Models.DTOs;

namespace SoundSpaceBackend.Services.Auth.Abstractions;

public interface IAuthService
{
    string GenerateSpotifyLoginUrl();
    Task<SpotifyTokenResponse?> ExchangeCodeForTokensAsync(string code);
    Task<SpotifyProfileDto> GetSpotifyUserProfileAsync(string accessToken);
}