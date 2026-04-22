using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SoundSpaceBackend.Controllers.Users.Responses;
using SoundSpaceBackend.Services.SpotifyPlayer.Abstractions;
using SoundSpaceBackend.Services.User.Abstractions;

namespace SoundSpaceBackend.Controllers.Users;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController(
    IUserService _userService,
    ISpotifyPlayerService _spotifyPlayerService,
    ILogger<UsersController> _logger) : ControllerBase
{
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
        var userProfileResponse = new UserProfileResponse(user.SpotifyId, user.DisplayName, user.ProfileImageUrl, user.Email, user.Country, user.Followers);
        
        return Ok(userProfileResponse);
    }

    [HttpGet("profile/{displayName}")]
    public async Task<IActionResult> GetUserProfileByDisplayName(string displayName)
    {
        try
        {
            var user = await _userService.GetUserByDisplayNameAsync(displayName);
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
}