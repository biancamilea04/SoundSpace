using Microsoft.AspNetCore.Mvc;
using SoundSpaceBackend.Controllers.Auth.Responses;
using SoundSpaceBackend.Services.Auth.Abstractions;
using SoundSpaceBackend.Services.User.Abstractions;

namespace SoundSpaceBackend.Controllers.Auth;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthService authService, IUserService userService) : ControllerBase
{
    private readonly IAuthService _authService = authService;
    private readonly IUserService _userService = userService;
    
    [HttpGet("/auth")]
    public IActionResult Auth()
    {
        var spotifyAuthUrl = _authService.GenerateSpotifyLoginUrl();
        return Redirect(spotifyAuthUrl);
    }
    
    [HttpGet("callback")]
    public async Task<IActionResult> Callback([FromQuery] string code)
    {
        if (string.IsNullOrEmpty(code))
        {
            return BadRequest("Authentification code is missing");
        }
        
        var tokenData = await _authService.ExchangeCodeForTokensAsync(code);
        if (tokenData == null)
        {
            return BadRequest("Error exchanging code for tokens.");
        }
        
        var profileJson = await _authService.GetSpotifyUserProfileAsync(tokenData.AccessToken);
        
        var spotifyTokensDto = new SpotifyTokensDto
        {
            AccessToken = tokenData.AccessToken,
            TokenType = tokenData.TokenType,
            ExpiresIn = tokenData.ExpiresIn,
            RefreshToken = tokenData.RefreshToken,
            Scope = tokenData.Scope
        };
        
        var spotifyResponseDto = new SpotifyAuthResponseDto
        {
            Message = "Successfully authenticated with Spotify",
            Tokens = spotifyTokensDto,
            UserProfile = profileJson
        };
        
        await _userService.CreateOrUpdateUserAsync(spotifyResponseDto);
        
        return Ok(spotifyResponseDto);
    }
}