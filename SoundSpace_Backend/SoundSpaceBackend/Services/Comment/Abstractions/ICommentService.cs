using SoundSpaceBackend.Services.Comment.DTOs;

namespace SoundSpaceBackend.Services.Comment.Abstractions;

public interface ICommentService
{
    Task<GetCommentDto> CreateCommentAsync(Guid userId, CreateCommentDto dto);
    Task<List<GetCommentDto>> GetCommentsByPostIdAsync(Guid postId);
    Task<GetCommentDto> UpdateCommentAsync(Guid commentId, Guid userId, UpdateCommentDto dto);
    Task DeleteCommentAsync(Guid commentId, Guid userId);
}
