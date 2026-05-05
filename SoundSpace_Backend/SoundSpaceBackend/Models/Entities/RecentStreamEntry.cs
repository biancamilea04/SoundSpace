namespace SoundSpaceBackend.Models.Entities;

public class RecentStreamEntry
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string SpotifyTrackId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string ArtistName { get; set; } = string.Empty;
    public string? ArtistUrl { get; set; }
    public string? CoverUrl { get; set; }
    public string? SpotifyUrl { get; set; }
    public DateTime PlayedAt { get; set; }
    public DateTime PolledAt { get; set; } = DateTime.UtcNow;
}
