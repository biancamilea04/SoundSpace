using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace SoundSpaceBackend.Services.Hubs;

[Authorize]
public class SpotifyHub(ILogger<SpotifyHub> logger) : Hub
{
    public override Task OnConnectedAsync()
    {
        var spotifyId = Context.UserIdentifier;
        if (spotifyId != null)
        {
            SpotifyConnectionTracker.AddConnection(spotifyId, Context.ConnectionId);
            logger.LogInformation("[SpotifyHub] User connected: {SpotifyId} ({ConnectionId})", spotifyId, Context.ConnectionId);
        }
        return base.OnConnectedAsync();
    }

    public override Task OnDisconnectedAsync(Exception? exception)
    {
        var spotifyId = Context.UserIdentifier;
        if (spotifyId != null)
        {
            SpotifyConnectionTracker.RemoveConnection(spotifyId, Context.ConnectionId);
            logger.LogInformation("[SpotifyHub] User disconnected: {SpotifyId} ({ConnectionId})", spotifyId, Context.ConnectionId);
        }
        return base.OnDisconnectedAsync(exception);
    }
}
