using Microsoft.EntityFrameworkCore;
using SoundSpaceBackend.Persistence;
using SoundSpaceBackend.Services.Post.Abstractions;
using SoundSpaceBackend.Services.Post.DTOs;
using PostEntity = SoundSpaceBackend.Models.Entities.Post;

namespace SoundSpaceBackend.Services.Post;

public class PostService(
    ApplicationContext dbContext,
    ILogger<PostService> logger) : IPostService
{
    public async Task<GetPostDto> CreatePostAsync(Guid userId, CreatePostDto dto)
    {
        logger.LogInformation("[Post] Creating post for UserId={UserId}", userId);

        var user = await dbContext.Users.FindAsync(userId)
            ?? throw new Exception("User not found");

        var post = new PostEntity
        {
            UserId = userId,
            Content = dto.Content,
            SpotifyUri = dto.SpotifyUri,
            SpotifyName = dto.SpotifyName,
            SpotifyCoverUrl = dto.SpotifyCoverUrl,
            SpotifySubtitle = dto.SpotifySubtitle,
            SpotifySubtitleUrl = dto.SpotifySubtitleUrl,
            SpotifyMediaType = dto.SpotifyMediaType,
            PreviewUrl = dto.PreviewUrl,
            PreviewStartSecond = dto.PreviewStartSecond,
            PreviewDuration = dto.PreviewDuration,
            EventId = dto.EventId,
        };

        dbContext.Posts.Add(post);
        await dbContext.SaveChangesAsync();

        string? eventTitle = null;
        if (dto.EventId.HasValue)
        {
            var ev = await dbContext.Events.FindAsync(dto.EventId.Value);
            eventTitle = ev?.Title;
        }

        return ToDto(post, user.DisplayName, user.ProfileImageUrl, eventTitle);
    }

    public async Task<List<GetPostDto>> GetAllPostsAsync()
    {
        logger.LogInformation("[Post] Fetching all posts");

        return await dbContext.Posts
            .Include(p => p.User)
            .Where(p => p.EventId == null)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => 
                new GetPostDto(
                p.Id, p.UserId, p.User.DisplayName, p.User.ProfileImageUrl,
                p.Content, p.SpotifyUri, p.SpotifyName, p.SpotifyCoverUrl,
                p.SpotifySubtitle, p.SpotifySubtitleUrl, p.SpotifyMediaType, p.PreviewUrl,
                p.PreviewStartSecond, p.PreviewDuration, p.CreatedAt,
                null, null)
                )
            .ToListAsync();
    }

    public async Task<GetPostDto> UpdatePostAsync(Guid postId, Guid userId, UpdatePostDto dto)
    {
        logger.LogInformation("[Post] Updating post PostId={PostId} for UserId={UserId}", postId, userId);

        var post = await dbContext.Posts
            .IgnoreQueryFilters()
            .Include(p => p.User)
            .Include(p => p.Event)
            .FirstOrDefaultAsync(p => p.Id == postId)
            ?? throw new KeyNotFoundException($"Post {postId} not found");

        if (post.IsDeleted)
            throw new KeyNotFoundException($"Post {postId} not found");

        if (post.UserId != userId)
            throw new UnauthorizedAccessException("Not the post author");

        post.Content = dto.Content;
        post.SpotifyUri = dto.SpotifyUri;
        post.SpotifyName = dto.SpotifyName;
        post.SpotifyCoverUrl = dto.SpotifyCoverUrl;
        post.SpotifySubtitle = dto.SpotifySubtitle;
        post.SpotifySubtitleUrl = dto.SpotifySubtitleUrl;
        post.SpotifyMediaType = dto.SpotifyMediaType;
        post.PreviewUrl = dto.PreviewUrl;
        post.PreviewStartSecond = dto.PreviewStartSecond;
        post.PreviewDuration = dto.PreviewDuration;

        await dbContext.SaveChangesAsync();

        return ToDto(post, post.User.DisplayName, post.User.ProfileImageUrl, post.Event?.Title);
    }

    public async Task DeletePostAsync(Guid postId, Guid userId)
    {
        logger.LogInformation("[Post] Soft deleting post PostId={PostId} for UserId={UserId}", postId, userId);

        var post = await dbContext.Posts
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.Id == postId)
            ?? throw new KeyNotFoundException($"Post {postId} not found");

        if (post.IsDeleted)
            throw new KeyNotFoundException($"Post {postId} not found");

        if (post.UserId != userId)
            throw new UnauthorizedAccessException("Not the post author");

        post.IsDeleted = true;
        post.DeletedAt = DateTime.UtcNow;

        await dbContext.SaveChangesAsync();
    }

    public async Task<List<GetPostDto>> GetPostsByUserIdAsync(Guid userId)
    {
        logger.LogInformation("[Post] Fetching posts for UserId={UserId}", userId);

        return await dbContext.Posts
            .Include(p => p.User)
            .Where(p => p.UserId == userId && p.EventId == null)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new GetPostDto(
                p.Id, p.UserId, p.User.DisplayName, p.User.ProfileImageUrl,
                p.Content, p.SpotifyUri, p.SpotifyName, p.SpotifyCoverUrl,
                p.SpotifySubtitle, p.SpotifySubtitleUrl, p.SpotifyMediaType, p.PreviewUrl,
                p.PreviewStartSecond, p.PreviewDuration, p.CreatedAt,
                null, null))
            .ToListAsync();
    }

    public async Task<List<GetPostDto>> GetEventPostsAsync(Guid eventId)
    {
        logger.LogInformation("[Post] Fetching posts for EventId={EventId}", eventId);

        return await dbContext.Posts
            .Include(p => p.User)
            .Include(p => p.Event)
            .Where(p => p.EventId == eventId)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new GetPostDto(
                p.Id, p.UserId, p.User.DisplayName, p.User.ProfileImageUrl,
                p.Content, p.SpotifyUri, p.SpotifyName, p.SpotifyCoverUrl,
                p.SpotifySubtitle, p.SpotifySubtitleUrl, p.SpotifyMediaType, p.PreviewUrl,
                p.PreviewStartSecond, p.PreviewDuration, p.CreatedAt,
                p.EventId, p.Event != null ? p.Event.Title : null))
            .ToListAsync();
    }

    public async Task<List<GetPostDto>> GetEventFeedAsync(Guid userId, int page, int pageSize)
    {
        logger.LogInformation("[Post] Fetching event feed for UserId={UserId} Page={Page}", userId, page);

        return await dbContext.Posts
            .Include(p => p.User)
            .Include(p => p.Event)
            .Where(p => p.EventId != null &&
                dbContext.EventAttendees.Any(ea => ea.EventId == p.EventId && ea.UserId == userId))
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new GetPostDto(
                p.Id, p.UserId, p.User.DisplayName, p.User.ProfileImageUrl,
                p.Content, p.SpotifyUri, p.SpotifyName, p.SpotifyCoverUrl,
                p.SpotifySubtitle, p.SpotifySubtitleUrl, p.SpotifyMediaType, p.PreviewUrl,
                p.PreviewStartSecond, p.PreviewDuration, p.CreatedAt,
                p.EventId, p.Event != null ? p.Event.Title : null))
            .ToListAsync();
    }

    private static GetPostDto ToDto(PostEntity post, string displayName, string? profileImageUrl, string? eventTitle) =>
        new(post.Id, post.UserId, displayName, profileImageUrl,
            post.Content, post.SpotifyUri, post.SpotifyName, post.SpotifyCoverUrl,
            post.SpotifySubtitle, post.SpotifySubtitleUrl, post.SpotifyMediaType, post.PreviewUrl,
            post.PreviewStartSecond, post.PreviewDuration, post.CreatedAt,
            post.EventId, eventTitle);
}
