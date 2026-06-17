namespace SoundSpaceBackend.Models.Entities;

public class UserLastPlayed
{
    public Guid UserId { get; set; }
    public string? Title { get; set; }
    public string? Artist { get; set; }
    public string? ArtistUrl { get; set; }
    public string? Uri { get; set; }
    public string? CoverUrl { get; set; }

    public User User { get; set; } = null!;
}
