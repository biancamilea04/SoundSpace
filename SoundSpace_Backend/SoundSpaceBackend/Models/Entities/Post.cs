using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SoundSpaceBackend.Models.Entities;

public class Post
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid UserId { get; set; }

    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;

    [Required]
    [MaxLength(2000)]
    public string Content { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? SpotifyUri { get; set; }

    [MaxLength(500)]
    public string? SpotifyName { get; set; }

    [MaxLength(500)]
    public string? SpotifyCoverUrl { get; set; }

    [MaxLength(500)]
    public string? SpotifySubtitle { get; set; }

    [MaxLength(500)]
    public string? SpotifySubtitleUrl { get; set; }

    [MaxLength(50)]
    public string? SpotifyMediaType { get; set; }

    [MaxLength(500)]
    public string? PreviewUrl { get; set; }

    public int? PreviewStartSecond { get; set; }

    public int? PreviewDuration { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public bool IsDeleted { get; set; }

    public DateTime? DeletedAt { get; set; }

    public Guid? EventId { get; set; }
    public Event? Event { get; set; }
}
