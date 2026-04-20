using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SoundSpaceBackend.Controllers.Users.Responses;
using SoundSpaceBackend.Services.SpotifyPlayer.Abstractions;
using SoundSpaceBackend.Services.User.Abstractions;

namespace SoundSpaceBackend.Controllers.Users;

[ApiController]
[Route("api/users")]
[Authorize]
public class UsersController(
    IUserService userService,
    ISpotifyPlayerService spotifyPlayerService,
    ILogger<UsersController> logger) : ControllerBase
{
    private readonly ILogger<UsersController> _logger = logger;
    private readonly IUserService _userService = userService;
    private readonly ISpotifyPlayerService _spotifyPlayerService = spotifyPlayerService;
    
    [HttpGet("profile")]
    public async Task<IActionResult> GetUserProfile()
    {
        var spotifyId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (spotifyId == null)
        {
            _logger.LogWarning( $"Spotify ID claim is missing in the token");
            return Unauthorized();
        }

        var user = await userService.GetUserBySpotifyIdAsync(spotifyId);
        var userProfileResponse = new UserProfileResponse(user.SpotifyId, user.DisplayName, user.ProfileImageUrl, user.Email, user.Country, user.Followers);
        
        return Ok(userProfileResponse);
    }

    [HttpGet("profile/{displayName}")]
    public async Task<IActionResult> GetUserProfileByDisplayName(string displayName)
    {
        try
        {
            var user = await userService.GetUserByDisplayNameAsync(displayName);
            var userProfileResponse = new UserProfileResponse(user.SpotifyId, user.DisplayName, user.ProfileImageUrl, user.Email, user.Country, user.Followers);
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
}