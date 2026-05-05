using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using SoundSpaceBackend.Controllers.Internal.Requests;
using SoundSpaceBackend.Hubs;
using SoundSpaceBackend.Models.Enums;
using SoundSpaceBackend.Persistence;

namespace SoundSpaceBackend.Controllers.Internal;

[ApiController]
[Route("api/internal")]
public class MusicStatusController(
    ApplicationContext db,
    IHubContext<PresenceHub> hubContext,
    PresenceTracker presenceTracker,
    IConfiguration configuration,
    ILogger<MusicStatusController> logger) : ControllerBase
{
    [HttpPost("music-status-changed")]
    public async Task<IActionResult> MusicStatusChanged([FromBody] MusicStatusChangedRequest request)
    {
        var expectedSecret = configuration["InternalApi:Secret"];
        if (!Request.Headers.TryGetValue("X-Internal-Secret", out var secret) || secret != expectedSecret)
            return Unauthorized();

        var friendIds = await db.Friendships
            .Where(f =>
                (f.SenderId == request.UserId || f.ReceiverId == request.UserId) &&
                f.Status == FriendshipStatus.Accepted)
            .Select(f => f.SenderId == request.UserId ? f.ReceiverId : f.SenderId)
            .ToListAsync();

        var onlineIds = presenceTracker.GetOnlineUsers();

        var payload = new
        {
            userId = request.UserId,
            isListening = request.IsListening,
            currentlyPlayingTitle = request.CurrentlyPlayingTitle,
            currentlyPlayingArtist = request.CurrentlyPlayingArtist,
            currentlyPlayingArtistUrl = request.CurrentlyPlayingArtistUrl,
            currentlyPlayingCoverUrl = request.CurrentlyPlayingCoverUrl,
            currentlyPlayingUri = request.CurrentlyPlayingUri,
            currentlyPlayingProgressMs = request.CurrentlyPlayingProgressMs,
            lastPlayedTitle = request.LastPlayedTitle,
            lastPlayedArtist = request.LastPlayedArtist,
            lastPlayedArtistUrl = request.LastPlayedArtistUrl,
            lastPlayedUri = request.LastPlayedUri,
            lastPlayedCoverUrl = request.LastPlayedCoverUrl,
        };

        foreach (var friendId in friendIds.Where(id => onlineIds.Contains(id)))
        {
            await hubContext.Clients
                .Group($"user-{friendId}")
                .SendAsync("UserStatusChanged", payload);
        }

        logger.LogInformation("[MusicStatus] UserStatusChanged dispatched for UserId={UserId} to {Count} online friends",
            request.UserId, friendIds.Count(id => onlineIds.Contains(id)));

        return Ok();
    }
}
