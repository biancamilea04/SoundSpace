using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using SoundSpaceBackend.Services.Hubs;
using SoundSpaceBackend.Services.SpotifyPlayer.Abstractions;

namespace SoundSpaceBackend.Services.Workers;

public class SpotifyWorker(
    IServiceScopeFactory scopeFactory,
    IHubContext<SpotifyHub> hubContext,
    ILogger<SpotifyWorker> logger) : BackgroundService
{
    // Key: SpotifyId, Value: Track ID + IsPlaying combination to avoid redundant broadcasts when stopped
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

                        bool hasStatusChanged = currentStatus != lastStatus;

                        // To avoid redundant broadcasts when paused/stopped indefinitely, 
                        // we ONLY send if the song/playing state changed, OR if a song is currently playing 
                        // (we send every tick to fix frontend timing drift).
                        if (hasStatusChanged || nowPlaying?.IsPlaying == true)
                        {
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
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "[SpotifyWorker] Error during Spotify status check.");
            }

            // Poll every 5 seconds (sufficient for drift correction without hitting Spotify rate limits)
            await Task.Delay(5000, stoppingToken);
        }
    }
}
