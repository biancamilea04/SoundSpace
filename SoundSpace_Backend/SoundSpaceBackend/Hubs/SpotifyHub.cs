using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace SoundSpaceBackend.Hubs;

[Authorize]
public class SpotifyHub : Hub
{
}

