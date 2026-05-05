using Microsoft.EntityFrameworkCore;
using SoundSpaceBackend.Persistence;
using SoundSpaceBackend.Services.Comment.Abstractions;
using SoundSpaceBackend.Services.Comment.DTOs;
using CommentEntity = SoundSpaceBackend.Models.Entities.Comment;

namespace SoundSpaceBackend.Services.Comment;

public class CommentService(
    ApplicationContext dbContext,
    ILogger<CommentService> logger) : ICommentService
{
    public async Task<GetCommentDto> CreateCommentAsync(Guid userId, CreateCommentDto dto)
    {
        logger.LogInformation("[Comment] Creating comment for UserId={UserId} on PostId={PostId}", userId, dto.PostId);

        var user = await dbContext.Users.FindAsync(userId)
            ?? throw new Exception("User not found");

        if (dto.ParentCommentId.HasValue)
        {
            var parent = await dbContext.Comments.FindAsync(dto.ParentCommentId.Value)
                ?? throw new KeyNotFoundException($"Parent comment {dto.ParentCommentId} not found");

            if (parent.PostId != dto.PostId)
                throw new KeyNotFoundException("Parent comment does not belong to this post");
        }

        var comment = new CommentEntity
        {
            PostId = dto.PostId,
            UserId = userId,
            ParentCommentId = dto.ParentCommentId,
            Content = dto.Content,
        };

        dbContext.Comments.Add(comment);
        await dbContext.SaveChangesAsync();

        return new GetCommentDto(
            comment.Id,
            comment.PostId,
            comment.UserId,
            user.DisplayName,
            user.ProfileImageUrl,
            comment.Content,
            comment.ParentCommentId,
            comment.CreatedAt,
            comment.UpdatedAt);
    }

    public async Task<List<GetCommentDto>> GetCommentsByPostIdAsync(Guid postId)
    {
        logger.LogInformation("[Comment] Fetching comments for PostId={PostId}", postId);

        return await dbContext.Comments
            .Include(c => c.User)
            .Where(c => c.PostId == postId)
            .OrderBy(c => c.CreatedAt)
            .Select(c => new GetCommentDto(
                c.Id,
                c.PostId,
                c.UserId,
                c.User.DisplayName,
                c.User.ProfileImageUrl,
                c.Content,
                c.ParentCommentId,
                c.CreatedAt,
                c.UpdatedAt))
            .ToListAsync();
    }

    public async Task<GetCommentDto> UpdateCommentAsync(Guid commentId, Guid userId, UpdateCommentDto dto)
    {
        logger.LogInformation("[Comment] Updating CommentId={CommentId} for UserId={UserId}", commentId, userId);

        var comment = await dbContext.Comments
            .IgnoreQueryFilters()
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.Id == commentId)
            ?? throw new KeyNotFoundException($"Comment {commentId} not found");

        if (comment.IsDeleted)
            throw new KeyNotFoundException($"Comment {commentId} not found");

        if (comment.UserId != userId)
            throw new UnauthorizedAccessException("Not the comment author");

        comment.Content = dto.Content;
        comment.UpdatedAt = DateTime.UtcNow;

        await dbContext.SaveChangesAsync();

        return new GetCommentDto(
            comment.Id,
            comment.PostId,
            comment.UserId,
            comment.User.DisplayName,
            comment.User.ProfileImageUrl,
            comment.Content,
            comment.ParentCommentId,
            comment.CreatedAt,
            comment.UpdatedAt);
    }

    public async Task DeleteCommentAsync(Guid commentId, Guid userId)
    {
        logger.LogInformation("[Comment] Soft deleting CommentId={CommentId} for UserId={UserId}", commentId, userId);

        var comment = await dbContext.Comments
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(c => c.Id == commentId)
            ?? throw new KeyNotFoundException($"Comment {commentId} not found");

        if (comment.IsDeleted)
            throw new KeyNotFoundException($"Comment {commentId} not found");

        if (comment.UserId != userId)
            throw new UnauthorizedAccessException("Not the comment author");

        comment.IsDeleted = true;
        comment.DeletedAt = DateTime.UtcNow;

        await dbContext.SaveChangesAsync();
    }
}
