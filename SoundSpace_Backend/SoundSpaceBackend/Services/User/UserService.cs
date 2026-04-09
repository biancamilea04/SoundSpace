using Microsoft.Extensions.Logging;
using SoundSpaceBackend.Controllers.Auth.Responses;
using SoundSpaceBackend.Persistence;
using SoundSpaceBackend.Services.User.Abstractions;
using SoundSpaceBackend.Services.User.DTOs;
using UserEntity = SoundSpaceBackend.Models.Entities.User;

namespace SoundSpaceBackend.Services.User;

public class UserService(
    ApplicationContext dbContext,
    ILogger<UserService> logger) : IUserService
{
    public Task<GetUserDto> GetUserBySpotifyIdAsync(string spotifyId)
    {
        logger.LogInformation("[User] Fetching profile for SpotifyId={SpotifyId}", spotifyId);

        var user = dbContext.Users.FirstOrDefault(u => u.SpotifyId == spotifyId);
        if (user == null)
        {
            logger.LogWarning("[User] User not found for SpotifyId={SpotifyId}", spotifyId);
            throw new Exception("User not found");
        }

        var dto = new GetUserDto(
            user.SpotifyId,
            user.DisplayName,
            user.ProfileImageUrl,
            user.Email ?? string.Empty,
            user.Country,
            user.Followers);

        return Task.FromResult(dto);
    }

    public Task<GetUserDto> GetUserByDisplayNameAsync(string displayName)
    {
        logger.LogInformation("[User] Fetching profile for DisplayName={DisplayName}", displayName);

        var user = dbContext.Users.FirstOrDefault(
            u => u.DisplayName.ToLower() == displayName.ToLower());
        if (user == null)
        {
            logger.LogWarning("[User] User not found for DisplayName={DisplayName}", displayName);
            throw new Exception("User not found");
        }

        var dto = new GetUserDto(
            user.SpotifyId,
            user.DisplayName,
            user.ProfileImageUrl,
            user.Email ?? string.Empty,
            user.Country,
            user.Followers);

        return Task.FromResult(dto);
    }

    public Task<UserEntity> CreateOrUpdateUserAsync(SpotifyAuthResponseDto spotifyProfileAuthResponse)
    {
        var spotifyProfile = spotifyProfileAuthResponse.UserProfile;

        logger.LogInformation("[User] CreateOrUpdate for SpotifyId={SpotifyId}", spotifyProfile.Id);

        var user = dbContext.Users.FirstOrDefault(u => u.SpotifyId == spotifyProfile.Id);
        if (user == null)
        {
            logger.LogInformation("[User] Creating new user for SpotifyId={SpotifyId}", spotifyProfile.Id);
            user = new UserEntity
            {
                SpotifyId              = spotifyProfile.Id,
                DisplayName            = spotifyProfile.DisplayName,
                Email                  = spotifyProfile.Email,
                Country                = spotifyProfile.Country,
                Followers              = spotifyProfile.Followers.Total,
                ProfileImageUrl        = spotifyProfile.Images?.FirstOrDefault()?.Url,
                SpotifyAccessToken     = spotifyProfileAuthResponse.Tokens.AccessToken,
                SpotifyRefreshToken    = spotifyProfileAuthResponse.Tokens.RefreshToken,
                SpotifyTokenExpiresIn  = spotifyProfileAuthResponse.Tokens.ExpiresIn.ToString(),
                SpotifyTokenExpiresAt  = DateTime.UtcNow.AddSeconds(spotifyProfileAuthResponse.Tokens.ExpiresIn),
            };
            dbContext.Users.Add(user);
        }
        else
        {
            logger.LogInformation("[User] Updating existing user for SpotifyId={SpotifyId}", spotifyProfile.Id);
            user.DisplayName           = spotifyProfile.DisplayName;
            user.ProfileImageUrl       = spotifyProfile.Images?.FirstOrDefault()?.Url;
            user.SpotifyAccessToken    = spotifyProfileAuthResponse.Tokens.AccessToken;
            user.SpotifyRefreshToken   = spotifyProfileAuthResponse.Tokens.RefreshToken;
            user.SpotifyTokenExpiresIn = spotifyProfileAuthResponse.Tokens.ExpiresIn.ToString();
            user.SpotifyTokenExpiresAt = DateTime.UtcNow.AddSeconds(spotifyProfileAuthResponse.Tokens.ExpiresIn);
            dbContext.Users.Update(user);
        }

        dbContext.SaveChanges();
        logger.LogInformation("[User] Saved user for SpotifyId={SpotifyId}", spotifyProfile.Id);
        return Task.FromResult(user);
    }
}