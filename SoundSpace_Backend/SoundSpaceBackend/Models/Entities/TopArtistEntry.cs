namespace SoundSpaceBackend.Models.Entities;

public class TopArtistEntry
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string SpotifyArtistId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public string? SpotifyUrl { get; set; }
    public int Rank { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
