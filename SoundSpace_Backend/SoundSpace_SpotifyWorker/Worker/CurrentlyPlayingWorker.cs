using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using SoundSpaceBackend.Persistence;
using SoundSpaceBackend.Services.SpotifyPlayer.Abstractions;

namespace SoundSpace_SpotifyWorker.Worker;

public class CurrentlyPlayingWorker(
    IServiceScopeFactory scopeFactory,
    IHttpClientFactory httpClientFactory,
    IConfiguration configuration,
    ILogger<CurrentlyPlayingWorker> logger) : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromSeconds(60);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("[CurrentlyPlayingWorker] Started. Interval: 60s");
        while (!stoppingToken.IsCancellationRequested)
        {
            await PollAsync(stoppingToken);
            await Task.Delay(Interval, stoppingToken);
        }
    }

    private async Task PollAsync(CancellationToken ct)
    {
        using var scope = scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationContext>();
        var player = scope.ServiceProvider.GetRequiredService<ISpotifyPlayerService>();

        var users = await db.Users
            .Where(u => u.SpotifyRefreshToken != null && !u.SpotifyRefreshToken.StartsWith("mock_"))
            .Select(u => new { u.Id, u.SpotifyId, u.IsListening, u.CurrentlyPlayingTitle })
            .ToListAsync(ct);

        logger.LogInformation("[CurrentlyPlayingWorker] Polling {Count} users", users.Count);

        foreach (var u in users)
        {
            if (ct.IsCancellationRequested) break;
            try
            {
                var nowPlaying = await player.GetCurrentlyPlayingTrackAsync(u.SpotifyId);
                var entity = await db.Users.FindAsync([u.Id], ct);
                if (entity == null) continue;

                bool stateChanged;

                if (nowPlaying != null && nowPlaying.IsPlaying)
                {
                    var artistUrl = nowPlaying.Artists.FirstOrDefault()?.SpotifyUrl;
                    stateChanged = !u.IsListening || u.CurrentlyPlayingTitle != nowPlaying.SongTitle;
                    entity.IsListening = true;
                    entity.CurrentlyPlayingTitle = nowPlaying.SongTitle;
                    entity.CurrentlyPlayingArtist = nowPlaying.ArtistNames;
                    entity.CurrentlyPlayingArtistUrl = artistUrl;
                    entity.CurrentlyPlayingCoverUrl = nowPlaying.AlbumImageUrl;
                    entity.CurrentlyPlayingUri = nowPlaying.SongUri;
                    entity.CurrentlyPlayingProgressMs = nowPlaying.ProgressMs;
                    entity.LastPlayedTitle = nowPlaying.SongTitle;
                    entity.LastPlayedArtist = nowPlaying.ArtistNames;
                    entity.LastPlayedArtistUrl = artistUrl;
                    entity.LastPlayedUri = nowPlaying.SongUri;
                    entity.LastPlayedCoverUrl = nowPlaying.AlbumImageUrl;
                }
                else
                {
                    stateChanged = u.IsListening;
                    entity.IsListening = false;
                    entity.CurrentlyPlayingTitle = null;
                    entity.CurrentlyPlayingArtist = null;
                    entity.CurrentlyPlayingArtistUrl = null;
                    entity.CurrentlyPlayingCoverUrl = null;
                    entity.CurrentlyPlayingUri = null;
                    entity.CurrentlyPlayingProgressMs = 0;
                }

                entity.MusicStatusUpdatedAt = DateTime.UtcNow;
                await db.SaveChangesAsync(ct);

                if (!stateChanged) continue;

                await NotifyMainApiAsync(entity, ct);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "[CurrentlyPlayingWorker] Failed for SpotifyId={SpotifyId}", u.SpotifyId);
            }
        }
    }

    private async Task NotifyMainApiAsync(SoundSpaceBackend.Models.Entities.User entity, CancellationToken ct)
    {
        var apiUrl = configuration["MainApi:BaseUrl"]
            ?? throw new InvalidOperationException("MainApi:BaseUrl not configured.");
        var secret = configuration["InternalApi:Secret"]
            ?? throw new InvalidOperationException("InternalApi:Secret not configured.");

        var payload = new
        {
            userId = entity.Id,
            isListening = entity.IsListening,
            currentlyPlayingTitle = entity.CurrentlyPlayingTitle,
            currentlyPlayingArtist = entity.CurrentlyPlayingArtist,
            currentlyPlayingArtistUrl = entity.CurrentlyPlayingArtistUrl,
            currentlyPlayingCoverUrl = entity.CurrentlyPlayingCoverUrl,
            currentlyPlayingUri = entity.CurrentlyPlayingUri,
            currentlyPlayingProgressMs = entity.CurrentlyPlayingProgressMs,
            lastPlayedTitle = entity.LastPlayedTitle,
            lastPlayedArtist = entity.LastPlayedArtist,
            lastPlayedArtistUrl = entity.LastPlayedArtistUrl,
            lastPlayedUri = entity.LastPlayedUri,
            lastPlayedCoverUrl = entity.LastPlayedCoverUrl,
        };

        var client = httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Add("X-Internal-Secret", secret);

        var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
        var response = await client.PostAsync($"{apiUrl}/api/internal/music-status-changed", content, ct);

        if (!response.IsSuccessStatusCode)
            logger.LogWarning("[CurrentlyPlayingWorker] Notify API returned {Status}", response.StatusCode);
    }
}
