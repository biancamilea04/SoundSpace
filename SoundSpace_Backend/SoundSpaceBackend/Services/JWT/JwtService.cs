using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using SoundSpaceBackend.Models.DTOs;
using SoundSpaceBackend.Services.JWT.Abstractions;
using SoundSpaceBackend.Services.JWT.DTOs;

namespace SoundSpaceBackend.Services.JWT;

public class JwtService(IConfiguration configuration) : IJwtService
{
    private readonly IConfiguration _configuration = configuration;
    
    public string GenerateToken(UserJwtDto userDto)
    {
        var secretKey = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key is not configured.");
        var issuer = _configuration["Jwt:Issuer"];
        var audience = _configuration["Jwt:Audience"];
        var expirationMinutes = int.Parse(_configuration["Jwt:ExpirationMinutes"] ?? "60");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, userDto.Id),
            new Claim(JwtRegisteredClaimNames.UniqueName, userDto.DisplayName),
            new Claim(JwtRegisteredClaimNames.Email, userDto.Email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(JwtRegisteredClaimNames.Iat, new DateTimeOffset(DateTime.UtcNow).ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64)
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
}