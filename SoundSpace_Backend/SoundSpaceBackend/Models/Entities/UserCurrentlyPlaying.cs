namespace SoundSpaceBackend.Models.Entities;

public class UserCurrentlyPlaying
{
    public Guid UserId { get; set; }
    public bool IsListening { get; set; } = false;
    public string? Title { get; set; }
    public string? Artist { get; set; }
    public string? ArtistUrl { get; set; }
    public string? CoverUrl { get; set; }
    public string? Uri { get; set; }
    public int ProgressMs { get; set; } = 0;
    public DateTime? UpdatedAt { get; set; }

    public User User { get; set; } = null!;
}
