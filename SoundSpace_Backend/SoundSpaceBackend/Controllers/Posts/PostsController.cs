using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SoundSpaceBackend.Controllers.Posts.Requests;
using SoundSpaceBackend.Controllers.Posts.Responses;
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
    ILogger<PostsController> logger) : ControllerBase
{
    private readonly ILogger<PostsController> _logger = logger;

    [HttpPost]
    public async Task<IActionResult> CreatePost([FromBody] CreatePostRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var spotifyId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (spotifyId == null)
        {
            _logger.LogWarning("[Posts] Spotify ID claim missing in token");
            return Unauthorized();
        }

        var user = await userService.GetUserBySpotifyIdAsync(spotifyId);
        var userId = (await userService.GetUserEntityBySpotifyIdAsync(spotifyId)).Id;

        var dto = new CreatePostDto(request.Content, request.SpotifyUri);
        var post = await postService.CreatePostAsync(userId, dto);

        var response = new PostResponse(
            post.Id,
            post.UserId,
            post.DisplayName,
            post.ProfileImageUrl,
            post.Content,
            post.SpotifyUri,
            post.CreatedAt);

        return Created($"/api/posts/{response.Id}", response);
    }

    [HttpGet]
    public async Task<IActionResult> GetAllPosts()
    {
        var posts = await postService.GetAllPostsAsync();

        var response = posts.Select(p => new PostResponse(
            p.Id, p.UserId, p.DisplayName, p.ProfileImageUrl,
            p.Content, p.SpotifyUri, p.CreatedAt));

        return Ok(response);
    }

    [HttpGet("user/{userId:guid}")]
    public async Task<IActionResult> GetPostsByUserId(Guid userId)
    {
        var posts = await postService.GetPostsByUserIdAsync(userId);

        var response = posts.Select(p => new PostResponse(
            p.Id, p.UserId, p.DisplayName, p.ProfileImageUrl,
            p.Content, p.SpotifyUri, p.CreatedAt));

        return Ok(response);
    }

    [HttpGet("user/spotify/{spotifyId}")]
    public async Task<IActionResult> GetPostsBySpotifyId(string spotifyId)
    {
        try
        {
            var user = await userService.GetUserEntityBySpotifyIdAsync(spotifyId);
            var posts = await postService.GetPostsByUserIdAsync(user.Id);

            var response = posts.Select(p => new PostResponse(
                p.Id, p.UserId, p.DisplayName, p.ProfileImageUrl,
                p.Content, p.SpotifyUri, p.CreatedAt));

            return Ok(response);
        }
        catch
        {
            return NotFound();
        }
    }
}
