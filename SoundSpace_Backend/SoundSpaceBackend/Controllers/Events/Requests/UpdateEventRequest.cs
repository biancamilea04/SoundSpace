using System.ComponentModel.DataAnnotations;

namespace SoundSpaceBackend.Controllers.Events.Requests;

public record UpdateEventRequest(
    [Required] [MaxLength(200)] string Title,
    [MaxLength(500)] string? ImageUrl,
    [MaxLength(500)] string? CoverImageUrl,
    [MaxLength(200)] string? ArtistName,
    [MaxLength(100)] string? ArtistSpotifyId,
    [MaxLength(500)] string? ArtistImageUrl,
    [Required] [MaxLength(300)] string Location,
    [Required] [MaxLength(100)] string City,
    [Required] [MaxLength(100)] string Country,
    [Required] DateTime EventDate,
    [Required] TimeSpan EventTime,
    [MaxLength(100)] string? Genre,
    [MaxLength(2000)] string? Description,
    [MaxLength(500)] string? TicketsUrl,
    [MaxLength(500)] string? ArtistProfileUrl,
    double? Latitude,
    double? Longitude
);
