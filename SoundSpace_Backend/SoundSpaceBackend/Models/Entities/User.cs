using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace SoundSpaceBackend.Models.Entities;

public class User : IdentityUser<Guid>
{
    [Required] 
    [MaxLength(100)] 
    public string SpotifyId { get; set; } = string.Empty;

    [Required] 
    [MaxLength(100)] 
    public string DisplayName { get; set; } = string.Empty;
    
    public string Country { get; set; } = string.Empty;

    public int Followers { get; set; } = 0;
    
    [MaxLength(500)]
    public string? ProfileImageUrl { get; set; } 
    
    [Required] 
    public required string SpotifyAccessToken { get; set; } 

    [Required] 
    public string? SpotifyRefreshToken { get; set; }
    
    [Required] 
    public string? SpotifyTokenExpiresIn { get; set; }
    
    public DateTime SpotifyTokenExpiresAt { get; set; } = DateTime.UtcNow;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? LastSeen { get; set; }

    public bool IsListening { get; set; } = false;
    public string? CurrentlyPlayingTitle { get; set; }
    public string? CurrentlyPlayingArtist { get; set; }
    public string? CurrentlyPlayingArtistUrl { get; set; }
    public string? CurrentlyPlayingCoverUrl { get; set; }
    public string? CurrentlyPlayingUri { get; set; }
    public int CurrentlyPlayingProgressMs { get; set; } = 0;
    public string? LastPlayedTitle { get; set; }
    public string? LastPlayedArtist { get; set; }
    public string? LastPlayedArtistUrl { get; set; }
    public string? LastPlayedUri { get; set; }
    public string? LastPlayedCoverUrl { get; set; }
    public DateTime? MusicStatusUpdatedAt { get; set; }

    public ICollection<AppRefreshToken> RefreshTokens { get; set; } = new List<AppRefreshToken>();

    public ICollection<Post> Posts { get; set; } = new List<Post>();
}