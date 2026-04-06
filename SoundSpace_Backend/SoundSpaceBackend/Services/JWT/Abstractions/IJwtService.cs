using SoundSpaceBackend.Models.Entities;
using SoundSpaceBackend.Services.JWT.DTOs;

namespace SoundSpaceBackend.Services.JWT.Abstractions;

public interface IJwtService
{
    string GenerateToken(UserJwtDto userDto);

    Task<AppRefreshToken> GenerateRefreshTokenAsync(Guid userId);

    Task<(string AccessToken, string RefreshToken)?> ValidateRefreshTokenAndRotateAsync(string refreshToken);
}
