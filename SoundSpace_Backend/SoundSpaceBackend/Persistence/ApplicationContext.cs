using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SoundSpaceBackend.Models.Entities;

namespace SoundSpaceBackend.Persistence;

public class ApplicationContext(DbContextOptions<ApplicationContext> options) : IdentityDbContext<User, IdentityRole<Guid>, Guid>(options)
{
    public DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.Entity<User>(entity => {
                entity.HasIndex(u => u.SpotifyId)
                    .IsUnique();
                
                entity.Property(u => u.DisplayName)
                    .IsRequired()
                    .HasMaxLength(100);
                
                entity.Property(u => u.DisplayName)
                    .IsRequired()
                    .HasMaxLength(100);
                
                entity.Property(u => u.CreatedAt)
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");
        }
        );
    }

}