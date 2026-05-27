
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SoundSpaceBackend.Controllers.Posts.Responses;
using SoundSpaceBackend.Controllers.Users.Responses;
using SoundSpaceBackend.Services.Like.Abstractions;
using SoundSpaceBackend.Services.SpotifyPlayer.Abstractions;
using SoundSpaceBackend.Services.User.Abstractions;

namespace SoundSpaceBackend.Controllers.Users;

[ApiController]
[Route("api/users")]
[Authorize]
public class UsersController(
    IUserService _userService,
    ISpotifyPlayerService _spotifyPlayerService,
    ILikeService _likeService,
    ILogger<UsersController> _logger) : ControllerBase
{
    private async Task<Guid?> GetDbUserIdAsync()
    {
        var spotifyId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (spotifyId == null) return null;
        var entity = await _userService.GetUserEntityBySpotifyIdAsync(spotifyId);
        return entity?.Id;
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetUserProfile()
    {
        var spotifyId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (spotifyId == null)
        {
            _logger.LogWarning( $"Spotify ID claim is missing in the token");
            return Unauthorized();
        }

        var user = await _userService.GetUserBySpotifyIdAsync(spotifyId);
        var userProfileResponse = new UserProfileResponse(user.Id, user.SpotifyId, user.DisplayName, user.ProfileImageUrl, user.Email, user.Country, user.Followers);
        
        return Ok(userProfileResponse);
    }

    [HttpGet("profile/{displayName}")]
    public async Task<IActionResult> GetUserProfileByDisplayName(string displayName)
    {
        try
        {
            var user = await _userService.GetUserByDisplayNameAsync(displayName);
            var userProfileResponse = new UserProfileResponse(user.Id, user.SpotifyId, user.DisplayName, user.ProfileImageUrl, user.Email, user.Country, user.Followers);
            return Ok(userProfileResponse);
        }
        catch (Exception)
        {
            return NotFound();
        }
    }

    [HttpGet("now-playing")]
    public async Task<IActionResult> GetNowPlaying()
    {
        var spotifyId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (spotifyId == null)
        {
            _logger.LogWarning("Spotify ID claim is missing in the token");
            return Unauthorized();
        }

        var result = await _spotifyPlayerService.GetCurrentlyPlayingTrackAsync(spotifyId);
        if (result == null)
            return NoContent(); 

        return Ok(result);
    }

    [HttpGet("top-artists")]
    public async Task<IActionResult> GetTopArtists()
    {
        var spotifyId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (spotifyId == null)
        {
            _logger.LogWarning("Spotify ID claim is missing in the token");
            return Unauthorized();
        }

        var result = await _spotifyPlayerService.GetTopArtistsAsync(spotifyId);
        return Ok(result);
    }

    [HttpGet("top-tracks")]
    public async Task<IActionResult> GetTopTracks()
    {
        var spotifyId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (spotifyId == null)
        {
            _logger.LogWarning("Spotify ID claim is missing in the token");
            return Unauthorized();
        }

        var result = await _spotifyPlayerService.GetTopTracksAsync(spotifyId);
        return Ok(result);
    }

    [HttpGet("recent-streams")]
    public async Task<IActionResult> GetRecentStreams([FromQuery] int limit = 5)
    {
        var spotifyId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (spotifyId == null)
        {
            _logger.LogWarning("Spotify ID claim is missing in the token");
            return Unauthorized();
        }

        var result = await _spotifyPlayerService.GetRecentStreamsAsync(spotifyId, limit);
        return Ok(result);
    }

    [HttpGet("top-genres")]
    public async Task<IActionResult> GetTopGenres([FromQuery] int maxGenres = 10)
    {
        var spotifyId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (spotifyId == null)
        {
            _logger.LogWarning("Spotify ID claim is missing in the token");
            return Unauthorized();
        }

        var result = await _spotifyPlayerService.GetTopGenresAsync(spotifyId, maxGenres);
        return Ok(result);
    }

    [HttpGet("{username}/top-artists")]
    public async Task<IActionResult> GetTopArtistsByUsername(string username)
    {
        try
        {
            var user = await _userService.GetUserByDisplayNameAsync(username);
            var result = await _userService.GetTopArtistsByUserIdAsync(user.Id);
            return Ok(result);
        }
        catch (Exception)
        {
            return NotFound();
        }
    }

    [HttpGet("{username}/top-tracks")]
    public async Task<IActionResult> GetTopTracksByUsername(string username)
    {
        try
        {
            var user = await _userService.GetUserByDisplayNameAsync(username);
            var result = await _userService.GetTopTracksByUserIdAsync(user.Id);
            return Ok(result);
        }
        catch (Exception)
        {
            return NotFound();
        }
    }

    [HttpGet("{username}/music-status")]
    public async Task<IActionResult> GetMusicStatusByUsername(string username)
    {
        var status = await _userService.GetUserMusicStatusByDisplayNameAsync(username);
        if (status == null) return NotFound();
        return Ok(status);
    }

    [HttpGet("{username}/recent-streams")]
    public async Task<IActionResult> GetRecentStreamsByUsername(string username, [FromQuery] int limit = 5)
    {
        try
        {
            var user = await _userService.GetUserByDisplayNameAsync(username);
            var result = await _userService.GetRecentStreamsByUserIdAsync(user.Id, limit);
            return Ok(result);
        }
        catch (Exception)
        {
            return NotFound();
        }
    }

    [HttpGet("{username}/top-genres")]
    public async Task<IActionResult> GetTopGenresByUsername(string username, [FromQuery] int maxGenres = 10)
    {
        try
        {
            var user = await _userService.GetUserByDisplayNameAsync(username);
            var result = await _spotifyPlayerService.GetTopGenresAsync(user.SpotifyId, maxGenres);
            return Ok(result);
        }
        catch (Exception)
        {
            return NotFound();
        }
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchUsers([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q) || q.Trim().Length < 2)
            return BadRequest("Query must be at least 2 characters.");

        var spotifyId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (spotifyId == null)
            return Unauthorized();

        var currentUser = await _userService.GetUserEntityBySpotifyIdAsync(spotifyId);
        var results = await _userService.SearchUsersAsync(q, currentUser.Id);
        return Ok(results);
    }

    [HttpGet("liked-posts")]
    public async Task<IActionResult> GetLikedPosts()
    {
        var userId = await GetDbUserIdAsync();
        if (userId is null) return Unauthorized();

        var posts = await _likeService.GetLikedPostsByUserAsync(userId.Value);
        var likeMap = await _likeService.GetLikeStatusBatchAsync(posts.Select(p => p.Id), userId.Value);

        var response = posts.Select(p =>
        {
            var likes = likeMap[p.Id];
            return new PostResponse(p.Id, p.UserId, p.DisplayName, p.ProfileImageUrl,
                p.Content, p.SpotifyUri, p.SpotifyName, p.SpotifyCoverUrl,
                p.SpotifySubtitle, p.SpotifyMediaType, p.PreviewUrl,
                p.PreviewStartSecond, p.PreviewDuration,
                p.CreatedAt, likes.LikeCount, likes.IsLikedByCurrentUser);
        });

        return Ok(response);
    }
}