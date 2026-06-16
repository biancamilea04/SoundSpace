namespace SoundSpaceBackend.Controllers.Events.Responses;

public record EventResponse(
    Guid Id,
    string Title,
    string? ImageUrl,
    string? CoverImageUrl,
    string? ArtistName,
    string? ArtistSpotifyId,
    string? ArtistImageUrl,
    string Location,
    string City,
    string Country,
    DateTime EventDate,
    TimeSpan EventTime,
    string? Genre,
    string? Description,
    string? TicketsUrl,
    string? ArtistProfileUrl,
    double? Latitude,
    double? Longitude,
    Guid CreatedByUserId,
    string CreatedByDisplayName,
    DateTime CreatedAt,
    int AttendeeCount,
    bool IsAttendedByCurrentUser
);
