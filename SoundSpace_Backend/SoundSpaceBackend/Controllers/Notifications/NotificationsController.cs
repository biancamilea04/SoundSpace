using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SoundSpaceBackend.Persistence;
using SoundSpaceBackend.Services.User.Abstractions;

namespace SoundSpaceBackend.Controllers.Notifications;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController(
    ApplicationContext db,
    IUserService userService) : ControllerBase
{
    private async Task<Guid?> GetCallerDbIdAsync()
    {
        var spotifyId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (spotifyId is null) return null;
        var entity = await userService.GetUserEntityBySpotifyIdAsync(spotifyId);
        return entity?.Id;
    }

    [HttpGet]
    public async Task<IActionResult> GetUnread()
    {
        var userId = await GetCallerDbIdAsync();
        if (userId is null) return Unauthorized();

        var notifications = await db.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .OrderByDescending(n => n.CreatedAt)
            .Select(n => new NotificationResponse(n.Id, n.Type, n.Text, n.ReferenceId, n.CreatedAt))
            .ToListAsync();

        return Ok(notifications);
    }

    [HttpPost("{id:guid}/read")]
    public async Task<IActionResult> MarkRead(Guid id)
    {
        var userId = await GetCallerDbIdAsync();
        if (userId is null) return Unauthorized();

        var notification = await db.Notifications
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

        if (notification is null) return NotFound();

        notification.IsRead = true;
        await db.SaveChangesAsync();

        return NoContent();
    }
}

public record NotificationResponse(
    Guid Id,
    string Type,
    string Text,
    Guid? ReferenceId,
    DateTime CreatedAt);
