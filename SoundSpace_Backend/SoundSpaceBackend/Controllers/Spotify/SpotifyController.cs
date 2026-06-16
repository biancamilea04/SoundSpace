using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SoundSpaceBackend.Services.PreviewUrl.Abstractions;
using SoundSpaceBackend.Services.SpotifyPlayer.Abstractions;

namespace SoundSpaceBackend.Controllers.Spotify;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SpotifyController(
    ISpotifyPlayerService spotifyPlayerService,
    IPreviewUrlService previewUrlService,
    ILogger<SpotifyController> logger) : ControllerBase
{
    [HttpGet("recently-played")]
    public async Task<IActionResult> GetRecentlyPlayed([FromQuery] string type = "track")
    {
        var spotifyId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (spotifyId == null)
        {
            return Unauthorized();
        }

        var items = await spotifyPlayerService.GetRecentlyPlayedTracksAsync(spotifyId, type);
        return Ok(items);
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q)) return BadRequest("Query is required.");

        var spotifyId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (spotifyId == null) 
        {
            return Unauthorized();
        }

        try
        {
            var items = await spotifyPlayerService.SearchAsync(spotifyId, q);
            return Ok(items);
        }
        catch (HttpRequestException ex) when (ex.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
        {
            logger.LogWarning("[Spotify] Rate limited for SpotifyId={SpotifyId}", spotifyId);
            return StatusCode(429);
        }
    }

    [HttpGet("lookup")]
    public async Task<IActionResult> Lookup([FromQuery] string uri)
    {
        if (string.IsNullOrWhiteSpace(uri)) 
        {
            return BadRequest("URI is required.");
        }

        var spotifyId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (spotifyId == null) 
        {
            return Unauthorized();
        }

        var item = await spotifyPlayerService.LookupByUriAsync(spotifyId, uri);
        if (item == null)
        {
            return NotFound();
        }

        return Ok(item);
    }

    [HttpGet("preview")]
    public async Task<IActionResult> GetPreview([FromQuery] string uri, [FromQuery] string? artist, [FromQuery] string? track)
    {
        if (string.IsNullOrWhiteSpace(uri)) return BadRequest("URI is required.");

        var spotifyId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (spotifyId == null) return Unauthorized();

        var previewUrl = await previewUrlService.ResolveAsync(spotifyId, uri, artist, track);
        return Ok(new { previewUrl });
    }
}
