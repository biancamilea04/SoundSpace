using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SoundSpaceBackend.Models.Entities;

namespace SoundSpaceBackend.Persistence;

public class ApplicationContext(DbContextOptions<ApplicationContext> options) : IdentityDbContext<User, IdentityRole<Guid>, Guid>(options)
{
    public new DbSet<User> Users { get; set; }
    public DbSet<AppRefreshToken> AppRefreshTokens { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.SpotifyId)
                .IsUnique();

            entity.Property(u => u.DisplayName)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(u => u.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        modelBuilder.Entity<AppRefreshToken>(entity =>
        {
            entity.HasKey(t => t.Id);

            entity.HasIndex(t => t.Token)
                .IsUnique();

            entity.Property(t => t.Token)
                .IsRequired()
                .HasMaxLength(256);

            entity.HasOne(t => t.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}