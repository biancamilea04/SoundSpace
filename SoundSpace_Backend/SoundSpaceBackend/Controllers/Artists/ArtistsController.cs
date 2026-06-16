using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SoundSpaceBackend.Services.SpotifyPlayer.Abstractions;

namespace SoundSpaceBackend.Controllers.Artists;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ArtistsController(ISpotifyPlayerService spotifyPlayerService) : ControllerBase
{
    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q) || q.Length < 2)
            return Ok(Array.Empty<object>());

        var spotifyId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (spotifyId is null) return Unauthorized();

        try
        {
            var results = await spotifyPlayerService.SearchArtistsAsync(spotifyId, q);
            return Ok(results);
        }
        catch (HttpRequestException ex) when (ex.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
        {
            return StatusCode(429, "Rate limited by Spotify. Please try again shortly.");
        }
    }
}
