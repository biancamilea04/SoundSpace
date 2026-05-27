using System.ComponentModel.DataAnnotations;

namespace SoundSpaceBackend.Models.Entities;

public class EventPhoto
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid EventId { get; set; }
    public Event Event { get; set; } = null!;

    public Guid UploaderId { get; set; }
    public User Uploader { get; set; } = null!;

    [Required]
    [MaxLength(500)]
    public string FilePath { get; set; } = string.Empty;

    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
}
