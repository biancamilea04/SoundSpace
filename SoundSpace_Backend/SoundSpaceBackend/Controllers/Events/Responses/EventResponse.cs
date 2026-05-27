namespace SoundSpaceBackend.Controllers.Events.Responses;

public record EventResponse(
    Guid Id,
    string Title,
    string? ImageUrl,
    string ArtistName,
    string? ArtistSpotifyId,
    string? ArtistImageUrl,
    string Location,
    string City,
    string Country,
    DateTime EventDate,
    TimeSpan EventTime,
    string? Description,
    string? TicketsUrl,
    string? ArtistProfileUrl,
    Guid CreatedByUserId,
    string CreatedByDisplayName,
    DateTime CreatedAt,
    int AttendeeCount,
    bool IsAttendedByCurrentUser
);
