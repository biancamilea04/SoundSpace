using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SoundSpaceBackend.Controllers.Messages.Requests;
using SoundSpaceBackend.Models.Entities;
using SoundSpaceBackend.Persistence;
using SoundSpaceBackend.Services.Conversation.DTOs;
using SoundSpaceBackend.Services.User.Abstractions;

namespace SoundSpaceBackend.Controllers.Messages;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MessagesController(
    ApplicationContext db,
    IUserService userService,
    ILogger<MessagesController> logger) : ControllerBase
{
    private readonly ILogger<MessagesController> _logger = logger;

    [HttpPost("{messageId:guid}/report")]
    public async Task<IActionResult> ReportMessage(Guid messageId, [FromBody] ReportMessageRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var spotifyId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (spotifyId == null)
        {
            _logger.LogWarning("[Messages] Spotify ID claim missing in token");
            return Unauthorized();
        }

        var user = await userService.GetUserEntityBySpotifyIdAsync(spotifyId);
        if (user is null) return Unauthorized();

        var report = new MessageReport
        {
            MessageId = messageId,
            ReporterId = user.Id,
            Reason = request.Reason
        };

        db.MessageReports.Add(report);
        await db.SaveChangesAsync();

        return Created($"/api/messages/{messageId}/report", null);
    }

    [HttpGet("conversations/{conversationId:guid}/full-history")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetFullHistory(Guid conversationId)
    {
        var messages = await db.Messages
            .IgnoreQueryFilters()
            .Where(m => m.ConversationId == conversationId)
            .OrderBy(m => m.CreatedAt)
            .Select(m => new MessageDto(
                m.Id,
                m.ConversationId,
                m.SenderId,
                m.Text,
                m.CreatedAt,
                m.IsDeleted,
                m.IsRead,
                m.ReadAt))
            .ToListAsync();

        return Ok(messages);
    }
}
