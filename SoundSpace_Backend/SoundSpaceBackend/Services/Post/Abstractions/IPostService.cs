using SoundSpaceBackend.Services.Post.DTOs;

namespace SoundSpaceBackend.Services.Post.Abstractions;

public interface IPostService
{
    Task<GetPostDto> CreatePostAsync(Guid userId, CreatePostDto dto);
    Task<List<GetPostDto>> GetAllPostsAsync();
    Task<List<GetPostDto>> GetPostsByUserIdAsync(Guid userId);
}
