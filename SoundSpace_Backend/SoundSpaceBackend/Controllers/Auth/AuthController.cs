using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SoundSpaceBackend.Controllers.Auth.Requests;
using SoundSpaceBackend.Controllers.Auth.Responses;
using SoundSpaceBackend.Services.Auth.Abstractions;
using SoundSpaceBackend.Services.JWT.Abstractions;
using SoundSpaceBackend.Services.JWT.DTOs;
using SoundSpaceBackend.Services.User.Abstractions;

namespace SoundSpaceBackend.Controllers.Auth;

[ApiController]
[Route("api/[controller]")]
public class AuthController(
    IAuthService authService,
    IUserService userService,
    IJwtService jwtService) : ControllerBase
{
    private const string AccessCookieName = "access_token";

    private readonly IAuthService _authService = authService;
    private readonly IUserService _userService = userService;
    private readonly IJwtService  _jwtService  = jwtService;

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
            return BadRequest("Authentication code is missing.");

        var tokenData = await _authService.ExchangeCodeForTokensAsync(code);
        if (tokenData == null)
            return BadRequest("Error exchanging code for tokens.");

        var profileJson = await _authService.GetSpotifyUserProfileAsync(tokenData.AccessToken);

        var spotifyTokensDto = new SpotifyTokensDto
        {
            AccessToken  = tokenData.AccessToken,
            TokenType    = tokenData.TokenType,
            ExpiresIn    = tokenData.ExpiresIn,
            RefreshToken = tokenData.RefreshToken,
            Scope        = tokenData.Scope
        };

        var spotifyResponseDto = new SpotifyAuthResponseDto
        {
            Message     = "Successfully authenticated with Spotify",
            Tokens      = spotifyTokensDto,
            UserProfile = profileJson
        };

        var user = await _userService.CreateOrUpdateUserAsync(spotifyResponseDto);

        var userJwtDto = new UserJwtDto(
            profileJson.Id,
            profileJson.DisplayName,
            profileJson.Email);
        
        var jwtToken = _jwtService.GenerateToken(userJwtDto);
        var appRefreshToken = await _jwtService.GenerateRefreshTokenAsync(user.Id);
        
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,   
            Secure = true,     
            SameSite = SameSiteMode.Lax,
            Expires = DateTimeOffset.UtcNow.AddDays(7) 
        };
        
        Response.Cookies.Append("access_token", jwtToken, cookieOptions);
        Response.Cookies.Append("refresh_token", appRefreshToken.Token, cookieOptions);

        var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "";
        return Redirect(
            $"{frontendUrl}/api/auth/callback" +
            $"?token={jwtToken}" +
            $"&refresh_token={appRefreshToken.Token}");
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken))
            return BadRequest("Refresh token is required.");

        var result = await _jwtService.ValidateRefreshTokenAndRotateAsync(request.RefreshToken);

        if (result is null)
            return Unauthorized(new { message = "Invalid, expired, or already-used refresh token." });

        return Ok(new
        {
            accessToken  = result.Value.AccessToken,
            refreshToken = result.Value.RefreshToken
        });
    }

    [HttpGet("token")]
    [Authorize]
    public IActionResult GetToken()
    {
        var token = Request.Cookies[AccessCookieName];
        if (string.IsNullOrEmpty(token))
            return Unauthorized();

        return Ok(new { token });
    }

    [HttpGet("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete(AccessCookieName);
        return Ok();
    }
}
