namespace SoundSpaceBackend.Models.Entities;

public class Conversation
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public bool IsGroup { get; set; } = false;
    public Guid? EventId { get; set; }
    public Event? Event { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ConversationParticipant> Participants { get; set; } = new List<ConversationParticipant>();
    public ICollection<Message> Messages { get; set; } = new List<Message>();
}
