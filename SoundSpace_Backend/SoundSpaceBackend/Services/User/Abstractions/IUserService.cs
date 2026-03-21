using SoundSpaceBackend.Controllers.Auth.Responses;
using SoundSpaceBackend.Services.User.DTOs;

namespace SoundSpaceBackend.Services.User.Abstractions;

public interface IUserService
{
 public Task<GetUserDto> GetUserBySpotifyIdAsync(string  spotifyId);
 public Task CreateOrUpdateUserAsync(SpotifyAuthResponseDto spotifyProfileAuthResponse);
}