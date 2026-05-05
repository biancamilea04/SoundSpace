using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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

        var friend = await db.Users.FindAsync(request.FriendId);
        if (friend == null) return NotFound(new { code = "friend_not_found" });

        if (!friend.IsListening || friend.CurrentlyPlayingUri == null)
            return BadRequest(new { code = "not_listening", message = "Friend is not currently listening." });

        var elapsedMs = friend.MusicStatusUpdatedAt.HasValue
            ? (int)(DateTime.UtcNow - friend.MusicStatusUpdatedAt.Value).TotalMilliseconds
            : 0;
        var positionMs = Math.Max(0, friend.CurrentlyPlayingProgressMs + elapsedMs);

        var result = await spotifyPlayerService.PlayTrackAsync(spotifyId, friend.CurrentlyPlayingUri, positionMs);

        logger.LogInformation(
            "[ListenAlong] SpotifyId={SpotifyId} listening to FriendId={FriendId}, TrackUri={TrackUri}, PositionMs={PositionMs}, Result={Result}",
            spotifyId, request.FriendId, friend.CurrentlyPlayingUri, positionMs, result);

        return result switch
        {
            PlayTrackResultCode.Success => Ok(),
            PlayTrackResultCode.NoActiveDevice => NotFound(new
            {
                code = "no_device",
                message = "No active Spotify device found. Please open Spotify on any device."
            }),
            PlayTrackResultCode.PremiumRequired => StatusCode(403, new
            {
                code = "no_premium",
                message = "Spotify Premium is required for remote playback control."
            }),
            _ => StatusCode(500, new { code = "error" })
        };
    }
}
