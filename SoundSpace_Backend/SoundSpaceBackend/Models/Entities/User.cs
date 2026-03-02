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
    
    [MaxLength(500)]
    public string? ProfileImageUrl { get; set; } 
    
    public string SpotifyAccessToken { get; set; } 

    public string? SpotifyRefreshToken { get; set; }
    
    public string? SpotifyTokenExpiresAt { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

}