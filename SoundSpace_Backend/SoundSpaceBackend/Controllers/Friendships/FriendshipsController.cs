using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SoundSpaceBackend.Controllers.Friendships.Requests;
using SoundSpaceBackend.Controllers.Friendships.Responses;
using SoundSpaceBackend.Hubs;

using SoundSpaceBackend.Services.Friendship.Abstractions;
using SoundSpaceBackend.Services.Friendship.DTOs;
using SoundSpaceBackend.Services.User.Abstractions;

namespace SoundSpaceBackend.Controllers.Friendships;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FriendshipsController(
    IFriendshipService friendshipService,
    IUserService userService,
    PresenceTracker presenceTracker,
    ILogger<FriendshipsController> logger) : ControllerBase
{
    private readonly ILogger<FriendshipsController> _logger = logger;

    private async Task<Guid?> ResolveUserIdAsync()
    {
        var spotifyId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (spotifyId == null) return null;
        var entity = await userService.GetUserEntityBySpotifyIdAsync(spotifyId);
        return entity?.Id;
    }

    [HttpPost]
    public async Task<IActionResult> SendRequest([FromBody] SendFriendRequestRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = await ResolveUserIdAsync();
        if (userId is null)
        {
            _logger.LogWarning("[Friendships] Spotify ID claim missing in token");
            return Unauthorized();
        }

        try
        {
            var dto = await friendshipService.SendRequestAsync(userId.Value, request.TargetUserId);
            return Created($"/api/friendships/{dto.Id}", ToResponse(dto));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpGet("status/{targetUserId:guid}")]
    public async Task<IActionResult> GetStatus(Guid targetUserId)
    {
        var userId = await ResolveUserIdAsync();
        if (userId is null)
        {
            _logger.LogWarning("[Friendships] Spotify ID claim missing in token");
            return Unauthorized();
        }

        var dto = await friendshipService.GetStatusAsync(userId.Value, targetUserId);
        if (dto is null)
            return NoContent();

        return Ok(ToResponse(dto));
    }

    [HttpGet("requests/incoming")]
    public async Task<IActionResult> GetIncomingRequests()
    {
        var userId = await ResolveUserIdAsync();
        if (userId is null)
        {
            _logger.LogWarning("[Friendships] Spotify ID claim missing in token");
            return Unauthorized();
        }

        var requests = await friendshipService.GetIncomingRequestsAsync(userId.Value);
        return Ok(requests.Select(ToResponse));
    }

    [HttpGet("requests/history")]
    public async Task<IActionResult> GetRequestHistory()
    {
        var userId = await ResolveUserIdAsync();
        if (userId is null)
        {
            _logger.LogWarning("[Friendships] Spotify ID claim missing in token");
            return Unauthorized();
        }

        var history = await friendshipService.GetRequestHistoryAsync(userId.Value);
        return Ok(history.Select(ToResponse));
    }

    [HttpPatch("{id:guid}/accept")]
    public async Task<IActionResult> Accept(Guid id)
    {
        var userId = await ResolveUserIdAsync();
        if (userId is null)
        {
            _logger.LogWarning("[Friendships] Spotify ID claim missing in token");
            return Unauthorized();
        }

        try
        {
            var dto = await friendshipService.AcceptAsync(id, userId.Value);
            return Ok(ToResponse(dto));
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpPatch("{id:guid}/reject")]
    public async Task<IActionResult> Reject(Guid id)
    {
        var userId = await ResolveUserIdAsync();
        if (userId is null)
        {
            _logger.LogWarning("[Friendships] Spotify ID claim missing in token");
            return Unauthorized();
        }

        try
        {
            var dto = await friendshipService.RejectAsync(id, userId.Value);
            return Ok(ToResponse(dto));
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpGet("friends/activity")]
    public async Task<IActionResult> GetFriendsActivity()
    {
        var userId = await ResolveUserIdAsync();
        if (userId is null)
        {
            _logger.LogWarning("[Friendships] Spotify ID claim missing in token");
            return Unauthorized();
        }

        var onlineUsers = presenceTracker.GetOnlineUsers();
        var dtos = await friendshipService.GetFriendsActivityAsync(userId.Value, onlineUsers);

        return Ok(dtos.Select(d => new FriendActivityResponse(
            d.UserId, d.DisplayName, d.ProfileImageUrl,
            d.IsOnline, d.IsListening,
            d.CurrentlyPlayingTitle, d.CurrentlyPlayingArtist, d.CurrentlyPlayingArtistUrl,
            d.CurrentlyPlayingCoverUrl, d.CurrentlyPlayingUri, d.CurrentlyPlayingProgressMs,
            d.LastPlayedTitle, d.LastPlayedArtist, d.LastPlayedArtistUrl, d.LastPlayedUri,
            d.LastPlayedCoverUrl,
            d.MusicStatusUpdatedAt, d.LastSeen)));
    }

    [HttpGet("friends/list/{profileUserId:guid}")]
    public async Task<IActionResult> GetFriendsList(Guid profileUserId)
    {
        var userId = await ResolveUserIdAsync();
        if (userId is null)
        {
            _logger.LogWarning("[Friendships] Spotify ID claim missing in token");
            return Unauthorized();
        }

        var friends = await friendshipService.GetFriendsListAsync(profileUserId);
        return Ok(friends.Select(f => new FriendListItemResponse(f.UserId, f.DisplayName, f.ProfileImageUrl)));
    }

    [HttpDelete("friends/{targetUserId:guid}")]
    public async Task<IActionResult> RemoveFriend(Guid targetUserId)
    {
        var userId = await ResolveUserIdAsync();
        if (userId is null)
        {
            _logger.LogWarning("[Friendships] Spotify ID claim missing in token");
            return Unauthorized();
        }

        try
        {
            await friendshipService.RemoveFriendAsync(userId.Value, targetUserId);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    private static FriendshipResponse ToResponse(GetFriendshipDto dto) =>
        new(dto.Id, dto.SenderId, dto.SenderDisplayName, dto.SenderProfileImageUrl,
            dto.ReceiverId, dto.ReceiverDisplayName, dto.ReceiverProfileImageUrl,
            dto.Status.ToString(), dto.CreatedAt, dto.UpdatedAt);
}
