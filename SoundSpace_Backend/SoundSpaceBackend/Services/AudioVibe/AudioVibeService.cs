using Microsoft.EntityFrameworkCore;
using Pgvector;
using Pgvector.EntityFrameworkCore;
using SoundSpaceBackend.Controllers.Users.Responses;
using SoundSpaceBackend.Models.Entities;
using SoundSpaceBackend.Persistence;
using SoundSpaceBackend.Services.AudioVibe.Abstractions;

namespace SoundSpaceBackend.Services.AudioVibe;

public sealed class AudioVibeService(
    ApplicationContext context,
    ILogger<AudioVibeService> logger) : IAudioVibeService
{
    public async Task<List<DiscoveryUserResponse>> GetVibeMatchesAsync(
        Guid userId, IReadOnlyCollection<Guid> excludeIds, int limit)
    {
        var userProfile = await context.UserAudioProfiles
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.UserId == userId);

        if (userProfile is null)
        {
            logger.LogWarning("[AudioVibe] User {UserId} has no audio profile — skipping vibe match", userId);
            return [];
        }

        var targetFloats = userProfile.AudioVector.Memory.ToArray();
        var targetVector = userProfile.AudioVector;
        var excludeSet = excludeIds.ToHashSet();

        var orderedMatches = await context.UserAudioProfiles
            .AsNoTracking()
            .Where(p => !excludeSet.Contains(p.UserId))
            .OrderBy(p => p.AudioVector.CosineDistance(targetVector))
            .Take(limit)
            .Select(p => new { p.UserId, p.AudioVector })
            .ToListAsync();

        if (orderedMatches.Count == 0) return [];

        var userIds = orderedMatches.Select(m => m.UserId).ToList();

        var scoreMap = orderedMatches.ToDictionary(
            m => m.UserId,
            m => Math.Round((1.0 - CosineDist(m.AudioVector.Memory.ToArray(), targetFloats)) * 100.0, 4)
        );

        var profiles = await context.Users
            .AsNoTracking()
            .Where(u => userIds.Contains(u.Id))
            .Select(u => new
            {
                u.Id,
                u.DisplayName,
                u.ProfileImageUrl,
                u.Country,
                IsListening              = u.CurrentlyPlaying != null && u.CurrentlyPlaying.IsListening,
                CurrentlyPlayingTitle    = u.CurrentlyPlaying != null ? u.CurrentlyPlaying.Title    : null,
                CurrentlyPlayingArtist   = u.CurrentlyPlaying != null ? u.CurrentlyPlaying.Artist   : null,
                CurrentlyPlayingCoverUrl = u.CurrentlyPlaying != null ? u.CurrentlyPlaying.CoverUrl : null,
            })
            .ToListAsync();

        var profileMap = profiles.ToDictionary(p => p.Id);

        logger.LogInformation("[AudioVibe] Vibe match returned {Count} results for userId={UserId}", userIds.Count, userId);

        return userIds
            .Where(id => profileMap.ContainsKey(id))
            .Select(id =>
            {
                var p = profileMap[id];
                return new DiscoveryUserResponse(
                    p.Id,
                    p.DisplayName,
                    p.ProfileImageUrl,
                    p.Country,
                    scoreMap.GetValueOrDefault(p.Id),
                    0,
                    p.IsListening,
                    p.CurrentlyPlayingTitle,
                    p.CurrentlyPlayingArtist,
                    p.CurrentlyPlayingCoverUrl,
                    [],
                    false,
                    "vibe"
                );
            })
            .ToList();
    }

    public async Task<bool> UserHasVectorAsync(Guid userId) =>
        await context.UserAudioProfiles.AnyAsync(p => p.UserId == userId);

    public async Task SeedUserVibeAsync(Guid userId)
    {
        var existing = await context.UserAudioProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
        if (existing is not null) return;

        var rng = new Random(userId.GetHashCode());
        var floats = new float[5];
        for (int i = 0; i < 5; i++) floats[i] = (float)rng.NextDouble();

        context.UserAudioProfiles.Add(new UserAudioProfile
        {
            Id          = Guid.NewGuid(),
            UserId      = userId,
            AudioVector = new Vector(floats),
            CreatedAt   = DateTime.UtcNow,
            UpdatedAt   = DateTime.UtcNow,
        });

        await context.SaveChangesAsync();
        logger.LogInformation("[AudioVibe] Cold-start vector seeded for userId={UserId}", userId);
    }

    private static double CosineDist(float[] a, float[] b)
    {
        double dot = 0, magA = 0, magB = 0;
        for (int i = 0; i < a.Length; i++)
        {
            dot  += a[i] * b[i];
            magA += a[i] * a[i];
            magB += b[i] * b[i];
        }
        if (magA == 0 || magB == 0) return 1.0;
        return 1.0 - dot / (Math.Sqrt(magA) * Math.Sqrt(magB));
    }
}
