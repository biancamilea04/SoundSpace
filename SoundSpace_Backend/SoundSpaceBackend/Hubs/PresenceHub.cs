using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using SoundSpaceBackend.Models.Enums;
using SoundSpaceBackend.Persistence;
using SoundSpaceBackend.Services.User.Abstractions;

namespace SoundSpaceBackend.Hubs;

[Authorize]
public class PresenceHub(
    PresenceTracker presenceTracker,
    IUserService userService,
    ApplicationContext db) : Hub
{
    public override async Task OnConnectedAsync()
    {
        var spotifyId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (spotifyId != null)
        {
            var user = await userService.GetUserEntityBySpotifyIdAsync(spotifyId);
            if (user != null)
            {
                var isNewlyOnline = presenceTracker.UserConnected(user.Id, Context.ConnectionId);
                await Groups.AddToGroupAsync(Context.ConnectionId, $"user-{user.Id}");

                if (isNewlyOnline)
                    await BroadcastOnlineStatusAsync(user.Id, isOnline: true);
            }
        }
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var spotifyId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (spotifyId != null)
        {
            var user = await userService.GetUserEntityBySpotifyIdAsync(spotifyId);
            if (user != null)
            {
                var isFullyOffline = presenceTracker.UserDisconnected(user.Id, Context.ConnectionId);

                if (isFullyOffline)
                {
                    user.LastSeen = DateTime.UtcNow;
                    await db.SaveChangesAsync();
                    await BroadcastOnlineStatusAsync(user.Id, isOnline: false);
                }
            }
        }
        await base.OnDisconnectedAsync(exception);
    }

    private async Task BroadcastOnlineStatusAsync(Guid userId, bool isOnline)
    {
        var friendIds = await db.Friendships
            .Where(f =>
                (f.SenderId == userId || f.ReceiverId == userId) &&
                f.Status == FriendshipStatus.Accepted)
            .Select(f => f.SenderId == userId ? f.ReceiverId : f.SenderId)
            .ToListAsync();

        var payload = new { userId, isOnline };
        foreach (var friendId in friendIds)
            await Clients.Group($"user-{friendId}").SendAsync("FriendOnlineStatusChanged", payload);
    }
}
