using SoundSpaceBackend.Services.Event.DTOs;

namespace SoundSpaceBackend.Services.Event.Abstractions;

public interface IEventService
{
    Task<EventDto> CreateEventAsync(Guid userId, CreateEventDto dto);
    Task<EventDto?> GetByIdAsync(Guid eventId, Guid currentUserId);
    Task<List<EventDto>> GetPopularEventsAsync(Guid currentUserId);
    Task<List<EventDto>> GetRecommendedEventsAsync(Guid currentUserId);
    Task<List<EventDto>> GetFriendsEventsAsync(Guid currentUserId);
    Task<List<EventDto>> GetMyEventsAsync(Guid currentUserId);
    Task<bool> ToggleAttendanceAsync(Guid eventId, Guid userId);
}
