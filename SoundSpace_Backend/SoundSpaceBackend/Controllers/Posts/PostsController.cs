using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SoundSpaceBackend.Controllers.Posts.Requests;
using SoundSpaceBackend.Controllers.Posts.Responses;
using SoundSpaceBackend.Services.Like.Abstractions;
using SoundSpaceBackend.Services.Like.DTOs;
using SoundSpaceBackend.Services.Post.Abstractions;
using SoundSpaceBackend.Services.Post.DTOs;
using SoundSpaceBackend.Services.User.Abstractions;

namespace SoundSpaceBackend.Controllers.Posts;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PostsController(
    IPostService postService,
    IUserService userService,
    ILikeService likeService,
    ILogger<PostsController> logger) : ControllerBase
{
    private readonly ILogger<PostsController> _logger = logger;

    private async Task<Guid?> GetDbUserIdAsync()
    {
        var spotifyId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (spotifyId == null)
        {
            _logger.LogWarning("[Posts] Spotify ID claim missing in token");
            return null;
        }

        var entity = await userService.GetUserEntityBySpotifyIdAsync(spotifyId);
        return entity?.Id;
    }

    private static PostResponse ToResponse(GetPostDto post, LikeStatusDto likes) =>
        new(post.Id, post.UserId, post.DisplayName, post.ProfileImageUrl,
            post.Content, post.SpotifyUri, post.CreatedAt,
            likes.LikeCount, likes.IsLikedByCurrentUser);

    [HttpPost]
    public async Task<IActionResult> CreatePost([FromBody] CreatePostRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = await GetDbUserIdAsync();
        if (userId is null) return Unauthorized();

        var dto = new CreatePostDto(
            request.Content,
            request.SpotifyUri,
            request.SpotifyName,
            request.SpotifyCoverUrl,
            request.SpotifySubtitle,
            request.SpotifyMediaType);

        var post = await postService.CreatePostAsync(userId.Value, dto);
        var likes = await likeService.GetLikeStatusAsync(post.Id, userId.Value);

        return Created($"/api/posts/{post.Id}", ToResponse(post, likes));
    }

    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> UpdatePost(Guid id, [FromBody] UpdatePostRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = await GetDbUserIdAsync();
        if (userId is null) return Unauthorized();

        try
        {
            var post = await postService.UpdatePostAsync(id, userId.Value, new UpdatePostDto(request.Content, request.SpotifyUri));
            var likes = await likeService.GetLikeStatusAsync(post.Id, userId.Value);
            return Ok(ToResponse(post, likes));
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeletePost(Guid id)
    {
        var userId = await GetDbUserIdAsync();
        if (userId is null) return Unauthorized();

        try
        {
            await postService.DeletePostAsync(id, userId.Value);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetAllPosts()
    {
        var userId = await GetDbUserIdAsync();
        if (userId is null) return Unauthorized();

        var posts = await postService.GetAllPostsAsync();
        var likeMap = await likeService.GetLikeStatusBatchAsync(posts.Select(p => p.Id), userId.Value);

        return Ok(posts.Select(p => ToResponse(p, likeMap[p.Id])));
    }

    [HttpGet("user/{userId:guid}")]
    public async Task<IActionResult> GetPostsByUserId(Guid userId)
    {
        var currentUserId = await GetDbUserIdAsync();
        if (currentUserId is null) return Unauthorized();

        var posts = await postService.GetPostsByUserIdAsync(userId);
        var likeMap = await likeService.GetLikeStatusBatchAsync(posts.Select(p => p.Id), currentUserId.Value);

        return Ok(posts.Select(p => ToResponse(p, likeMap[p.Id])));
    }

    [HttpGet("user/spotify/{spotifyId}")]
    public async Task<IActionResult> GetPostsBySpotifyId(string spotifyId)
    {
        var currentUserId = await GetDbUserIdAsync();
        if (currentUserId is null) return Unauthorized();

        try
        {
            var user = await userService.GetUserEntityBySpotifyIdAsync(spotifyId);
            if (user is null) return NotFound();

            var posts = await postService.GetPostsByUserIdAsync(user.Id);
            var likeMap = await likeService.GetLikeStatusBatchAsync(posts.Select(p => p.Id), currentUserId.Value);

            return Ok(posts.Select(p => ToResponse(p, likeMap[p.Id])));
        }
        catch
        {
            return NotFound();
        }
    }

    [HttpPost("{postId:guid}/like")]
    public async Task<IActionResult> ToggleLike(Guid postId)
    {
        var userId = await GetDbUserIdAsync();
        if (userId is null) return Unauthorized();

        try
        {
            var result = await likeService.ToggleLikeAsync(postId, userId.Value);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpGet("{postId:guid}/likes")]
    public async Task<IActionResult> GetLikeStatus(Guid postId)
    {
        var userId = await GetDbUserIdAsync();
        if (userId is null) return Unauthorized();

        var result = await likeService.GetLikeStatusAsync(postId, userId.Value);
        return Ok(result);
    }
}
