using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SoundSpaceBackend.Controllers.Music.Requests;
using SoundSpaceBackend.Persistence;
using SoundSpaceBackend.Services.SpotifyPlayer.Abstractions;
using SoundSpaceBackend.Services.SpotifyPlayer.DTOs;

namespace SoundSpaceBackend.Controllers.Music;

[ApiController]
[Route("api/music")]
[Authorize]
public class MusicController(
    ApplicationContext db,
    ISpotifyPlayerService spotifyPlayerService,
    ILogger<MusicController> logger) : ControllerBase
{
    [HttpPost("listen-along")]
    public async Task<IActionResult> ListenAlong([FromBody] ListenAlongRequest request)
    {
        var spotifyId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (spotifyId == null) return Unauthorized();

        var friend = await db.Users
            .Include(u => u.CurrentlyPlaying)
            .FirstOrDefaultAsync(u => u.Id == request.FriendId);
        if (friend == null) return NotFound(new { code = "friend_not_found" });

        if (friend.CurrentlyPlaying == null || !friend.CurrentlyPlaying.IsListening || friend.CurrentlyPlaying.Uri == null)
            return BadRequest(new { code = "not_listening", message = "Friend is not currently listening." });

        var elapsedMs = friend.CurrentlyPlaying.UpdatedAt.HasValue
            ? (int)(DateTime.UtcNow - friend.CurrentlyPlaying.UpdatedAt.Value).TotalMilliseconds
            : 0;
        var positionMs = Math.Max(0, friend.CurrentlyPlaying.ProgressMs + elapsedMs);

        var result = await spotifyPlayerService.PlayTrackAsync(spotifyId, friend.CurrentlyPlaying.Uri, positionMs);

        logger.LogInformation(
            "[ListenAlong] SpotifyId={SpotifyId} listening to FriendId={FriendId}, TrackUri={TrackUri}, PositionMs={PositionMs}, Result={Result}",
            spotifyId, request.FriendId, friend.CurrentlyPlaying!.Uri, positionMs, result);

        return result switch
        {
            PlayTrackResultCode.Success => Ok(),
            PlayTrackResultCode.NoActiveDevice => NotFound(new
            {
                code = "no_device",
                message = "No active Spotify device found. Please open Spotify on any device"
            }),
            PlayTrackResultCode.PremiumRequired => StatusCode(403, new
            {
                code = "no_premium",
                message = "Spotify Premium is required for remote playback control"
            }),
            _ => StatusCode(500, new { code = "error" })
        };
    }
}
