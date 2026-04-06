using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SoundSpaceBackend.Controllers.Auth.Responses;
using SoundSpaceBackend.Services.Auth.Abstractions;
using SoundSpaceBackend.Services.JWT.Abstractions;
using SoundSpaceBackend.Services.JWT.DTOs;
using SoundSpaceBackend.Services.User.Abstractions;

namespace SoundSpaceBackend.Controllers.Auth;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthService authService, IUserService userService, IJwtService jwtService) : ControllerBase
{
    private const string AccessCookieName = "access_token";

    private readonly IAuthService _authService = authService;
    private readonly IUserService _userService = userService;
    private readonly IJwtService _jwtService = jwtService;

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

        var userJwtDto = new UserJwtDto(
            profileJson.Id,
            profileJson.DisplayName,
            profileJson.Email);
        var jwtToken = _jwtService.GenerateToken(userJwtDto);

        var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "";
        return Redirect($"{frontendUrl}/api/auth/callback?token={jwtToken}");
    }

    [HttpGet("token")]
    [Authorize]
    public IActionResult GetToken()
    {
        var token = Request.Cookies[AccessCookieName];
        if (string.IsNullOrEmpty(token))
        {
            return Unauthorized();
        }
        return Ok(new { token });
    }

    [HttpGet("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete(AccessCookieName);
        return Ok();
    }
}