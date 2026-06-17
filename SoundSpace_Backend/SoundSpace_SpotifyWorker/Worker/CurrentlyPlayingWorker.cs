using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using SoundSpaceBackend.Models.Entities;
using SoundSpaceBackend.Persistence;
using SoundSpaceBackend.Services.SpotifyPlayer.Abstractions;

namespace SoundSpace_SpotifyWorker.Worker;

public class CurrentlyPlayingWorker(
    IServiceScopeFactory scopeFactory,
    IHttpClientFactory httpClientFactory,
    IConfiguration configuration,
    ILogger<CurrentlyPlayingWorker> logger) : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromSeconds(30);

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
            .Where(u => u.SpotifyRefreshToken != null
                     && !u.SpotifyRefreshToken.StartsWith("mock_")
                     && !u.SpotifyId.StartsWith("mock_"))
            .Select(u => new
            {
                u.Id,
                u.SpotifyId,
                IsListening = u.CurrentlyPlaying != null && u.CurrentlyPlaying.IsListening,
                CurrentlyPlayingTitle = u.CurrentlyPlaying != null ? u.CurrentlyPlaying.Title : null,
            })
            .ToListAsync(ct);

        logger.LogInformation("[CurrentlyPlayingWorker] Polling {Count} users", users.Count);

        foreach (var u in users)
        {
            if (ct.IsCancellationRequested) break;
            try
            {
                var nowPlaying = await player.GetCurrentlyPlayingTrackAsync(u.SpotifyId);
                var entityId = u.Id;
                var entity = await db.Users
                    .Include(e => e.CurrentlyPlaying)
                    .Include(e => e.LastPlayed)
                    .FirstOrDefaultAsync(e => e.Id == entityId, ct);
                if (entity == null) continue;

                bool stateChanged;

                if (nowPlaying != null && nowPlaying.IsPlaying)
                {
                    var artistUrl = nowPlaying.Artists.FirstOrDefault()?.SpotifyUrl;
                    stateChanged = !u.IsListening || u.CurrentlyPlayingTitle != nowPlaying.SongTitle;

                    if (entity.CurrentlyPlaying == null)
                    {
                        entity.CurrentlyPlaying = new UserCurrentlyPlaying { UserId = entity.Id };
                        db.UserCurrentlyPlayings.Add(entity.CurrentlyPlaying);
                    }
                    entity.CurrentlyPlaying.IsListening = true;
                    entity.CurrentlyPlaying.Title = nowPlaying.SongTitle;
                    entity.CurrentlyPlaying.Artist = nowPlaying.ArtistNames;
                    entity.CurrentlyPlaying.ArtistUrl = artistUrl;
                    entity.CurrentlyPlaying.CoverUrl = nowPlaying.AlbumImageUrl;
                    entity.CurrentlyPlaying.Uri = nowPlaying.SongUri;
                    entity.CurrentlyPlaying.ProgressMs = nowPlaying.ProgressMs;
                    entity.CurrentlyPlaying.UpdatedAt = DateTime.UtcNow;

                    if (entity.LastPlayed == null)
                    {
                        entity.LastPlayed = new UserLastPlayed { UserId = entity.Id };
                        db.UserLastPlayeds.Add(entity.LastPlayed);
                    }
                    entity.LastPlayed.Title = nowPlaying.SongTitle;
                    entity.LastPlayed.Artist = nowPlaying.ArtistNames;
                    entity.LastPlayed.ArtistUrl = artistUrl;
                    entity.LastPlayed.Uri = nowPlaying.SongUri;
                    entity.LastPlayed.CoverUrl = nowPlaying.AlbumImageUrl;
                }
                else
                {
                    stateChanged = u.IsListening;
                    if (entity.CurrentlyPlaying != null)
                    {
                        entity.CurrentlyPlaying.IsListening = false;
                        entity.CurrentlyPlaying.Title = null;
                        entity.CurrentlyPlaying.Artist = null;
                        entity.CurrentlyPlaying.ArtistUrl = null;
                        entity.CurrentlyPlaying.CoverUrl = null;
                        entity.CurrentlyPlaying.Uri = null;
                        entity.CurrentlyPlaying.ProgressMs = 0;
                        entity.CurrentlyPlaying.UpdatedAt = DateTime.UtcNow;
                    }
                }

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
            isListening = entity.CurrentlyPlaying?.IsListening ?? false,
            currentlyPlayingTitle = entity.CurrentlyPlaying?.Title,
            currentlyPlayingArtist = entity.CurrentlyPlaying?.Artist,
            currentlyPlayingArtistUrl = entity.CurrentlyPlaying?.ArtistUrl,
            currentlyPlayingCoverUrl = entity.CurrentlyPlaying?.CoverUrl,
            currentlyPlayingUri = entity.CurrentlyPlaying?.Uri,
            currentlyPlayingProgressMs = entity.CurrentlyPlaying?.ProgressMs ?? 0,
            lastPlayedTitle = entity.LastPlayed?.Title,
            lastPlayedArtist = entity.LastPlayed?.Artist,
            lastPlayedArtistUrl = entity.LastPlayed?.ArtistUrl,
            lastPlayedUri = entity.LastPlayed?.Uri,
            lastPlayedCoverUrl = entity.LastPlayed?.CoverUrl,
            musicStatusUpdatedAt = entity.CurrentlyPlaying?.UpdatedAt,
        };

        var client = httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Add("X-Internal-Secret", secret);

        var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
        var response = await client.PostAsync($"{apiUrl}/api/internal/music-status-changed", content, ct);

        if (!response.IsSuccessStatusCode)
            logger.LogWarning("[CurrentlyPlayingWorker] Notify API returned {Status}", response.StatusCode);
    }
}
