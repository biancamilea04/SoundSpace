using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SoundSpaceBackend.Controllers.Users.Responses;
using SoundSpaceBackend.Services.User.Abstractions;

namespace SoundSpaceBackend.Controllers.Users;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController(IUserService userService, ILogger<UsersController> logger) : ControllerBase
{
    ILogger<UsersController> _logger = logger;
    IUserService _userService = userService;
    
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
        var userProfileResponse = new UserProfileResponse(user.DisplayName, user.ProfileImageUrl, user.Email, user.Country, user.Followers);
        
        return Ok(userProfileResponse);
    }
}