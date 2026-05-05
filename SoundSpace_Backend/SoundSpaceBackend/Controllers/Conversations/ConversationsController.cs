using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SoundSpaceBackend.Controllers.Conversations.Requests;
using SoundSpaceBackend.Controllers.Conversations.Responses;
using SoundSpaceBackend.Services.Conversation.Abstractions;
using SoundSpaceBackend.Services.Message.Abstractions;
using SoundSpaceBackend.Services.User.Abstractions;

namespace SoundSpaceBackend.Controllers.Conversations;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ConversationsController(
    IConversationService conversationService,
    IMessageService messageService,
    IUserService userService,
    ILogger<ConversationsController> logger) : ControllerBase
{
    private readonly ILogger<ConversationsController> _logger = logger;

    [HttpGet]
    public async Task<IActionResult> GetConversations()
    {
        var userId = await ResolveUserIdAsync();
        if (userId == null) return Unauthorized();

        var conversations = await conversationService.GetUserConversationsAsync(userId.Value);
        return Ok(conversations);
    }

    [HttpPost]
    public async Task<IActionResult> CreateConversation([FromBody] CreateConversationRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = await ResolveUserIdAsync();
        if (userId == null) return Unauthorized();

        var conversation = await conversationService.GetOrCreateDirectConversationAsync(userId.Value, request.TargetUserId);
        return Ok(conversation);
    }

    [HttpPost("direct")]
    public async Task<IActionResult> GetOrCreateDirectChat([FromBody] CreateConversationRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = await ResolveUserIdAsync();
        if (userId == null) return Unauthorized();

        if (userId.Value == request.TargetUserId)
            return BadRequest("Cannot create a conversation with yourself");

        var (conversationId, isNew) =
            await conversationService.GetOrCreateDirectConversationSlimAsync(userId.Value, request.TargetUserId);

        var dto = new DirectChatResultDto(conversationId);

        return isNew
            ? StatusCode(StatusCodes.Status201Created, dto)
            : Ok(dto);
    }

    [HttpGet("recent-contacts")]
    public async Task<IActionResult> GetRecentContacts()
    {
        var userId = await ResolveUserIdAsync();
        if (userId == null) return Unauthorized();

        var contacts = await conversationService.GetRecentContactsAsync(userId.Value);
        return Ok(contacts);
    }

    [HttpGet("{id:guid}/messages")]
    public async Task<IActionResult> GetMessages(Guid id, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        var userId = await ResolveUserIdAsync();
        if (userId == null) return Unauthorized();

        if (!await conversationService.IsParticipantAsync(id, userId.Value))
            return Forbid();

        var messages = await messageService.GetConversationMessagesAsync(id, page, pageSize);
        return Ok(messages);
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadConversationCount()
    {
        var userId = await ResolveUserIdAsync();
        if (userId == null) return Unauthorized();

        var count = await conversationService.GetUnreadConversationCountAsync(userId.Value);
        return Ok(new { count });
    }

    private async Task<Guid?> ResolveUserIdAsync()
    {
        var spotifyId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (spotifyId == null)
        {
            _logger.LogWarning("[Conversations] Spotify ID claim missing in token");
            return null;
        }

        var user = await userService.GetUserEntityBySpotifyIdAsync(spotifyId);
        return user?.Id;
    }
}
