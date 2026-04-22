using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SoundSpaceBackend.Models.Entities;

namespace SoundSpaceBackend.Persistence;

public class ApplicationContext(DbContextOptions<ApplicationContext> options) : IdentityDbContext<User, IdentityRole<Guid>, Guid>(options)
{
    public new DbSet<User> Users { get; set; }
    public DbSet<AppRefreshToken> AppRefreshTokens { get; set; }
    public DbSet<Post> Posts { get; set; }

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

        modelBuilder.Entity<Post>(entity =>
        {
            entity.HasKey(p => p.Id);

            entity.Property(p => p.Content)
                .IsRequired()
                .HasMaxLength(2000);

            entity.Property(p => p.SpotifyUri)
                .HasMaxLength(500);

            entity.Property(p => p.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.Property(p => p.IsDeleted)
                .HasDefaultValue(false);

            entity.HasIndex(p => p.IsDeleted);

            entity.HasQueryFilter(p => !p.IsDeleted);

            entity.HasOne(p => p.User)
                .WithMany(u => u.Posts)
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}