using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SoundSpaceBackend.Models.Entities;
using SoundSpaceBackend.Persistence;
using SoundSpaceBackend.Services.JWT.Abstractions;
using SoundSpaceBackend.Services.JWT.DTOs;

namespace SoundSpaceBackend.Services.JWT;

public class JwtService(IConfiguration configuration, ApplicationContext dbContext) : IJwtService
{
    private readonly IConfiguration _configuration = configuration;
    private readonly ApplicationContext _dbContext = dbContext;

    public string GenerateToken(UserJwtDto userDto)
    {
        var secretKey          = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key is not configured.");
        var issuer             = _configuration["Jwt:Issuer"];
        var audience           = _configuration["Jwt:Audience"];
        var expirationMinutes  = int.Parse(_configuration["Jwt:ExpirationMinutes"] ?? "60");

        var key         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub,        userDto.Id),
            new Claim(JwtRegisteredClaimNames.UniqueName, userDto.DisplayName),
            new Claim(JwtRegisteredClaimNames.Email,      userDto.Email),
            new Claim(JwtRegisteredClaimNames.Jti,        Guid.NewGuid().ToString()),
            new Claim(JwtRegisteredClaimNames.Iat,
                      new DateTimeOffset(DateTime.UtcNow).ToUnixTimeSeconds().ToString(),
                      ClaimValueTypes.Integer64)
        };

        var token = new JwtSecurityToken(
            issuer,
            audience,
            claims,
            expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public async Task<AppRefreshToken> GenerateRefreshTokenAsync(Guid userId)
    {
        var expirationDays = int.Parse(_configuration["Jwt:RefreshTokenExpirationDays"] ?? "7");

        var randomBytes = RandomNumberGenerator.GetBytes(64);
        var tokenString = Convert.ToHexString(randomBytes).ToLowerInvariant();

        var refreshToken = new AppRefreshToken
        {
            Token     = tokenString,
            UserId    = userId,
            ExpiresAt = DateTime.UtcNow.AddDays(expirationDays),
        };

        _dbContext.AppRefreshTokens.Add(refreshToken);
        await _dbContext.SaveChangesAsync();

        return refreshToken;
    }


    public async Task<(string AccessToken, string RefreshToken)?> ValidateRefreshTokenAndRotateAsync(string refreshToken)
    {
        var storedToken = await _dbContext.AppRefreshTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.Token == refreshToken);

        if (storedToken == null || storedToken.IsRevoked || storedToken.ExpiresAt <= DateTime.UtcNow)
            return null;

        storedToken.IsRevoked = true;
        _dbContext.AppRefreshTokens.Update(storedToken);

        var user = storedToken.User;
        var userJwtDto   = new UserJwtDto(user.SpotifyId, user.DisplayName, user.Email ?? string.Empty);
        var newJwt       = GenerateToken(userJwtDto);
        var newRefresh   = await GenerateRefreshTokenAsync(user.Id);

        await _dbContext.SaveChangesAsync();

        return (newJwt, newRefresh.Token);
    }
}
