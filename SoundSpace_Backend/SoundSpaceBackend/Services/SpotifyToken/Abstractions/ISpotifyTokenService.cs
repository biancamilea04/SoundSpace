using SoundSpaceBackend.Models.DTOs;
using SoundSpaceBackend.Persistence;

namespace SoundSpaceBackend.Services.SpotifyToken.Abstractions;

public interface ISpotifyTokenService
{
    Task<SpotifyTokenResponse?> ExchangeCodeForTokensAsync(string code);

    Task<SpotifyTokenResponse?> RefreshAccessTokenAsync(string refreshToken);

    Task<string?> GetValidAccessTokenAsync(string spotifyId);
}
