using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SoundSpaceBackend.Controllers.Events.Requests;
using SoundSpaceBackend.Controllers.Events.Responses;
using SoundSpaceBackend.Controllers.Posts.Responses;
using SoundSpaceBackend.Services.Event.Abstractions;
using SoundSpaceBackend.Services.Event.DTOs;
using SoundSpaceBackend.Services.EventChat.Abstractions;
using SoundSpaceBackend.Services.Like.Abstractions;
using SoundSpaceBackend.Services.Like.DTOs;
using SoundSpaceBackend.Services.Post.Abstractions;
using SoundSpaceBackend.Services.Post.DTOs;
using SoundSpaceBackend.Services.User.Abstractions;

namespace SoundSpaceBackend.Controllers.Events;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EventsController(
    IEventService eventService,
    IEventChatService eventChatService,
    IPostService postService,
    ILikeService likeService,
    IUserService userService) : ControllerBase
{
    private async Task<Guid?> GetCallerDbIdAsync()
    {
        var spotifyId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (spotifyId is null) return null;
        var entity = await userService.GetUserEntityBySpotifyIdAsync(spotifyId);
        return entity?.Id;
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var userId = await GetCallerDbIdAsync();
        if (userId is null) return Unauthorized();

        var dto = await eventService.GetByIdAsync(id, userId.Value);
        return dto is null ? NotFound() : Ok(ToResponse(dto));
    }

    [HttpGet("popular")]
    public async Task<IActionResult> GetPopular()
    {
        var userId = await GetCallerDbIdAsync();
        if (userId is null) return Unauthorized();

        var events = await eventService.GetPopularEventsAsync(userId.Value);
        return Ok(events.Select(ToResponse));
    }

    [HttpGet("recommended")]
    public async Task<IActionResult> GetRecommended()
    {
        var userId = await GetCallerDbIdAsync();
        if (userId is null) return Unauthorized();

        var events = await eventService.GetRecommendedEventsAsync(userId.Value);
        return Ok(events.Select(ToResponse));
    }

    [HttpGet("friends")]
    public async Task<IActionResult> GetFriendsEvents()
    {
        var userId = await GetCallerDbIdAsync();
        if (userId is null) return Unauthorized();

        var events = await eventService.GetFriendsEventsAsync(userId.Value);
        return Ok(events.Select(ToResponse));
    }

    [HttpGet("my-events")]
    public async Task<IActionResult> GetMyEvents()
    {
        var userId = await GetCallerDbIdAsync();
        if (userId is null) return Unauthorized();

        var events = await eventService.GetMyEventsAsync(userId.Value);
        return Ok(events.Select(ToResponse));
    }

    [HttpPost]
    public async Task<IActionResult> CreateEvent([FromBody] CreateEventRequest request)
    {
        var userId = await GetCallerDbIdAsync();
        if (userId is null) return Unauthorized();

        try
        {
            var dto = new CreateEventDto(
                request.Title, request.ImageUrl, request.ArtistName,
                request.ArtistSpotifyId, request.ArtistImageUrl,
                request.Location, request.City, request.Country,
                request.EventDate, request.EventTime,
                request.Description, request.TicketsUrl, request.ArtistProfileUrl);

            var ev = await eventService.CreateEventAsync(userId.Value, dto);
            return Created($"/api/events/{ev.Id}", ToResponse(ev));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpPost("{id:guid}/attend")]
    public async Task<IActionResult> ToggleAttendance(Guid id)
    {
        var userId = await GetCallerDbIdAsync();
        if (userId is null) return Unauthorized();

        try
        {
            var isNowAttending = await eventService.ToggleAttendanceAsync(id, userId.Value);
            return Ok(new { isAttending = isNowAttending });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpGet("{id:guid}/conversation")]
    public async Task<IActionResult> GetEventConversation(Guid id)
    {
        var userId = await GetCallerDbIdAsync();
        if (userId is null) return Unauthorized();

        try
        {
            var dto = await eventChatService.GetOrCreateEventConversationAsync(id, userId.Value);
            return Ok(dto);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpPost("{id:guid}/posts")]
    public async Task<IActionResult> CreateEventPost(Guid id, [FromBody] CreateEventPostRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var userId = await GetCallerDbIdAsync();
        if (userId is null) return Unauthorized();

        try
        {
            var dto = new CreatePostDto(
                request.Content,
                request.SpotifyUri,
                request.SpotifyName,
                request.SpotifyCoverUrl,
                request.SpotifySubtitle,
                request.SpotifyMediaType,
                request.PreviewUrl,
                request.PreviewStartSecond,
                request.PreviewDuration,
                id);

            var post = await postService.CreatePostAsync(userId.Value, dto);
            var likes = await likeService.GetLikeStatusAsync(post.Id, userId.Value);
            return Created($"/api/events/{id}/posts/{post.Id}", ToPostResponse(post, likes));
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpGet("{id:guid}/posts")]
    public async Task<IActionResult> GetEventPosts(Guid id)
    {
        var userId = await GetCallerDbIdAsync();
        if (userId is null) return Unauthorized();

        var posts = await postService.GetEventPostsAsync(id);
        var likeMap = await likeService.GetLikeStatusBatchAsync(posts.Select(p => p.Id), userId.Value);

        return Ok(posts.Select(p => ToPostResponse(p, likeMap[p.Id])));
    }

    private static EventResponse ToResponse(EventDto dto) =>
        new(dto.Id, dto.Title, dto.ImageUrl, dto.ArtistName, dto.ArtistSpotifyId, dto.ArtistImageUrl,
            dto.Location, dto.City, dto.Country, dto.EventDate, dto.EventTime,
            dto.Description, dto.TicketsUrl, dto.ArtistProfileUrl,
            dto.CreatedByUserId, dto.CreatedByDisplayName, dto.CreatedAt,
            dto.AttendeeCount, dto.IsAttendedByCurrentUser);

    private static PostResponse ToPostResponse(GetPostDto post, LikeStatusDto likes) =>
        new(post.Id, post.UserId, post.DisplayName, post.ProfileImageUrl,
            post.Content, post.SpotifyUri, post.SpotifyName, post.SpotifyCoverUrl,
            post.SpotifySubtitle, post.SpotifyMediaType, post.PreviewUrl,
            post.PreviewStartSecond, post.PreviewDuration,
            post.CreatedAt, likes.LikeCount, likes.IsLikedByCurrentUser,
            post.EventId, post.EventTitle);
}
