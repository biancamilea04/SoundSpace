using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using SoundSpaceBackend.Hubs;
using SoundSpaceBackend.Models.Enums;
using SoundSpaceBackend.Persistence;
using SoundSpaceBackend.Services.Event.Abstractions;
using SoundSpaceBackend.Services.Event.DTOs;
using EventEntity = SoundSpaceBackend.Models.Entities.Event;

namespace SoundSpaceBackend.Services.Event;

public class EventService(
    ApplicationContext dbContext,
    ILogger<EventService> logger,
    IHubContext<PresenceHub> hubContext) : IEventService
{
    public async Task<EventDto> CreateEventAsync(Guid userId, CreateEventDto dto)
    {
        logger.LogInformation("[Event] Creating event '{Title}' for UserId={UserId}", dto.Title, userId);

        var user = await dbContext.Users.FindAsync(userId)
            ?? throw new KeyNotFoundException($"User {userId} not found");

        var ev = new EventEntity
        {
            Title = dto.Title,
            ImageUrl = dto.ImageUrl,
            CoverImageUrl = dto.CoverImageUrl,
            ArtistName = dto.ArtistName,
            ArtistSpotifyId = dto.ArtistSpotifyId,
            ArtistImageUrl = dto.ArtistImageUrl,
            Location = dto.Location,
            City = dto.City,
            Country = dto.Country,
            EventDate = dto.EventDate,
            EventTime = dto.EventTime,
            Genre = dto.Genre,
            Description = dto.Description,
            TicketsUrl = dto.TicketsUrl,
            ArtistProfileUrl = dto.ArtistProfileUrl,
            Latitude = dto.Latitude,
            Longitude = dto.Longitude,
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
            .Where(e => e.ArtistName != null && topArtistNames.Contains(e.ArtistName.ToLower()))
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

        if (ev.CreatedByUserId != userId)
        {
            var joiner = await dbContext.Users.FindAsync(userId);
            var notification = new Models.Entities.Notification
            {
                UserId = ev.CreatedByUserId,
                Type = "EventJoin",
                Text = $"{joiner?.DisplayName ?? "Someone"} joined your event \"{ev.Title}\"",
                ReferenceId = ev.Id,
            };
            dbContext.Notifications.Add(notification);
            await dbContext.SaveChangesAsync();

            await hubContext.Clients
                .Group($"user-{ev.CreatedByUserId}")
                .SendAsync("EventAttendeeJoined", new
                {
                    id = notification.Id,
                    text = notification.Text,
                    referenceId = notification.ReferenceId,
                    createdAt = notification.CreatedAt,
                });
        }

        return true;
    }

    public async Task<List<AttendeeDto>> GetAttendeesAsync(Guid eventId, int limit)
    {
        return await dbContext.EventAttendees
            .Include(a => a.User)
            .Where(a => a.EventId == eventId)
            .OrderByDescending(a => a.JoinedAt)
            .Take(limit)
            .Select(a => new AttendeeDto(a.UserId, a.User.DisplayName, a.User.ProfileImageUrl))
            .ToListAsync();
    }

    public async Task<List<EventDto>> GetCreatedEventsAsync(Guid userId)
    {
        return await dbContext.Events
            .Include(e => e.Attendees)
            .Include(e => e.CreatedByUser)
            .Where(e => e.CreatedByUserId == userId)
            .OrderByDescending(e => e.EventDate)
            .Take(50)
            .Select(e => ToDto(e, e.CreatedByUser.DisplayName, e.Attendees.Count,
                e.Attendees.Any(a => a.UserId == userId)))
            .ToListAsync();
    }

    public async Task<EventDto> UpdateEventAsync(Guid eventId, Guid userId, UpdateEventDto dto)
    {
        var ev = await dbContext.Events
            .Include(e => e.Attendees)
            .Include(e => e.CreatedByUser)
            .FirstOrDefaultAsync(e => e.Id == eventId)
            ?? throw new KeyNotFoundException($"Event {eventId} not found.");

        if (ev.CreatedByUserId != userId)
            throw new UnauthorizedAccessException("Not the event creator.");

        ev.Title = dto.Title;
        ev.ImageUrl = dto.ImageUrl;
        ev.CoverImageUrl = dto.CoverImageUrl;
        ev.ArtistName = dto.ArtistName;
        ev.ArtistSpotifyId = dto.ArtistSpotifyId;
        ev.ArtistImageUrl = dto.ArtistImageUrl;
        ev.Location = dto.Location;
        ev.City = dto.City;
        ev.Country = dto.Country;
        ev.EventDate = dto.EventDate;
        ev.EventTime = dto.EventTime;
        ev.Genre = dto.Genre;
        ev.Description = dto.Description;
        ev.TicketsUrl = dto.TicketsUrl;
        ev.ArtistProfileUrl = dto.ArtistProfileUrl;
        ev.Latitude = dto.Latitude;
        ev.Longitude = dto.Longitude;

        await dbContext.SaveChangesAsync();

        return ToDto(ev, ev.CreatedByUser.DisplayName, ev.Attendees.Count,
            ev.Attendees.Any(a => a.UserId == userId));
    }

    public async Task DeleteEventAsync(Guid eventId, Guid userId)
    {
        var ev = await dbContext.Events.FindAsync(eventId)
            ?? throw new KeyNotFoundException($"Event {eventId} not found.");

        if (ev.CreatedByUserId != userId)
            throw new UnauthorizedAccessException("Not the event creator.");

        dbContext.Events.Remove(ev);
        await dbContext.SaveChangesAsync();
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
        new(e.Id, e.Title, e.ImageUrl, e.CoverImageUrl, e.ArtistName, e.ArtistSpotifyId, e.ArtistImageUrl,
            e.Location, e.City, e.Country, e.EventDate, e.EventTime,
            e.Genre, e.Description, e.TicketsUrl, e.ArtistProfileUrl,
            e.Latitude, e.Longitude,
            e.CreatedByUserId, creatorDisplayName, e.CreatedAt,
            attendeeCount, isAttended);
}
