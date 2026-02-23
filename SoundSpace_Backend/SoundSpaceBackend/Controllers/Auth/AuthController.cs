using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using SoundSpaceBackend.Services.Abstractions;

namespace SoundSpaceBackend.Controllers.Auth;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthService authService) : ControllerBase
{
    private readonly IAuthService _authService = authService;
    
    [HttpGet("login")]
    public IActionResult Login()
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
        if (profileJson == null)
        {
            return BadRequest("Error fetching Spotify user profile.");
        }
        
        return Ok(new
        {
            Message = "Successfully authenticated with Spotify",
            Tokens = tokenData,
            UserProfile = JsonSerializer.Deserialize<object>(profileJson)
        });
    }
}