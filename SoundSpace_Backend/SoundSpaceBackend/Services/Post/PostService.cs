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
            SpotifyMediaType = dto.SpotifyMediaType,
        };

        dbContext.Posts.Add(post);
        await dbContext.SaveChangesAsync();

        return new GetPostDto(
            post.Id,
            post.UserId,
            user.DisplayName,
            user.ProfileImageUrl,
            post.Content,
            post.SpotifyUri,
            post.SpotifyName,
            post.SpotifyCoverUrl,
            post.SpotifySubtitle,
            post.SpotifyMediaType,
            post.CreatedAt);
    }

    public async Task<List<GetPostDto>> GetAllPostsAsync()
    {
        logger.LogInformation("[Post] Fetching all posts");

        return await dbContext.Posts
            .Include(p => p.User)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new GetPostDto(
                p.Id,
                p.UserId,
                p.User.DisplayName,
                p.User.ProfileImageUrl,
                p.Content,
                p.SpotifyUri,
                p.SpotifyName,
                p.SpotifyCoverUrl,
                p.SpotifySubtitle,
                p.SpotifyMediaType,
                p.CreatedAt))
            .ToListAsync();
    }

    public async Task<GetPostDto> UpdatePostAsync(Guid postId, Guid userId, UpdatePostDto dto)
    {
        logger.LogInformation("[Post] Updating post PostId={PostId} for UserId={UserId}", postId, userId);

        var post = await dbContext.Posts
            .IgnoreQueryFilters()
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.Id == postId)
            ?? throw new KeyNotFoundException($"Post {postId} not found");

        if (post.IsDeleted)
            throw new KeyNotFoundException($"Post {postId} not found");

        if (post.UserId != userId)
            throw new UnauthorizedAccessException("Not the post author");

        post.Content = dto.Content;
        post.SpotifyUri = dto.SpotifyUri;

        if (dto.SpotifyUri == null)
        {
            post.SpotifyName = null;
            post.SpotifyCoverUrl = null;
            post.SpotifySubtitle = null;
            post.SpotifyMediaType = null;
        }

        await dbContext.SaveChangesAsync();

        return new GetPostDto(
            post.Id,
            post.UserId,
            post.User.DisplayName,
            post.User.ProfileImageUrl,
            post.Content,
            post.SpotifyUri,
            post.SpotifyName,
            post.SpotifyCoverUrl,
            post.SpotifySubtitle,
            post.SpotifyMediaType,
            post.CreatedAt);
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
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new GetPostDto(
                p.Id,
                p.UserId,
                p.User.DisplayName,
                p.User.ProfileImageUrl,
                p.Content,
                p.SpotifyUri,
                p.SpotifyName,
                p.SpotifyCoverUrl,
                p.SpotifySubtitle,
                p.SpotifyMediaType,
                p.CreatedAt))
            .ToListAsync();
    }
}
