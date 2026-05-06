using SoundSpaceBackend.Models.Enums;

namespace SoundSpaceBackend.Models.Entities;

public class Friendship
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid SenderId { get; set; }
    public Guid ReceiverId { get; set; }
    public FriendshipStatus Status { get; set; } = FriendshipStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public User Sender { get; set; } = null!;
    public User Receiver { get; set; } = null!;
}
