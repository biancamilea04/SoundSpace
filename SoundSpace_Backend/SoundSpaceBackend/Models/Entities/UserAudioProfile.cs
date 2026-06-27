using Pgvector;

namespace SoundSpaceBackend.Models.Entities;

public class UserAudioProfile
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public Vector AudioVector { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
