using SoundSpaceBackend.Controllers.Auth.Responses;
using SoundSpaceBackend.Models.DTOs;
using SoundSpaceBackend.Persistence;
using SoundSpaceBackend.Services.User.Abstractions;
using SoundSpaceBackend.Services.User.DTOs;

namespace SoundSpaceBackend.Services.User;

public class UserService(ApplicationContext dbContext) : IUserService
{
    private readonly ApplicationContext _dbContext = dbContext;

    public Task<GetUserDto> GetUserBySpotifyIdAsync(string spotifyId)
    {
        var user = _dbContext.Users.FirstOrDefault(u => u.SpotifyId == spotifyId);
        if (user == null)
        {
            throw new Exception("User not found");
        }

        var getUserDto = new GetUserDto(user.DisplayName, user.ProfileImageUrl);
        
        return Task.FromResult(getUserDto);
    }
    
    public Task CreateOrUpdateUserAsync(SpotifyAuthResponseDto spotifyProfileAuthResponse)
    {
        var spotifyProfile = spotifyProfileAuthResponse.UserProfile;
        
        var user = _dbContext.Users.FirstOrDefault(u => u.SpotifyId == spotifyProfile.Id);
        if (user == null)
        {
            user = new Models.Entities.User
            {
                SpotifyId = spotifyProfile.Id,
                DisplayName = spotifyProfile.DisplayName,
                Email = spotifyProfile.Email,
                Country = spotifyProfile.Country,
                Followers = spotifyProfile.Followers.Total,
                ProfileImageUrl = spotifyProfile.Images?.FirstOrDefault()?.Url,
                SpotifyAccessToken = spotifyProfileAuthResponse.Tokens.AccessToken,
                SpotifyRefreshToken = spotifyProfileAuthResponse.Tokens.RefreshToken,
                SpotifyTokenExpiresIn = spotifyProfileAuthResponse.Tokens.ExpiresIn.ToString() 
            };
            _dbContext.Users.Add(user);
        }
        else
        {
            user.DisplayName = spotifyProfile.DisplayName;
            user.ProfileImageUrl = spotifyProfile.Images?.FirstOrDefault()?.Url;
            _dbContext.Users.Update(user);
        }

        _dbContext.SaveChanges();
        
        return Task.CompletedTask;
    }
}