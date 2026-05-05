namespace SoundSpaceBackend.Models.Entities;

public class MessageReport
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid MessageId { get; set; }
    public Guid ReporterId { get; set; }
    public string Reason { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsResolved { get; set; } = false;

    public Message Message { get; set; } = null!;
    public User Reporter { get; set; } = null!;
}
