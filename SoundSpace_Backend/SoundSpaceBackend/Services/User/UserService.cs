using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SoundSpaceBackend.Controllers.Auth.Responses;
using SoundSpaceBackend.Controllers.Users.Responses;
using SoundSpaceBackend.Persistence;
using SoundSpaceBackend.Services.SpotifyPlayer.DTOs;
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
            user.Id,
            user.SpotifyId,
            user.DisplayName,
            user.ProfileImageUrl,
            user.Email ?? string.Empty,
            user.Country,
            user.Followers);

        return Task.FromResult(dto);
    }

    public Task<UserEntity> GetUserEntityBySpotifyIdAsync(string spotifyId)
    {
        var user = dbContext.Users.FirstOrDefault(u => u.SpotifyId == spotifyId);
        if (user == null)
            throw new Exception("User not found");

        return Task.FromResult(user);
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
            user.Id,
            user.SpotifyId,
            user.DisplayName,
            user.ProfileImageUrl,
            user.Email ?? string.Empty,
            user.Country,
            user.Followers);

        return Task.FromResult(dto);
    }

    public async Task<List<UserSearchResultDto>> SearchUsersAsync(string query, Guid excludeUserId)
    {
        var q = query.Trim().ToLower();
        return await dbContext.Users
            .Where(u => u.Id != excludeUserId && u.DisplayName.ToLower().Contains(q))
            .OrderBy(u => u.DisplayName)
            .Take(20)
            .Select(u => new UserSearchResultDto(u.Id, u.DisplayName, u.ProfileImageUrl))
            .ToListAsync();
    }

    public async Task<List<TopArtistResponse>> GetTopArtistsByUserIdAsync(Guid userId)
    {
        return await dbContext.TopArtists
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.UpdatedAt)
            .ThenBy(a => a.Rank)
            .Take(5)
            .Select(a => new TopArtistResponse(a.Name, a.ImageUrl, a.SpotifyUrl, a.SpotifyArtistId))
            .ToListAsync();
    }

    public async Task<List<TopTrackResponse>> GetTopTracksByUserIdAsync(Guid userId)
    {
        return await dbContext.TopTracks
            .Where(t => t.UserId == userId)
            .OrderBy(t => t.Rank)
            .Select(t => new TopTrackResponse(t.Title, t.ArtistName, t.ArtistUrl, t.CoverUrl, t.SpotifyUrl, t.SpotifyTrackId, t.PreviewUrl))
            .ToListAsync();
    }

    public async Task<List<RecentStreamResponse>> GetRecentStreamsByUserIdAsync(Guid userId, int limit)
    {
        return await dbContext.RecentStreams
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.PlayedAt)
            .Take(limit)
            .Select(s => new RecentStreamResponse(s.Title, s.ArtistName, s.ArtistUrl, s.CoverUrl, s.SpotifyUrl, s.SpotifyTrackId, s.PlayedAt))
            .ToListAsync();
    }

    public Task<UserMusicStatusResponse?> GetUserMusicStatusByDisplayNameAsync(string displayName)
    {
        var user = dbContext.Users
            .Include(u => u.CurrentlyPlaying)
            .Include(u => u.LastPlayed)
            .FirstOrDefault(u => u.DisplayName.ToLower() == displayName.ToLower());

        if (user == null) return Task.FromResult<UserMusicStatusResponse?>(null);

        return Task.FromResult<UserMusicStatusResponse?>(new UserMusicStatusResponse(
            user.Id,
            user.CurrentlyPlaying?.IsListening ?? false,
            user.CurrentlyPlaying?.Title,
            user.CurrentlyPlaying?.Artist,
            user.CurrentlyPlaying?.ArtistUrl,
            user.CurrentlyPlaying?.CoverUrl,
            user.CurrentlyPlaying?.Uri,
            user.CurrentlyPlaying?.ProgressMs ?? 0,
            user.LastPlayed?.Title,
            user.LastPlayed?.Artist,
            user.LastPlayed?.ArtistUrl,
            user.LastPlayed?.Uri,
            user.LastPlayed?.CoverUrl
        ));
    }

    public async Task UpdateLocationAsync(Guid userId, double latitude, double longitude)
    {
        var user = await dbContext.Users.FindAsync(userId);
        if (user is null)
        {
            logger.LogWarning("[User] UpdateLocation: user {UserId} not found", userId);
            return;
        }
        user.Latitude  = latitude;
        user.Longitude = longitude;
        await dbContext.SaveChangesAsync();
        logger.LogInformation("[User] Updated location for userId={UserId}: ({Lat},{Lon})", userId, latitude, longitude);
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
