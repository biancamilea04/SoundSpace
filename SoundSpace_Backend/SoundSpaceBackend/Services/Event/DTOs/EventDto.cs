namespace SoundSpaceBackend.Services.Event.DTOs;

public record EventDto(
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

public record AttendeeDto(
    Guid UserId,
    string DisplayName,
    string? ProfileImageUrl
);

public record CreateEventDto(
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
    double? Longitude
);

public record UpdateEventDto(
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
    double? Longitude
);
