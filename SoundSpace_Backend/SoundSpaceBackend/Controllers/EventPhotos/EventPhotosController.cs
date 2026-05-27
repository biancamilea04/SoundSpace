using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SoundSpaceBackend.Controllers.EventPhotos.Requests;
using SoundSpaceBackend.Controllers.EventPhotos.Responses;
using SoundSpaceBackend.Models.Entities;
using SoundSpaceBackend.Persistence;
using SoundSpaceBackend.Services.Photo.Abstractions;
using SoundSpaceBackend.Services.User.Abstractions;

namespace SoundSpaceBackend.Controllers.EventPhotos;

[ApiController]
[Route("api/events/{eventId:guid}/photos")]
[Authorize]
public class EventPhotosController(
    IPhotoService photoService,
    IUserService userService,
    ApplicationContext db) : ControllerBase
{
    // ── Helpers ────────────────────────────────────────────────────────────────

    private async Task<Guid?> GetCallerDbIdAsync()
    {
        var spotifyId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (spotifyId is null) return null;
        var entity = await userService.GetUserEntityBySpotifyIdAsync(spotifyId);
        return entity?.Id;
    }

    private static EventPhotoResponse ToResponse(EventPhoto p) =>
        new(p.Id, p.EventId, p.UploaderId, p.Uploader.DisplayName, p.FilePath, p.UploadedAt);

    // ── Endpoints ──────────────────────────────────────────────────────────────

    /// <summary>GET /api/events/{eventId}/photos — list all photos for an event.</summary>
    [HttpGet]
    public async Task<IActionResult> GetPhotos(Guid eventId)
    {
        var exists = await db.Events.AnyAsync(e => e.Id == eventId);
        if (!exists) return NotFound("Event not found.");

        var photos = await db.EventPhotos
            .Where(p => p.EventId == eventId)
            .OrderByDescending(p => p.UploadedAt)
            .Include(p => p.Uploader)
            .ToListAsync();

        return Ok(photos.Select(ToResponse));
    }

    /// <summary>
    /// POST /api/events/{eventId}/photos/file
    /// Accepts multipart/form-data with a single field named "file".
    /// </summary>
    [HttpPost("file")]
    public async Task<IActionResult> UploadFile(Guid eventId, IFormFile file)
    {
        if (file is null || file.Length == 0)
            return BadRequest("No file provided.");

        var userId = await GetCallerDbIdAsync();
        if (userId is null) return Unauthorized();

        var eventExists = await db.Events.AnyAsync(e => e.Id == eventId);
        if (!eventExists) return NotFound("Event not found.");

        try
        {
            var filePath = await photoService.SaveFileAsync(file);
            return await PersistPhotoAsync(eventId, userId.Value, filePath);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// POST /api/events/{eventId}/photos/url
    /// Accepts JSON body: { "url": "https://..." }
    /// Downloads the image server-side, validates it, and saves it to disk.
    /// </summary>
    [HttpPost("url")]
    public async Task<IActionResult> UploadFromUrl(
        Guid eventId,
        [FromBody] UploadPhotoFromUrlRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var userId = await GetCallerDbIdAsync();
        if (userId is null) return Unauthorized();

        var eventExists = await db.Events.AnyAsync(e => e.Id == eventId);
        if (!eventExists) return NotFound("Event not found.");

        try
        {
            var filePath = await photoService.SaveFromUrlAsync(request.Url);
            return await PersistPhotoAsync(eventId, userId.Value, filePath);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (HttpRequestException ex)
        {
            return BadRequest($"Could not download the image: {ex.Message}");
        }
    }

    // ── Shared helper ──────────────────────────────────────────────────────────

    private async Task<IActionResult> PersistPhotoAsync(Guid eventId, Guid uploaderId, string filePath)
    {
        var photo = new EventPhoto
        {
            EventId    = eventId,
            UploaderId = uploaderId,
            FilePath   = filePath,
        };
        db.EventPhotos.Add(photo);
        await db.SaveChangesAsync();

        // Re-load so the Uploader navigation property is populated for the response.
        await db.Entry(photo).Reference(p => p.Uploader).LoadAsync();

        return Created(
            $"/api/events/{eventId}/photos/{photo.Id}",
            ToResponse(photo));
    }
}
