using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SoundSpaceBackend.Controllers.Discovery.Requests;
using SoundSpaceBackend.Services.Discovery.Abstractions;
using SoundSpaceBackend.Services.User.Abstractions;

namespace SoundSpaceBackend.Controllers.Discovery;

[ApiController]
[Route("api/discovery")]
[Authorize]
public class DiscoveryController(
    IDiscoveryService discoveryService,
    IUserService userService) : ControllerBase
{
    [HttpPost("users")]
    public async Task<IActionResult> GetDiscoveryBatch([FromBody] DiscoveryBatchRequest request)
    {
        var spotifyId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (spotifyId is null) return Unauthorized();

        var user = await userService.GetUserEntityBySpotifyIdAsync(spotifyId);
        if (user is null) return Unauthorized();

        var limit    = Math.Clamp(request.Limit ?? 10, 1, 50);
        var seenIds  = request.SeenUserIds ?? [];

        var results = await discoveryService.GetDiscoveryBatchAsync(user.Id, seenIds, limit);
        return Ok(results);
    }
}
