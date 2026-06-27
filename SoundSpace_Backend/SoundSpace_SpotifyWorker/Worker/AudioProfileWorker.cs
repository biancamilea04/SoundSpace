using Microsoft.EntityFrameworkCore;
using Pgvector;
using SoundSpaceBackend.Models.Entities;
using SoundSpaceBackend.Persistence;

namespace SoundSpace_SpotifyWorker.Worker;

public sealed class AudioProfileWorker(
    IServiceScopeFactory scopeFactory,
    ILogger<AudioProfileWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await SeedMissingMockUsersAsync(stoppingToken);
    }

    private async Task CalculateAndSaveUserVibeAsync(Guid userId, ApplicationContext context)
    {
        var existing = await context.UserAudioProfiles
            .FirstOrDefaultAsync(p => p.UserId == userId);

        var rng = new Random(userId.GetHashCode());
        var floats = new float[5];
        for (int i = 0; i < 5; i++) floats[i] = (float)rng.NextDouble();

        if (existing is null)
        {
            context.UserAudioProfiles.Add(new UserAudioProfile
            {
                Id          = Guid.NewGuid(),
                UserId      = userId,
                AudioVector = new Vector(floats),
                CreatedAt   = DateTime.UtcNow,
                UpdatedAt   = DateTime.UtcNow,
            });
        }
        else
        {
            existing.AudioVector = new Vector(floats);
            existing.UpdatedAt   = DateTime.UtcNow;
        }

        await context.SaveChangesAsync();
    }

    private async Task SeedMissingMockUsersAsync(CancellationToken ct)
    {
        using var scope = scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationContext>();

        var missingUserIds = await db.Users
            .Where(u => !db.UserAudioProfiles.Any(p => p.UserId == u.Id))
            .Select(u => u.Id)
            .ToListAsync(ct);

        logger.LogInformation("[AudioProfileWorker] Seeding {Count} missing audio profiles", missingUserIds.Count);

        foreach (var userId in missingUserIds)
        {
            if (ct.IsCancellationRequested) break;
            await CalculateAndSaveUserVibeAsync(userId, db);
        }

        logger.LogInformation("[AudioProfileWorker] Seeding complete");
    }
}
