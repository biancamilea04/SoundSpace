using System.ComponentModel.DataAnnotations;

namespace SoundSpaceBackend.Models.Entities;

public class Event
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? ImageUrl { get; set; }

    [MaxLength(200)]
    public string ArtistName { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? ArtistSpotifyId { get; set; }

    [MaxLength(500)]
    public string? ArtistImageUrl { get; set; }

    [MaxLength(300)]
    public string Location { get; set; } = string.Empty;

    [MaxLength(100)]
    public string City { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Country { get; set; } = string.Empty;

    public DateTime EventDate { get; set; }

    public TimeSpan EventTime { get; set; }

    [MaxLength(2000)]
    public string? Description { get; set; }

    [MaxLength(500)]
    public string? TicketsUrl { get; set; }

    [MaxLength(500)]
    public string? ArtistProfileUrl { get; set; }

    public Guid CreatedByUserId { get; set; }
    public User CreatedByUser { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<EventAttendee> Attendees { get; set; } = new List<EventAttendee>();
    public ICollection<EventPhoto> Photos { get; set; } = new List<EventPhoto>();
    public Conversation? GroupConversation { get; set; }
}
