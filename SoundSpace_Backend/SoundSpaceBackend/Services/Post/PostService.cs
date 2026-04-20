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
                p.CreatedAt))
            .ToListAsync();
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
                p.CreatedAt))
            .ToListAsync();
    }
}
