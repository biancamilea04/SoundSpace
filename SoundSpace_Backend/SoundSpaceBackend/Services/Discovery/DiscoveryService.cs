using System.Diagnostics;
using Microsoft.EntityFrameworkCore;
using SoundSpaceBackend.Controllers.Users.Responses;
using SoundSpaceBackend.Persistence;
using SoundSpaceBackend.Services.AudioVibe.Abstractions;
using SoundSpaceBackend.Services.Discovery.Abstractions;

namespace SoundSpaceBackend.Services.Discovery;

public sealed class DiscoveryService(
    ApplicationContext context,
    IAudioVibeService audioVibeService,
    ILogger<DiscoveryService> logger) : IDiscoveryService
{
    private const int CandidatePoolSize = 500;

    public async Task<List<DiscoveryUserResponse>> GetFeedAsync(Guid userId, int page, int pageSize)
    {
        var all = await RunJaccardAsync(userId, [userId]);
        return all
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();
    }

    private const int MinVibeSlots = 3;

    public async Task<List<DiscoveryUserResponse>> GetDiscoveryBatchAsync(
        Guid userId, IReadOnlyCollection<Guid> seenUserIds, int limit)
    {
        logger.LogInformation(
            "[Waterfall] START userId={UserId} limit={Limit} seenCount={SeenCount}",
            userId, limit, seenUserIds.Count);

        var excludeIds = seenUserIds.ToHashSet();
        excludeIds.Add(userId);

        var tier1Limit = Math.Max(limit - MinVibeSlots, 1);
        var tier1 = (await RunJaccardAsync(userId, excludeIds)).Take(tier1Limit).ToList();

        logger.LogInformation(
            "[Waterfall] Tier1 (Jaccard) returned {Count} (cap={Cap})",
            tier1.Count, tier1Limit);

        var tier2Slots = limit - tier1.Count;

        var tier2ExcludeIds = excludeIds
            .Concat(tier1.Select(r => r.Id))
            .ToHashSet();

        var userHasVector = await audioVibeService.UserHasVectorAsync(userId);
        logger.LogInformation("[Waterfall] Current user has audio vector: {HasVector}", userHasVector);

        var tier2 = await audioVibeService.GetVibeMatchesAsync(userId, tier2ExcludeIds, tier2Slots);

        logger.LogInformation("[Waterfall] Tier2 (Vibe) returned {Count} results (slots={Slots})", tier2.Count, tier2Slots);

        if (tier2.Count == 0 && !userHasVector)
        {
            logger.LogWarning("[Waterfall] No vector for current user — seeding cold-start vector (fire-and-forget)");
            _ = Task.Run(() => audioVibeService.SeedUserVibeAsync(userId));
        }

        var combined = tier1.Concat(tier2).ToList();
        logger.LogInformation(
            "[Waterfall] DONE — {T1} artist-match + {T2} vibe-match = {Total} total",
            tier1.Count, tier2.Count, combined.Count);

        return combined;
    }

    private async Task<List<DiscoveryUserResponse>> RunJaccardAsync(Guid userId, HashSet<Guid> excludeIds)
    {
        var timer = Stopwatch.StartNew();

        var targetUser = await context.Users
            .AsNoTracking()
            .Where(u => u.Id == userId)
            .Select(u => new { u.Id, u.DisplayName })
            .FirstOrDefaultAsync()
            ?? throw new InvalidOperationException($"User {userId} not found.");

        logger.LogInformation("[Discovery] Jaccard request for userId={UserId} ({Name})", userId, targetUser.DisplayName);

        var candidateIds = await context.Users
            .AsNoTracking()
            .Where(u => !excludeIds.Contains(u.Id))
            .Select(u => u.Id)
            .Take(CandidatePoolSize)
            .ToListAsync();

        logger.LogInformation("[Discovery] Candidate pool → {Count} users", candidateIds.Count);

        if (candidateIds.Count == 0) return [];

        var profiles = await context.Users
            .AsNoTracking()
            .Where(u => candidateIds.Contains(u.Id))
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
            .ToDictionaryAsync(u => u.Id);

        var targetTopArtists = await context.TopArtists
            .AsNoTracking()
            .Where(a => a.UserId == userId)
            .OrderBy(a => a.Rank)
            .Select(a => new { a.SpotifyArtistId, a.Name, a.ImageUrl })
            .ToListAsync();

        var targetTrackArtistNames = await context.TopTracks
            .AsNoTracking()
            .Where(t => t.UserId == userId)
            .Select(t => t.ArtistName)
            .Distinct()
            .ToListAsync();

        var targetStreamArtistNames = await context.RecentStreams
            .AsNoTracking()
            .Where(s => s.UserId == userId)
            .Select(s => s.ArtistName)
            .Distinct()
            .ToListAsync();

        var targetArtistSet = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var a in targetTopArtists)       targetArtistSet.Add(a.Name);
        foreach (var n in targetTrackArtistNames)  targetArtistSet.Add(n);
        foreach (var n in targetStreamArtistNames) targetArtistSet.Add(n);

        if (targetArtistSet.Count == 0)
            logger.LogWarning("[Discovery] User {UserId} has no artist data — all Jaccard scores will be 0", userId);

        var allCandidateTopArtists = await context.TopArtists
            .AsNoTracking()
            .Where(a => candidateIds.Contains(a.UserId))
            .Select(a => new { a.UserId, a.Name })
            .ToListAsync();

        var allCandidateTrackArtists = await context.TopTracks
            .AsNoTracking()
            .Where(t => candidateIds.Contains(t.UserId))
            .Select(t => new { t.UserId, t.ArtistName })
            .ToListAsync();

        var allCandidateStreamArtists = await context.RecentStreams
            .AsNoTracking()
            .Where(s => candidateIds.Contains(s.UserId))
            .Select(s => new { s.UserId, s.ArtistName })
            .ToListAsync();

        var artistSetByUser = new Dictionary<Guid, HashSet<string>>();

        foreach (var a in allCandidateTopArtists)
        {
            if (!artistSetByUser.TryGetValue(a.UserId, out var set))
                artistSetByUser[a.UserId] = set = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            set.Add(a.Name);
        }
        foreach (var t in allCandidateTrackArtists)
        {
            if (!artistSetByUser.TryGetValue(t.UserId, out var set))
                artistSetByUser[t.UserId] = set = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            set.Add(t.ArtistName);
        }
        foreach (var s in allCandidateStreamArtists)
        {
            if (!artistSetByUser.TryGetValue(s.UserId, out var set))
                artistSetByUser[s.UserId] = set = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            set.Add(s.ArtistName);
        }

        var results = new List<DiscoveryUserResponse>(candidateIds.Count);

        foreach (var candidateId in candidateIds)
        {
            if (!profiles.TryGetValue(candidateId, out var profile)) continue;

            var candidateArtistSet = artistSetByUser.TryGetValue(candidateId, out var ids) ? ids : [];

            int intersection = targetArtistSet.Count(a => candidateArtistSet.Contains(a));
            int union        = targetArtistSet.Count + candidateArtistSet.Count - intersection;
            double jaccardScore = union > 0 ? (double)intersection / union * 100.0 : 0.0;

            if (jaccardScore == 0) continue;

            var sharedArtists = targetTopArtists
                .Where(a => candidateArtistSet.Contains(a.Name))
                .Take(5)
                .Select(a => new SharedArtistInfo(a.SpotifyArtistId, a.Name, a.ImageUrl))
                .ToList();

            results.Add(new DiscoveryUserResponse(
                Id:                       profile.Id,
                DisplayName:              profile.DisplayName,
                ProfileImageUrl:          profile.ProfileImageUrl,
                Country:                  profile.Country,
                FinalScore:               Math.Round(jaccardScore, 4),
                SharedArtistCount:        intersection,
                IsListening:              profile.IsListening,
                CurrentlyPlayingTitle:    profile.CurrentlyPlayingTitle,
                CurrentlyPlayingArtist:   profile.CurrentlyPlayingArtist,
                CurrentlyPlayingCoverUrl: profile.CurrentlyPlayingCoverUrl,
                SharedArtists:            sharedArtists,
                IsCountryFallback:        false,
                MatchType:                "artists"
            ));
        }

        logger.LogInformation(
            "[Discovery] Jaccard: {Count}/{Total} candidates matched for userId={UserId} in {Ms:F1} ms",
            results.Count, candidateIds.Count, userId, timer.Elapsed.TotalMilliseconds);

        return results.OrderByDescending(r => r.FinalScore).ToList();
    }
}
