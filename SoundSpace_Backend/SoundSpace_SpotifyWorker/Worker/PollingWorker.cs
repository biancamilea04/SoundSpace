using Microsoft.EntityFrameworkCore;
using SoundSpaceBackend.Models.Entities;
using SoundSpaceBackend.Persistence;
using SoundSpaceBackend.Services.SpotifyPlayer.Abstractions;

namespace SoundSpace_SpotifyWorker.Worker;

public class PollingWorker(IServiceScopeFactory scopeFactory, ILogger<PollingWorker> logger)
    : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromMinutes(15);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("[PollingWorker] Spotify polling service started. Interval: {Interval}m", Interval.TotalMinutes);

        while (!stoppingToken.IsCancellationRequested)
        {
            await PollAllUsersAsync(stoppingToken);
            await Task.Delay(Interval, stoppingToken);
        }
    }

    private async Task PollAllUsersAsync(CancellationToken ct)
    {
        using var scope = scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationContext>();
        var player = scope.ServiceProvider.GetRequiredService<ISpotifyPlayerService>();

        var users = db.Users
            .Where(u => u.SpotifyRefreshToken != null
                     && !u.SpotifyRefreshToken.StartsWith("mock_")
                     && !u.SpotifyId.StartsWith("mock_"))
            .Select(u => new { u.Id, u.SpotifyId })
            .ToList();

        logger.LogInformation("[PollingWorker] Polling {Count} Spotify-connected users.", users.Count);

        foreach (var user in users)
        {
            if (ct.IsCancellationRequested) break;
            try
            {
                await PollSingleUserAsync(db, player, user.Id, user.SpotifyId, ct);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "[PollingWorker] Failed to poll user SpotifyId={SpotifyId}", user.SpotifyId);
            }
        }

        logger.LogInformation("[PollingWorker] Poll cycle complete.");
    }

    private static async Task PollSingleUserAsync(
        ApplicationContext db,
        ISpotifyPlayerService player,
        Guid userId,
        string spotifyId,
        CancellationToken ct)
    {
        var now = DateTime.UtcNow;

        var artists = await player.GetTopArtistsAsync(spotifyId, 20);
        if (artists.Count > 0)
        {
            var existingArtists = db.TopArtists
                .Where(a => a.UserId == userId)
                .ToDictionary(a => a.SpotifyArtistId, StringComparer.OrdinalIgnoreCase);

            for (int i = 0; i < artists.Count; i++)
            {
                var artistId = artists[i].SpotifyId ?? $"unk_{i}";
                var rank = i + 1;

                if (existingArtists.TryGetValue(artistId, out var existing))
                {
                    existing.Rank      = rank;
                    existing.UpdatedAt = now;
                }
                else
                {
                    db.TopArtists.Add(new TopArtistEntry
                    {
                        UserId          = userId,
                        SpotifyArtistId = artistId,
                        Name            = artists[i].Name,
                        ImageUrl        = artists[i].ImageUrl,
                        SpotifyUrl      = artists[i].SpotifyUrl,
                        Rank            = rank,
                        UpdatedAt       = now
                    });
                }
            }
        }

        var tracks = await player.GetTopTracksAsync(spotifyId, 5);
        if (tracks.Count > 0)
        {
            db.TopTracks.RemoveRange(db.TopTracks.Where(t => t.UserId == userId));
            for (int i = 0; i < tracks.Count; i++)
            {
                db.TopTracks.Add(new TopTrackEntry
                {
                    UserId = userId,
                    SpotifyTrackId = tracks[i].SpotifyId ?? $"unk_{i}",
                    Title = tracks[i].Name,
                    ArtistName = tracks[i].ArtistName,
                    ArtistUrl = tracks[i].ArtistUrl,
                    CoverUrl = tracks[i].ImageUrl,
                    SpotifyUrl = tracks[i].SpotifyUrl,
                    Rank = i + 1,
                    UpdatedAt = now
                });
            }
        }

        var streams = await player.GetRecentStreamsAsync(spotifyId, 10);
        if (streams.Count > 0)
        {
            db.RecentStreams.RemoveRange(db.RecentStreams.Where(r => r.UserId == userId));
            foreach (var s in streams)
            {
                db.RecentStreams.Add(new RecentStreamEntry
                {
                    UserId = userId,
                    SpotifyTrackId = s.SpotifyId ?? "unk",
                    Title = s.Name,
                    ArtistName = s.ArtistName,
                    ArtistUrl = s.ArtistUrl,
                    CoverUrl = s.ImageUrl,
                    SpotifyUrl = s.SpotifyUrl,
                    PlayedAt = s.PlayedAt,
                    PolledAt = now
                });
            }
        }

        await db.SaveChangesAsync(ct);
    }
}
