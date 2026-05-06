using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SoundSpaceBackend.Controllers.Comments.Requests;
using SoundSpaceBackend.Controllers.Comments.Responses;
using SoundSpaceBackend.Services.Comment.Abstractions;
using SoundSpaceBackend.Services.Comment.DTOs;
using SoundSpaceBackend.Services.User.Abstractions;

namespace SoundSpaceBackend.Controllers.Comments;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CommentsController(
    ICommentService commentService,
    IUserService userService,
    ILogger<CommentsController> logger) : ControllerBase
{
    private readonly ILogger<CommentsController> _logger = logger;

    private async Task<Guid?> GetDbUserIdAsync()
    {
        var spotifyId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (spotifyId == null)
        {
            _logger.LogWarning("[Comments] Spotify ID claim missing in token");
            return null;
        }

        var entity = await userService.GetUserEntityBySpotifyIdAsync(spotifyId);
        return entity?.Id;
    }

    [HttpPost]
    public async Task<IActionResult> CreateComment([FromBody] CreateCommentRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = await GetDbUserIdAsync();
        if (userId is null)
            return Unauthorized();

        try
        {
            var dto = new CreateCommentDto(request.Content, request.PostId, request.ParentCommentId);
            var comment = await commentService.CreateCommentAsync(userId.Value, dto);

            var response = new CommentResponse(
                comment.Id,
                comment.PostId,
                comment.UserId,
                comment.DisplayName,
                comment.ProfileImageUrl,
                comment.Content,
                comment.ParentCommentId,
                comment.CreatedAt,
                comment.UpdatedAt);

            return Created($"/api/comments/{response.Id}", response);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpGet("/api/posts/{postId:guid}/comments")]
    public async Task<IActionResult> GetCommentsByPostId(Guid postId)
    {
        var comments = await commentService.GetCommentsByPostIdAsync(postId);

        var response = comments.Select(c => new CommentResponse(
            c.Id,
            c.PostId,
            c.UserId,
            c.DisplayName,
            c.ProfileImageUrl,
            c.Content,
            c.ParentCommentId,
            c.CreatedAt,
            c.UpdatedAt));

        return Ok(response);
    }

    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> UpdateComment(Guid id, [FromBody] UpdateCommentRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = await GetDbUserIdAsync();
        if (userId is null)
            return Unauthorized();

        try
        {
            var comment = await commentService.UpdateCommentAsync(id, userId.Value, new UpdateCommentDto(request.Content));

            var response = new CommentResponse(
                comment.Id,
                comment.PostId,
                comment.UserId,
                comment.DisplayName,
                comment.ProfileImageUrl,
                comment.Content,
                comment.ParentCommentId,
                comment.CreatedAt,
                comment.UpdatedAt);

            return Ok(response);
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
    public async Task<IActionResult> DeleteComment(Guid id)
    {
        var userId = await GetDbUserIdAsync();
        if (userId is null)
            return Unauthorized();

        try
        {
            await commentService.DeleteCommentAsync(id, userId.Value);
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
}
