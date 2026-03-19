using Microsoft.AspNetCore.SignalR;
using SoundSpaceBackend.Services.Hubs;
using SoundSpaceBackend.Services.SpotifyPlayer.Abstractions;

namespace SoundSpaceBackend.Services.Workers;

public class SpotifyWorker(
    IServiceScopeFactory scopeFactory,
    IHubContext<SpotifyHub> hubContext,
    ILogger<SpotifyWorker> logger) : BackgroundService
{
    private readonly Dictionary<string, string> _lastTrackStatus = new();

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("[SpotifyWorker] Background service started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var activeUsers = SpotifyConnectionTracker.GetActiveUsers().ToList();
                if (activeUsers.Any())
                {
                    using var scope = scopeFactory.CreateScope();
                    var playerService = scope.ServiceProvider.GetRequiredService<ISpotifyPlayerService>();

                    foreach (var spotifyId in activeUsers)
                    {
                        var nowPlaying = await playerService.GetCurrentlyPlayingTrackAsync(spotifyId);

                        var currentStatus = $"{nowPlaying?.SongUri}_{nowPlaying?.IsPlaying}";
                        _lastTrackStatus.TryGetValue(spotifyId, out var lastStatus);

                        var hasStatusChanged = currentStatus != lastStatus;

                        if (hasStatusChanged)
                        {
                            logger.LogInformation("[SpotifyWorker] Status changed for {SpotifyId}. New track: {Track}", 
                                spotifyId, nowPlaying?.SongTitle ?? "None");
                        }

                        _lastTrackStatus[spotifyId] = currentStatus;
                        await hubContext.Clients.User(spotifyId).SendAsync("ReceiveNowPlaying", nowPlaying, stoppingToken);
                    }
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "[SpotifyWorker] Error during Spotify status check.");
            }
            
            await Task.Delay(5000, stoppingToken);
        }
    }
}
