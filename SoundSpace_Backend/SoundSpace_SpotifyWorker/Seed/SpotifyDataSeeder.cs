using SoundSpaceBackend.Models.Entities;
using SoundSpaceBackend.Persistence;

namespace SoundSpace_SpotifyWorker.Seed;

public static class SpotifyDataSeeder
{
    public static async Task SeedAsync(ApplicationContext db)
    {
        if (db.TopArtists.Any(a => a.SpotifyArtistId == "seed_artist_001"))
            return;

        var user = db.Users.FirstOrDefault(u => u.SpotifyId == "mock_spotify_001");
        if (user == null)
            return;

        var now = DateTime.UtcNow;

        db.TopArtists.AddRange(
            new TopArtistEntry { UserId = user.Id, SpotifyArtistId = "seed_artist_001", Name = "Arctic Monkeys",  Rank = 1, ImageUrl = "https://i.scdn.co/image/ab6761610000e5eb7da39dea0a72f581535fb11f", SpotifyUrl = "https://open.spotify.com/artist/7Ln80lUS6He07XvHI8qqHH", UpdatedAt = now },
            new TopArtistEntry { UserId = user.Id, SpotifyArtistId = "seed_artist_002", Name = "Radiohead",        Rank = 2, ImageUrl = "https://i.scdn.co/image/ab6761610000e5eb3d9f55fdde1d8536c4dd1e14", SpotifyUrl = "https://open.spotify.com/artist/4Z8W4fKeB5YxbusRsdQVPb", UpdatedAt = now },
            new TopArtistEntry { UserId = user.Id, SpotifyArtistId = "seed_artist_003", Name = "The Weeknd",       Rank = 3, ImageUrl = "https://i.scdn.co/image/ab6761610000e5eb214f3cf1cbe7139c1e26ffbb", SpotifyUrl = "https://open.spotify.com/artist/1Xyo4u8uXC1ZmMpatF05PJ", UpdatedAt = now },
            new TopArtistEntry { UserId = user.Id, SpotifyArtistId = "seed_artist_004", Name = "Tame Impala",      Rank = 4, ImageUrl = "https://i.scdn.co/image/ab6761610000e5eb999b4a75af49e7ae0a7d1a56", SpotifyUrl = "https://open.spotify.com/artist/5INjqkS1o8h1imAzPqGZBb", UpdatedAt = now },
            new TopArtistEntry { UserId = user.Id, SpotifyArtistId = "seed_artist_005", Name = "Kendrick Lamar",   Rank = 5, ImageUrl = "https://i.scdn.co/image/ab6761610000e5eb437b9e2a82505b3d93ff1022", SpotifyUrl = "https://open.spotify.com/artist/2YZyLoL8N0Wb9xBt1NhZWg", UpdatedAt = now }
        );

        db.TopTracks.AddRange(
            new TopTrackEntry { UserId = user.Id, SpotifyTrackId = "seed_track_001", Title = "R U Mine?",           ArtistName = "Arctic Monkeys", Rank = 1, CoverUrl = "https://i.scdn.co/image/ab67616d0000b2732e4e8e360fa8d6871a0c2074", SpotifyUrl = "https://open.spotify.com/track/5WbHMQvNjCfDWBQJuijTyK", UpdatedAt = now },
            new TopTrackEntry { UserId = user.Id, SpotifyTrackId = "seed_track_002", Title = "Creep",                ArtistName = "Radiohead",       Rank = 2, CoverUrl = "https://i.scdn.co/image/ab67616d0000b273de3c04b08cc7a69658a89f50", SpotifyUrl = "https://open.spotify.com/track/70LcF31zb1H0PyJoS1Sx1r", UpdatedAt = now },
            new TopTrackEntry { UserId = user.Id, SpotifyTrackId = "seed_track_003", Title = "Blinding Lights",     ArtistName = "The Weeknd",      Rank = 3, CoverUrl = "https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36", SpotifyUrl = "https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b", UpdatedAt = now },
            new TopTrackEntry { UserId = user.Id, SpotifyTrackId = "seed_track_004", Title = "The Less I Know",     ArtistName = "Tame Impala",     Rank = 4, CoverUrl = "https://i.scdn.co/image/ab67616d0000b273c08ac7bf41f7c9ccc538c3ea", SpotifyUrl = "https://open.spotify.com/track/6K4t31amVTZDgR3sKmwUJJ", UpdatedAt = now },
            new TopTrackEntry { UserId = user.Id, SpotifyTrackId = "seed_track_005", Title = "HUMBLE.",             ArtistName = "Kendrick Lamar",  Rank = 5, CoverUrl = "https://i.scdn.co/image/ab67616d0000b2736dabb7f09c93b8c7a05d2957", SpotifyUrl = "https://open.spotify.com/track/7KXjTSCq5nL1LoYtL7XAwS", UpdatedAt = now }
        );

        db.RecentStreams.AddRange(
            new RecentStreamEntry { UserId = user.Id, SpotifyTrackId = "seed_track_001", Title = "R U Mine?",       ArtistName = "Arctic Monkeys", CoverUrl = "https://i.scdn.co/image/ab67616d0000b2732e4e8e360fa8d6871a0c2074", SpotifyUrl = "https://open.spotify.com/track/5WbHMQvNjCfDWBQJuijTyK", PlayedAt = now.AddMinutes(-5),  PolledAt = now },
            new RecentStreamEntry { UserId = user.Id, SpotifyTrackId = "seed_track_002", Title = "Creep",            ArtistName = "Radiohead",       CoverUrl = "https://i.scdn.co/image/ab67616d0000b273de3c04b08cc7a69658a89f50", SpotifyUrl = "https://open.spotify.com/track/70LcF31zb1H0PyJoS1Sx1r", PlayedAt = now.AddMinutes(-35), PolledAt = now },
            new RecentStreamEntry { UserId = user.Id, SpotifyTrackId = "seed_track_003", Title = "Blinding Lights",  ArtistName = "The Weeknd",      CoverUrl = "https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36", SpotifyUrl = "https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b", PlayedAt = now.AddHours(-2),   PolledAt = now },
            new RecentStreamEntry { UserId = user.Id, SpotifyTrackId = "seed_track_004", Title = "The Less I Know",  ArtistName = "Tame Impala",     CoverUrl = "https://i.scdn.co/image/ab67616d0000b273c08ac7bf41f7c9ccc538c3ea", SpotifyUrl = "https://open.spotify.com/track/6K4t31amVTZDgR3sKmwUJJ", PlayedAt = now.AddHours(-4),   PolledAt = now },
            new RecentStreamEntry { UserId = user.Id, SpotifyTrackId = "seed_track_005", Title = "HUMBLE.",          ArtistName = "Kendrick Lamar",  CoverUrl = "https://i.scdn.co/image/ab67616d0000b2736dabb7f09c93b8c7a05d2957", SpotifyUrl = "https://open.spotify.com/track/7KXjTSCq5nL1LoYtL7XAwS", PlayedAt = now.AddHours(-6),   PolledAt = now },
            new RecentStreamEntry { UserId = user.Id, SpotifyTrackId = "seed_track_006", Title = "Robbers",          ArtistName = "The 1975",        CoverUrl = "https://i.scdn.co/image/ab67616d0000b2731a2ba3b9f3d0d72dc65c7a2c", SpotifyUrl = "https://open.spotify.com/track/2374M0fQpWi3dLnB54qaLX", PlayedAt = now.AddHours(-8),   PolledAt = now },
            new RecentStreamEntry { UserId = user.Id, SpotifyTrackId = "seed_track_007", Title = "505",              ArtistName = "Arctic Monkeys",  CoverUrl = "https://i.scdn.co/image/ab67616d0000b2731717be4d536a2d67d8b95070", SpotifyUrl = "https://open.spotify.com/track/0BxE4FqsDD1Ot4YuBXwAPp", PlayedAt = now.AddHours(-12),  PolledAt = now },
            new RecentStreamEntry { UserId = user.Id, SpotifyTrackId = "seed_track_008", Title = "No Surprises",     ArtistName = "Radiohead",       CoverUrl = "https://i.scdn.co/image/ab67616d0000b273c8b444df094279e70d0ed856", SpotifyUrl = "https://open.spotify.com/track/10nyFdmSQFDl5wNrtc7bGn", PlayedAt = now.AddHours(-16),  PolledAt = now },
            new RecentStreamEntry { UserId = user.Id, SpotifyTrackId = "seed_track_009", Title = "Save Your Tears",  ArtistName = "The Weeknd",      CoverUrl = "https://i.scdn.co/image/ab67616d0000b2739516b1b2c946cced7bac61d6", SpotifyUrl = "https://open.spotify.com/track/5QO79kh1waicV47BqGRL3g", PlayedAt = now.AddHours(-20),  PolledAt = now },
            new RecentStreamEntry { UserId = user.Id, SpotifyTrackId = "seed_track_010", Title = "Eventually",       ArtistName = "Tame Impala",     CoverUrl = "https://i.scdn.co/image/ab67616d0000b2733e3b8b1319c6cdf77ffab69c", SpotifyUrl = "https://open.spotify.com/track/0OhLCu0nV1FfrHBMQRdUXv", PlayedAt = now.AddDays(-1),    PolledAt = now }
        );

        await db.SaveChangesAsync();
    }
}
