using SoundSpaceBackend.Controllers.Auth.Responses;
using SoundSpaceBackend.Controllers.Users.Responses;
using SoundSpaceBackend.Services.SpotifyPlayer.DTOs;
using SoundSpaceBackend.Services.User.DTOs;
using UserEntity = SoundSpaceBackend.Models.Entities.User;

namespace SoundSpaceBackend.Services.User.Abstractions;

public interface IUserService
{
    public Task<GetUserDto> GetUserBySpotifyIdAsync(string spotifyId);
    public Task<UserEntity> GetUserEntityBySpotifyIdAsync(string spotifyId);
    public Task<GetUserDto> GetUserByDisplayNameAsync(string displayName);
    public Task<UserEntity> CreateOrUpdateUserAsync(SpotifyAuthResponseDto spotifyProfileAuthResponse);
    public Task<List<UserSearchResultDto>> SearchUsersAsync(string query, Guid excludeUserId);
    public Task<List<TopArtistResponse>> GetTopArtistsByUserIdAsync(Guid userId);
    public Task<List<TopTrackResponse>> GetTopTracksByUserIdAsync(Guid userId);
    public Task<List<RecentStreamResponse>> GetRecentStreamsByUserIdAsync(Guid userId, int limit);
    public Task<UserMusicStatusResponse?> GetUserMusicStatusByDisplayNameAsync(string displayName);
    public Task UpdateLocationAsync(Guid userId, double latitude, double longitude);
}