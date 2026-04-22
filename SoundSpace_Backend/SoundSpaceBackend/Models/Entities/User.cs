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

    public ICollection<AppRefreshToken> RefreshTokens { get; set; } = new List<AppRefreshToken>();

    public ICollection<Post> Posts { get; set; } = new List<Post>();
}