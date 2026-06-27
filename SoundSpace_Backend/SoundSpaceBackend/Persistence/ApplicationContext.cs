using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Pgvector.EntityFrameworkCore;
using SoundSpaceBackend.Models.Entities;

namespace SoundSpaceBackend.Persistence;

public class ApplicationContext(DbContextOptions<ApplicationContext> options)
    : IdentityDbContext<User, IdentityRole<Guid>, Guid>(options)
{
    public new DbSet<User> Users { get; set; }
    public DbSet<UserCurrentlyPlaying> UserCurrentlyPlayings { get; set; }
    public DbSet<UserLastPlayed> UserLastPlayeds { get; set; }
    public DbSet<AppRefreshToken> AppRefreshTokens { get; set; }
    public DbSet<Post> Posts { get; set; }
    public DbSet<Like> Likes { get; set; }
    public DbSet<Comment> Comments { get; set; }
    public DbSet<Friendship> Friendships { get; set; }
    public DbSet<Conversation> Conversations { get; set; }
    public DbSet<ConversationParticipant> ConversationParticipants { get; set; }
    public DbSet<Message> Messages { get; set; }
    public DbSet<MessageReport> MessageReports { get; set; }
    public DbSet<TopArtistEntry> TopArtists { get; set; }
    public DbSet<TopTrackEntry> TopTracks { get; set; }
    public DbSet<RecentStreamEntry> RecentStreams { get; set; }
    public DbSet<Event> Events { get; set; }
    public DbSet<EventAttendee> EventAttendees { get; set; }
    public DbSet<EventPhoto> EventPhotos { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<UserAudioProfile> UserAudioProfiles { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.HasPostgresExtension("vector");

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

        modelBuilder.Entity<UserCurrentlyPlaying>(entity =>
        {
            entity.HasKey(x => x.UserId);
            entity.HasOne(x => x.User)
                .WithOne(u => u.CurrentlyPlaying)
                .HasForeignKey<UserCurrentlyPlaying>(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<UserLastPlayed>(entity =>
        {
            entity.HasKey(x => x.UserId);
            entity.HasOne(x => x.User)
                .WithOne(u => u.LastPlayed)
                .HasForeignKey<UserLastPlayed>(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
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

            entity.HasOne(p => p.Event)
                .WithMany()
                .HasForeignKey(p => p.EventId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(p => new { p.EventId, p.CreatedAt }).IsDescending(false, true);
        });

        modelBuilder.Entity<Like>(entity =>
        {
            entity.HasKey(l => l.Id);
            entity.HasIndex(l => new { l.PostId, l.UserId }).IsUnique();
            entity.HasOne(l => l.Post).WithMany().HasForeignKey(l => l.PostId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(l => l.User).WithMany().HasForeignKey(l => l.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Comment>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.HasQueryFilter(c => !c.IsDeleted);
            entity.HasOne(c => c.Post).WithMany().HasForeignKey(c => c.PostId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(c => c.User).WithMany().HasForeignKey(c => c.UserId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(c => c.ParentComment).WithMany(c => c.Replies).HasForeignKey(c => c.ParentCommentId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Friendship>(entity =>
        {
            entity.HasKey(f => f.Id);
            entity.HasIndex(f => new { f.SenderId, f.ReceiverId }).IsUnique();
            entity.HasOne(f => f.Sender).WithMany().HasForeignKey(f => f.SenderId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(f => f.Receiver).WithMany().HasForeignKey(f => f.ReceiverId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Conversation>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.HasOne(c => c.Event)
                .WithOne(e => e.GroupConversation)
                .HasForeignKey<Conversation>(c => c.EventId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<ConversationParticipant>(entity =>
        {
            entity.HasKey(cp => new { cp.ConversationId, cp.UserId });
            entity.HasOne(cp => cp.Conversation).WithMany(c => c.Participants).HasForeignKey(cp => cp.ConversationId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(cp => cp.User).WithMany().HasForeignKey(cp => cp.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Message>(entity =>
        {
            entity.HasKey(m => m.Id);
            entity.HasOne(m => m.Conversation).WithMany(c => c.Messages).HasForeignKey(m => m.ConversationId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(m => m.Sender).WithMany().HasForeignKey(m => m.SenderId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<MessageReport>(entity =>
        {
            entity.HasKey(r => r.Id);
            entity.HasOne(r => r.Message).WithMany().HasForeignKey(r => r.MessageId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(r => r.Reporter).WithMany().HasForeignKey(r => r.ReporterId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<TopArtistEntry>(entity =>
        {
            entity.HasKey(a => a.Id);
            entity.HasOne(a => a.User).WithMany().HasForeignKey(a => a.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<TopTrackEntry>(entity =>
        {
            entity.HasKey(t => t.Id);
            entity.HasOne(t => t.User).WithMany().HasForeignKey(t => t.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<RecentStreamEntry>(entity =>
        {
            entity.HasKey(r => r.Id);
            entity.HasOne(r => r.User).WithMany().HasForeignKey(r => r.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Event>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.ArtistName).HasMaxLength(200);
            entity.Property(e => e.Location).HasMaxLength(300);
            entity.Property(e => e.City).HasMaxLength(100);
            entity.Property(e => e.Country).HasMaxLength(100);
            entity.Property(e => e.Description).HasMaxLength(2000);
            entity.Property(e => e.TicketsUrl).HasMaxLength(500);
            entity.Property(e => e.ArtistProfileUrl).HasMaxLength(500);
            entity.Property(e => e.ImageUrl).HasMaxLength(500);
            entity.Property(e => e.ArtistSpotifyId).HasMaxLength(100);
            entity.Property(e => e.ArtistImageUrl).HasMaxLength(500);

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(e => e.CreatedByUser)
                .WithMany()
                .HasForeignKey(e => e.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<EventAttendee>(entity =>
        {
            entity.HasKey(ea => new { ea.EventId, ea.UserId });

            entity.HasOne(ea => ea.Event)
                .WithMany(e => e.Attendees)
                .HasForeignKey(ea => ea.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(ea => ea.User)
                .WithMany()
                .HasForeignKey(ea => ea.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<EventPhoto>(entity =>
        {
            entity.HasKey(ep => ep.Id);

            entity.Property(ep => ep.FilePath)
                .IsRequired()
                .HasMaxLength(500);

            entity.Property(ep => ep.UploadedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(ep => ep.Event)
                .WithMany(e => e.Photos)
                .HasForeignKey(ep => ep.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(ep => ep.Uploader)
                .WithMany()
                .HasForeignKey(ep => ep.UploaderId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(n => n.Id);

            entity.Property(n => n.Type).IsRequired().HasMaxLength(50);
            entity.Property(n => n.Text).IsRequired().HasMaxLength(500);
            entity.Property(n => n.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(n => n.User)
                .WithMany()
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(n => new { n.UserId, n.IsRead, n.CreatedAt });
        });

        modelBuilder.Entity<UserAudioProfile>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.AudioVector).HasColumnType("vector(5)");
            entity.HasIndex(e => e.UserId).IsUnique();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.HasOne(e => e.User)
                  .WithOne()
                  .HasForeignKey<UserAudioProfile>(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
