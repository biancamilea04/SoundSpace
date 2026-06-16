using Microsoft.EntityFrameworkCore;
using SoundSpaceBackend.Models.Entities;
using SoundSpaceBackend.Persistence;
using SoundSpaceBackend.Services.Like.Abstractions;
using SoundSpaceBackend.Services.Like.DTOs;
using SoundSpaceBackend.Services.Post.DTOs;

namespace SoundSpaceBackend.Services.Like;

public class LikeService(ApplicationContext db) : ILikeService
{
    public async Task<LikeStatusDto> ToggleLikeAsync(Guid postId, Guid userId)
    {
        var existing = await db.Likes
            .FirstOrDefaultAsync(l => l.PostId == postId && l.UserId == userId);

        if (existing is not null)
        {
            db.Likes.Remove(existing);
        }
        else
        {
            db.Likes.Add(new Models.Entities.Like { PostId = postId, UserId = userId });
        }

        await db.SaveChangesAsync();

        return await GetLikeStatusAsync(postId, userId);
    }

    public async Task<LikeStatusDto> GetLikeStatusAsync(Guid postId, Guid userId)
    {
        var count = await db.Likes.CountAsync(l => l.PostId == postId);
        var liked = await db.Likes.AnyAsync(l => l.PostId == postId && l.UserId == userId);
        return new LikeStatusDto(count, liked);
    }

    public async Task<Dictionary<Guid, LikeStatusDto>> GetLikeStatusBatchAsync(IEnumerable<Guid> postIds, Guid userId)
    {
        var ids = postIds.ToList();

        var likeCounts = await db.Likes
            .Where(l => ids.Contains(l.PostId))
            .GroupBy(l => l.PostId)
            .Select(g => new { PostId = g.Key, Count = g.Count() })
            .ToListAsync();

        var userLikedPostIds = await db.Likes
            .Where(l => ids.Contains(l.PostId) && l.UserId == userId)
            .Select(l => l.PostId)
            .ToHashSetAsync();

        return ids.ToDictionary(
            id => id,
            id =>
            {
                var count = likeCounts.FirstOrDefault(x => x.PostId == id)?.Count ?? 0;
                var liked = userLikedPostIds.Contains(id);
                return new LikeStatusDto(count, liked);
            });
    }

    public async Task<List<GetPostDto>> GetLikedPostsByUserAsync(Guid userId)
    {
        return await db.Likes
            .Where(l => l.UserId == userId && !l.Post.IsDeleted)
            .Include(l => l.Post)
            .ThenInclude(p => p.User)
            .Include(l => l.Post)
            .ThenInclude(p => p.Event)
            .OrderByDescending(l => l.CreatedAt)
            .Select(l => new GetPostDto(
                l.Post.Id,
                l.Post.UserId,
                l.Post.User.DisplayName,
                l.Post.User.ProfileImageUrl,
                l.Post.Content,
                l.Post.SpotifyUri,
                l.Post.SpotifyName,
                l.Post.SpotifyCoverUrl,
                l.Post.SpotifySubtitle,
                l.Post.SpotifySubtitleUrl,
                l.Post.SpotifyMediaType,
                l.Post.PreviewUrl,
                l.Post.PreviewStartSecond,
                l.Post.PreviewDuration,
                l.Post.CreatedAt,
                l.Post.EventId,
                l.Post.Event != null ? l.Post.Event.Title : null))
            .ToListAsync();
    }
}
