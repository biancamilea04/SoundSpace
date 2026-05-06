using SoundSpaceBackend.Services.Like.DTOs;
using SoundSpaceBackend.Services.Post.DTOs;

namespace SoundSpaceBackend.Services.Like.Abstractions;

public interface ILikeService
{
    Task<LikeStatusDto> ToggleLikeAsync(Guid postId, Guid userId);
    Task<LikeStatusDto> GetLikeStatusAsync(Guid postId, Guid userId);
    Task<Dictionary<Guid, LikeStatusDto>> GetLikeStatusBatchAsync(IEnumerable<Guid> postIds, Guid userId);
    Task<List<GetPostDto>> GetLikedPostsByUserAsync(Guid userId);
}
