using Microsoft.EntityFrameworkCore;
using SoundSpaceBackend.Models.Enums;
using SoundSpaceBackend.Persistence;
using SoundSpaceBackend.Services.Event.Abstractions;
using SoundSpaceBackend.Services.Event.DTOs;
using EventEntity = SoundSpaceBackend.Models.Entities.Event;

namespace SoundSpaceBackend.Services.Event;

public class EventService(
    ApplicationContext dbContext,
    ILogger<EventService> logger) : IEventService
{
    public async Task<EventDto> CreateEventAsync(Guid userId, CreateEventDto dto)
    {
        logger.LogInformation("[Event] Creating event '{Title}' for UserId={UserId}", dto.Title, userId);

        var user = await dbContext.Users.FindAsync(userId)
            ?? throw new KeyNotFoundException($"User {userId} not found.");

        var ev = new EventEntity
        {
            Title = dto.Title,
            ImageUrl = dto.ImageUrl,
            ArtistName = dto.ArtistName,
            ArtistSpotifyId = dto.ArtistSpotifyId,
            ArtistImageUrl = dto.ArtistImageUrl,
            Location = dto.Location,
            City = dto.City,
            Country = dto.Country,
            EventDate = dto.EventDate,
            EventTime = dto.EventTime,
            Description = dto.Description,
            TicketsUrl = dto.TicketsUrl,
            ArtistProfileUrl = dto.ArtistProfileUrl,
            CreatedByUserId = userId
        };

        dbContext.Events.Add(ev);
        await dbContext.SaveChangesAsync();

        return ToDto(ev, user.DisplayName, 0, false);
    }

    public async Task<EventDto?> GetByIdAsync(Guid eventId, Guid currentUserId)
    {
        var ev = await dbContext.Events
            .Include(e => e.Attendees)
            .Include(e => e.CreatedByUser)
            .FirstOrDefaultAsync(e => e.Id == eventId);

        if (ev is null) return null;

        var isAttended = ev.Attendees.Any(a => a.UserId == currentUserId);
        return ToDto(ev, ev.CreatedByUser.DisplayName, ev.Attendees.Count, isAttended);
    }

    public async Task<List<EventDto>> GetPopularEventsAsync(Guid currentUserId)
    {
        var attendedIds = await GetAttendedEventIdsAsync(currentUserId);

        return await dbContext.Events
            .Include(e => e.Attendees)
            .Include(e => e.CreatedByUser)
            .OrderByDescending(e => e.Attendees.Count)
            .Take(20)
            .Select(e => ToDto(e, e.CreatedByUser.DisplayName, e.Attendees.Count, attendedIds.Contains(e.Id)))
            .ToListAsync();
    }

    public async Task<List<EventDto>> GetRecommendedEventsAsync(Guid currentUserId)
    {
        var topArtistNames = await dbContext.TopArtists
            .Where(a => a.UserId == currentUserId)
            .Select(a => a.Name.ToLower())
            .ToListAsync();

        if (topArtistNames.Count == 0)
            return [];

        var attendedIds = await GetAttendedEventIdsAsync(currentUserId);

        return await dbContext.Events
            .Include(e => e.Attendees)
            .Include(e => e.CreatedByUser)
            .Where(e => topArtistNames.Contains(e.ArtistName.ToLower()))
            .OrderByDescending(e => e.EventDate)
            .Take(20)
            .Select(e => ToDto(e, e.CreatedByUser.DisplayName, e.Attendees.Count, attendedIds.Contains(e.Id)))
            .ToListAsync();
    }

    public async Task<List<EventDto>> GetFriendsEventsAsync(Guid currentUserId)
    {
        var friendIds = await dbContext.Friendships
            .Where(f =>
                (f.SenderId == currentUserId || f.ReceiverId == currentUserId) &&
                f.Status == FriendshipStatus.Accepted)
            .Select(f => f.SenderId == currentUserId ? f.ReceiverId : f.SenderId)
            .ToListAsync();

        if (friendIds.Count == 0)
            return [];

        var attendedIds = await GetAttendedEventIdsAsync(currentUserId);

        return await dbContext.Events
            .Include(e => e.Attendees)
            .Include(e => e.CreatedByUser)
            .Where(e => e.Attendees.Any(a => friendIds.Contains(a.UserId)))
            .OrderByDescending(e => e.EventDate)
            .Take(20)
            .Select(e => ToDto(e, e.CreatedByUser.DisplayName, e.Attendees.Count, attendedIds.Contains(e.Id)))
            .ToListAsync();
    }

    public async Task<List<EventDto>> GetMyEventsAsync(Guid currentUserId)
    {
        return await dbContext.Events
            .Include(e => e.Attendees)
            .Include(e => e.CreatedByUser)
            .Where(e =>
                e.Attendees.Any(a => a.UserId == currentUserId) ||
                e.CreatedByUserId == currentUserId)
            .OrderByDescending(e => e.EventDate)
            .Select(e => ToDto(e, e.CreatedByUser.DisplayName, e.Attendees.Count, true))
            .ToListAsync();
    }

    public async Task<bool> ToggleAttendanceAsync(Guid eventId, Guid userId)
    {
        var ev = await dbContext.Events.FindAsync(eventId)
            ?? throw new KeyNotFoundException($"Event {eventId} not found.");

        var existing = await dbContext.EventAttendees
            .FirstOrDefaultAsync(a => a.EventId == eventId && a.UserId == userId);

        if (existing is not null)
        {
            dbContext.EventAttendees.Remove(existing);
            await dbContext.SaveChangesAsync();
            logger.LogInformation("[Event] UserId={UserId} left EventId={EventId}", userId, eventId);
            return false;
        }

        dbContext.EventAttendees.Add(new Models.Entities.EventAttendee
        {
            EventId = eventId,
            UserId = userId
        });
        await dbContext.SaveChangesAsync();
        logger.LogInformation("[Event] UserId={UserId} joined EventId={EventId}", userId, eventId);
        return true;
    }

    private async Task<HashSet<Guid>> GetAttendedEventIdsAsync(Guid userId)
    {
        var ids = await dbContext.EventAttendees
            .Where(a => a.UserId == userId)
            .Select(a => a.EventId)
            .ToListAsync();
        return [..ids];
    }

    private static EventDto ToDto(EventEntity e, string creatorDisplayName, int attendeeCount, bool isAttended) =>
        new(e.Id, e.Title, e.ImageUrl, e.ArtistName, e.ArtistSpotifyId, e.ArtistImageUrl,
            e.Location, e.City, e.Country, e.EventDate, e.EventTime,
            e.Description, e.TicketsUrl, e.ArtistProfileUrl,
            e.CreatedByUserId, creatorDisplayName, e.CreatedAt,
            attendeeCount, isAttended);
}
