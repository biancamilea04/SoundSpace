using System.Diagnostics;
using Microsoft.EntityFrameworkCore;
using SoundSpaceBackend.Controllers.Users.Responses;
using SoundSpaceBackend.Persistence;
using SoundSpaceBackend.Services.Discovery.Abstractions;

namespace SoundSpaceBackend.Services.Discovery;

public sealed class DiscoveryService(
    ApplicationContext context,
    ILogger<DiscoveryService> logger) : IDiscoveryService
{
    private const int CandidatePoolSize = 500;

    public async Task<List<DiscoveryUserResponse>> GetFeedAsync(Guid userId, int page, int pageSize)
    {
        var timer = Stopwatch.StartNew();

        var targetUser = await context.Users
            .AsNoTracking()
            .Where(u => u.Id == userId)
            .Select(u => new { u.Id, u.DisplayName })
            .FirstOrDefaultAsync()
            ?? throw new InvalidOperationException($"User {userId} not found.");

        logger.LogInformation(
            "[Discovery] Request for userId={UserId} ({Name})",
            userId, targetUser.DisplayName);

        var candidateIds = await context.Users
            .AsNoTracking()
            .Where(u => u.Id != userId)
            .Select(u => u.Id)
            .Take(CandidatePoolSize)
            .ToListAsync();

        logger.LogInformation("[Discovery] Candidate pool → {Count} users", candidateIds.Count);

        if (candidateIds.Count == 0)
            return [];

        var profiles = await context.Users
            .AsNoTracking()
            .Where(u => candidateIds.Contains(u.Id))
            .Select(u => new
            {
                u.Id,
                u.DisplayName,
                u.ProfileImageUrl,
                u.Country,
                u.IsListening,
                u.CurrentlyPlayingTitle,
                u.CurrentlyPlayingArtist,
                u.CurrentlyPlayingCoverUrl,
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

        logger.LogInformation(
            "[Discovery] Current user artist set: {TopArtists} top-artists, {TrackArtists} track-artists, {StreamArtists} stream-artists → {Total} unique",
            targetTopArtists.Count, targetTrackArtistNames.Count, targetStreamArtistNames.Count, targetArtistSet.Count);

        if (targetArtistSet.Count == 0)
            logger.LogWarning("[Discovery] Current user has NO artist data from any source — all Jaccard scores will be 0, feed will be empty.");

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

        logger.LogInformation("[Discovery] Loaded artist data for {Users} candidate users (top+tracks+streams)",
            artistSetByUser.Count);

        var results = new List<DiscoveryUserResponse>(candidateIds.Count);

        foreach (var candidateId in candidateIds)
        {
            if (!profiles.TryGetValue(candidateId, out var profile)) continue;

            var candidateArtistSet = artistSetByUser.TryGetValue(candidateId, out var ids) ? ids : [];

            int intersection = targetArtistSet.Count(a => candidateArtistSet.Contains(a));
            int union        = targetArtistSet.Count + candidateArtistSet.Count - intersection;
            double jaccardScore = union > 0 ? (double)intersection / union * 100.0 : 0.0;

            logger.LogInformation(
                "[Discovery] {Name} ({Id}) | artistCount={ArtistCount} intersection={Intersection} union={Union} jaccard={Score:F2} → {Result}",
                profile.DisplayName, candidateId,
                candidateArtistSet.Count, intersection, union, jaccardScore,
                jaccardScore > 0 ? "INCLUDED" : "EXCLUDED (no shared artists)");

            if (jaccardScore == 0) continue;

            var sharedArtists = targetTopArtists
                .Where(a => candidateArtistSet.Contains(a.Name))
                .Take(5)
                .Select(a => new SharedArtistInfo(a.SpotifyArtistId, a.Name, a.ImageUrl))
                .ToList();

            logger.LogInformation("[Discovery]   shared artists: {Artists}",
                string.Join(", ", sharedArtists.Select(a => a.Name)));

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
                IsCountryFallback:        false
            ));
        }

        logger.LogInformation(
            "[Discovery] Final: {Count}/{Total} candidates passed for userId={UserId} in {Ms:F1} ms",
            results.Count, candidateIds.Count, userId, timer.Elapsed.TotalMilliseconds);

        return results
            .OrderByDescending(r => r.FinalScore)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();
    }
}
