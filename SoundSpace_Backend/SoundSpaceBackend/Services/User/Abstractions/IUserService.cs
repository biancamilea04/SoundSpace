using SoundSpaceBackend.Controllers.Auth.Responses;
using SoundSpaceBackend.Services.User.DTOs;
using UserEntity = SoundSpaceBackend.Models.Entities.User;

namespace SoundSpaceBackend.Services.User.Abstractions;

public interface IUserService
{
    public Task<GetUserDto> GetUserBySpotifyIdAsync(string spotifyId);
    public Task<GetUserDto> GetUserByDisplayNameAsync(string displayName);
    public Task<UserEntity> CreateOrUpdateUserAsync(SpotifyAuthResponseDto spotifyProfileAuthResponse);
}