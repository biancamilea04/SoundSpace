using Microsoft.AspNetCore.Identity;
using SoundSpaceBackend.Models.Entities;
using SoundSpaceBackend.Persistence;

namespace SoundSpaceBackend.Seed;

public static class DataSeeder
{
    private static readonly IPasswordHasher<User> Hasher = new PasswordHasher<User>();

    private static readonly Dictionary<string, (double Lat, double Lon)> MockLocations = new()
    {
        ["mock_spotify_001"] = (47.17474360453262, 27.549144968755872),
        ["mock_spotify_002"] = (47.17474360453262, 27.549144968755872),
        ["mock_spotify_003"] = (47.17474360453262, 27.549144968755872),
        ["mock_spotify_004"] = (47.17474360453262, 27.549144968755872),
        ["mock_spotify_005"] = (47.17474360453262, 27.549144968755872),
        ["mock_spotify_006"] = (47.17474360453262, 27.549144968755872),
        ["mock_spotify_007"] = (47.17474360453262, 27.549144968755872),
        ["mock_spotify_008"] = (47.17474360453262, 27.549144968755872),
        ["mock_spotify_009"] = (47.17474360453262, 27.549144968755872),
        ["mock_spotify_010"] = (47.17474360453262, 27.549144968755872),
    };

    private static readonly Dictionary<string, (string Id, string Name)[]> MockArtists = new()
    {
        ["mock_spotify_001"] = [
            ("7Ln80lUS6He07XvHI8qqHH", "Arctic Monkeys"),
            ("2n2RSaZqBuUUukhbLlpnE6", "Sleep Token"),
            ("1Xyo4u8uXC1ZmMpatF05PJ", "The Weeknd"),
            ("5INjqkS1o8h1imAzPqGZBb", "Tame Impala"),
            ("6MwPCCR936cYfM1dLsGVnl", "Motionless In White"),
        ],
        ["mock_spotify_002"] = [
            ("1Xyo4u8uXC1ZmMpatF05PJ", "The Weeknd"),
            ("05qpk4JDcLSFNJSsPIZ8Ye", "The Motans"),
            ("1n5LD9Ar3D6RK2X2ewGvXb", "Carla's Dreams"),
            ("6qqNVTkY8uBg9cP3Jd7DAH", "Billie Eilish"),
            ("06HL4z0CvFAxyc27GXpf02", "Taylor Swift"),
        ],
        ["mock_spotify_003"] = [
            ("7Ln80lUS6He07XvHI8qqHH", "Arctic Monkeys"),
            ("2n2RSaZqBuUUukhbLlpnE6", "Sleep Token"),
            ("4Z8W4fKeB5YxbusRsdQVPb", "Radiohead"),
            ("4gzpq5DPGxSnKTe4SA8HAU", "Coldplay"),
            ("05qpk4JDcLSFNJSsPIZ8Ye", "The Motans"),
        ],
        ["mock_spotify_004"] = [
            ("2n2RSaZqBuUUukhbLlpnE6", "Sleep Token"),
            ("6MwPCCR936cYfM1dLsGVnl", "Motionless In White"),
            ("2YZyLoL8N0Wb9xBt1NhZWg", "Kendrick Lamar"),
            ("3TVXtAsR1Inumwj472S9r4", "Drake"),
            ("0Y5tJX1MQlPlqiwlOH1tJY", "Travis Scott"),
        ],
        ["mock_spotify_005"] = [
            ("05qpk4JDcLSFNJSsPIZ8Ye", "The Motans"),
            ("1n5LD9Ar3D6RK2X2ewGvXb", "Carla's Dreams"),
            ("2Bfpg6VC7SNEQKez2uXyuP", "Alternosfera"),
            ("1OQa8VMULlbmbFmDcdfBZj", "Irina Rimes"),
            ("5INjqkS1o8h1imAzPqGZBb", "Tame Impala"),
        ],
        ["mock_spotify_006"] = [
            ("1Xyo4u8uXC1ZmMpatF05PJ", "The Weeknd"),
            ("1n5LD9Ar3D6RK2X2ewGvXb", "Carla's Dreams"),
            ("2Bfpg6VC7SNEQKez2uXyuP", "Alternosfera"),
            ("1OQa8VMULlbmbFmDcdfBZj", "Irina Rimes"),
            ("3TVXtAsR1Inumwj472S9r4", "Drake"),
        ],
        ["mock_spotify_007"] = [
            ("06HL4z0CvFAxyc27GXpf02", "Taylor Swift"),
            ("05qpk4JDcLSFNJSsPIZ8Ye", "The Motans"),
            ("1n5LD9Ar3D6RK2X2ewGvXb", "Carla's Dreams"),
            ("1McMsnEElThX1knmY4oliG", "Olivia Rodrigo"),
            ("6qqNVTkY8uBg9cP3Jd7DAH", "Billie Eilish"),
        ],
        ["mock_spotify_008"] = [
            ("2n2RSaZqBuUUukhbLlpnE6", "Sleep Token"),
            ("7Ln80lUS6He07XvHI8qqHH", "Arctic Monkeys"),
            ("1Xyo4u8uXC1ZmMpatF05PJ", "The Weeknd"),
            ("5INjqkS1o8h1imAzPqGZBb", "Tame Impala"),
            ("4gzpq5DPGxSnKTe4SA8HAU", "Coldplay"),
        ],
        ["mock_spotify_009"] = [
            ("1OQa8VMULlbmbFmDcdfBZj", "Irina Rimes"),
            ("4dpARuHxo51G3z768sgnrY", "Adele"),
            ("00FQb4jTyendYWaN8pK0wa", "Lana Del Rey"),
            ("0du5cEVh5yTK9QJze8zA0C", "Bruno Mars"),
            ("6vWDO969PvNqNYHIOW5v0m", "Beyoncé"),
        ],
        ["mock_spotify_010"] = [
            ("6MwPCCR936cYfM1dLsGVnl", "Motionless In White"),
            ("4gzpq5DPGxSnKTe4SA8HAU", "Coldplay"),
            ("53XhwfbYqKCa1cC15pYq2q", "Imagine Dragons"),
            ("711MCceyCBcFnzjGY4Q7Un", "AC/DC"),
            ("1dfeR4HaWDbWqFHLkxsg1d", "Queen"),
        ],
    };

    public static async Task SeedAsync(ApplicationContext db)
    {
        if (db.Users.Any(u => u.SpotifyId.StartsWith("mock_")))
        {
            await EnsureLocationsAsync(db);
            await EnsureMockArtistsAsync(db);
            return;
        }

        var now = DateTime.UtcNow;

        var users = new[]
        {
            MakeUser("mock_spotify_001", "Alex Turner",    "alex.turner@soundspace.dev",    "RO", 1240, null, 47.17474360453262, 27.549144968755872),
            MakeUser("mock_spotify_002", "Maya Chen",      "maya.chen@soundspace.dev",      "RO", 843,  null, 47.17474360453262, 27.549144968755872),
            MakeUser("mock_spotify_003", "Luca Rossi",     "luca.rossi@soundspace.dev",     "RO", 2105, null, 47.17474360453262, 27.549144968755872),
            MakeUser("mock_spotify_004", "Yuki Tanaka",    "yuki.tanaka@soundspace.dev",    "RO", 390,  null, 47.17474360453262, 27.549144968755872),
            MakeUser("mock_spotify_005", "Sofia Andrade",  "sofia.andrade@soundspace.dev",  "RO", 678,  null, 47.17474360453262, 27.549144968755872),
            MakeUser("mock_spotify_006", "James Okafor",   "james.okafor@soundspace.dev",   "RO", 1502, null, 47.17474360453262, 27.549144968755872),
            MakeUser("mock_spotify_007", "Elena Vasquez",  "elena.vasquez@soundspace.dev",  "RO", 921,  null, 47.17474360453262, 27.549144968755872),
            MakeUser("mock_spotify_008", "Noah Schmidt",   "noah.schmidt@soundspace.dev",   "RO", 455,  null, 47.17474360453262, 27.549144968755872),
            MakeUser("mock_spotify_009", "Priya Sharma",   "priya.sharma@soundspace.dev",   "RO", 317,  null, 47.17474360453262, 27.549144968755872),
            MakeUser("mock_spotify_010", "Finn Larsen",    "finn.larsen@soundspace.dev",    "RO", 789,  null, 47.17474360453262, 27.549144968755872),
        };

        foreach (var u in users)
            u.PasswordHash = Hasher.HashPassword(u, "MockPassword123!");

        db.Users.AddRange(users);
        await db.SaveChangesAsync();

        var alex  = users[0];
        var maya  = users[1];
        var luca  = users[2];
        var yuki  = users[3];
        var sofia = users[4];
        var james = users[5];
        var elena = users[6];
        var noah  = users[7];

        var conv1 = new Conversation { CreatedAt = now.AddDays(-3) };
        db.Conversations.Add(conv1);

        db.ConversationParticipants.AddRange(
            new ConversationParticipant { ConversationId = conv1.Id, UserId = alex.Id, JoinedAt = conv1.CreatedAt },
            new ConversationParticipant { ConversationId = conv1.Id, UserId = maya.Id, JoinedAt = conv1.CreatedAt }
        );

        db.Messages.AddRange(
            Msg(conv1.Id, maya.Id,  "Hey! Did you catch Arctic Monkeys' new track?",               now.AddDays(-3).AddHours(1)),
            Msg(conv1.Id, alex.Id,  "Yes!! The riff at 1:20 is insane. Classic AM energy.",        now.AddDays(-3).AddHours(1).AddMinutes(3)),
            Msg(conv1.Id, maya.Id,  "Right?! I've had it on repeat all morning. Peak indie rock.", now.AddDays(-3).AddHours(1).AddMinutes(7)),
            Msg(conv1.Id, alex.Id,  "Also found this sick lo-fi playlist for late nights.",        now.AddDays(-3).AddHours(1).AddMinutes(15)),
            Msg(conv1.Id, maya.Id,  "Send it!! I need new study music desperately.",               now.AddDays(-3).AddHours(1).AddMinutes(17)),
            Msg(conv1.Id, alex.Id,  "Done. It has like 80 tracks, all gold.",                      now.AddDays(-3).AddHours(1).AddMinutes(20)),
            Msg(conv1.Id, maya.Id,  "You're a legend. See you at the venue Friday?",               now.AddDays(-2).AddHours(9)),
            Msg(conv1.Id, alex.Id,  "Absolutely. Doors open at 8, I'll grab the tickets.",        now.AddDays(-2).AddHours(9).AddMinutes(5))
        );

        var conv2 = new Conversation { CreatedAt = now.AddDays(-7) };
        db.Conversations.Add(conv2);

        db.ConversationParticipants.AddRange(
            new ConversationParticipant { ConversationId = conv2.Id, UserId = luca.Id, JoinedAt = conv2.CreatedAt },
            new ConversationParticipant { ConversationId = conv2.Id, UserId = yuki.Id, JoinedAt = conv2.CreatedAt }
        );

        db.Messages.AddRange(
            Msg(conv2.Id, luca.Id, "Yuki, ciao! Sai che ho trovato un vinile di Nujabes?",         now.AddDays(-7).AddHours(14)),
            Msg(conv2.Id, yuki.Id, "No way! Metaphorical Music? That's almost impossible to find.", now.AddDays(-7).AddHours(14).AddMinutes(4)),
            Msg(conv2.Id, luca.Id, "Exactly that one. Found it in a tiny shop in Bologna.",         now.AddDays(-7).AddHours(14).AddMinutes(8)),
            Msg(conv2.Id, yuki.Id, "I'm so jealous. His production is on another level.",           now.AddDays(-7).AddHours(14).AddMinutes(12)),
            Msg(conv2.Id, luca.Id, "Agreed. Listening while making pasta is peak life experience.", now.AddDays(-7).AddHours(14).AddMinutes(16)),
            Msg(conv2.Id, yuki.Id, "Ha! Perfect pairing. Are you going to the Jazz festival?",      now.AddDays(-6).AddHours(10)),
            Msg(conv2.Id, luca.Id, "I was thinking about it. Who's playing?",                       now.AddDays(-6).AddHours(10).AddMinutes(6)),
            Msg(conv2.Id, yuki.Id, "Kamasi Washington is headlining. Don't miss it.",               now.AddDays(-6).AddHours(10).AddMinutes(10)),
            Msg(conv2.Id, luca.Id, "Sold. Let's meet there. I'll bring the Nujabes vinyl.",        now.AddDays(-6).AddHours(10).AddMinutes(14))
        );

        var conv3 = new Conversation { IsGroup = true, CreatedAt = now.AddDays(-1) };
        db.Conversations.Add(conv3);

        db.ConversationParticipants.AddRange(
            new ConversationParticipant { ConversationId = conv3.Id, UserId = sofia.Id, JoinedAt = conv3.CreatedAt },
            new ConversationParticipant { ConversationId = conv3.Id, UserId = james.Id, JoinedAt = conv3.CreatedAt },
            new ConversationParticipant { ConversationId = conv3.Id, UserId = elena.Id, JoinedAt = conv3.CreatedAt },
            new ConversationParticipant { ConversationId = conv3.Id, UserId = noah.Id,  JoinedAt = conv3.CreatedAt }
        );

        db.Messages.AddRange(
            Msg(conv3.Id, sofia.Id, "Ok gang, collab playlist for the road trip. Drop your picks!", now.AddDays(-1).AddHours(8)),
            Msg(conv3.Id, james.Id, "Burna Boy - Last Last is non-negotiable. Top of the list.",    now.AddDays(-1).AddHours(8).AddMinutes(2)),
            Msg(conv3.Id, elena.Id, "Natalia Lafourcade - Hasta la Raíz. Vibes for the mountains.", now.AddDays(-1).AddHours(8).AddMinutes(5)),
            Msg(conv3.Id, noah.Id,  "Rammstein for when we need to wake up at 4am. You're welcome.", now.AddDays(-1).AddHours(8).AddMinutes(8)),
            Msg(conv3.Id, sofia.Id, "Noah… we are NOT starting the trip with Rammstein.",           now.AddDays(-1).AddHours(8).AddMinutes(10)),
            Msg(conv3.Id, james.Id, "Lmao. Ok fine, maybe track 5 as a surprise.",                  now.AddDays(-1).AddHours(8).AddMinutes(12)),
            Msg(conv3.Id, elena.Id, "I'm adding some Khruangbin for the open highway stretches.",   now.AddDays(-1).AddHours(8).AddMinutes(16)),
            Msg(conv3.Id, noah.Id,  "Khruangbin I can agree on. Smooth choice.",                    now.AddDays(-1).AddHours(8).AddMinutes(19)),
            Msg(conv3.Id, sofia.Id, "This playlist is going to be perfect. See you all Saturday!",  now.AddDays(-1).AddHours(8).AddMinutes(25)),
            Msg(conv3.Id, james.Id, "Road trip!!",                                                   now.AddDays(-1).AddHours(8).AddMinutes(26))
        );

        await db.SaveChangesAsync();

        await EnsureMockArtistsAsync(db);
    }

    private static async Task EnsureMockArtistsAsync(ApplicationContext db)
    {
        var now = DateTime.UtcNow;
        bool changed = false;

        foreach (var (spotifyId, artists) in MockArtists)
        {
            var user = db.Users.FirstOrDefault(u => u.SpotifyId == spotifyId);
            if (user == null) continue;

            if (db.TopArtists.Any(a => a.UserId == user.Id)) continue;

            for (int i = 0; i < artists.Length; i++)
            {
                db.TopArtists.Add(new TopArtistEntry
                {
                    UserId          = user.Id,
                    SpotifyArtistId = artists[i].Id,
                    Name            = artists[i].Name,
                    Rank            = i + 1,
                    UpdatedAt       = now,
                });
            }
            changed = true;
        }

        if (changed)
            await db.SaveChangesAsync();
    }

    private static async Task EnsureLocationsAsync(ApplicationContext db)
    {
        var mockUsers = db.Users.Where(u => u.SpotifyId.StartsWith("mock_")).ToList();
        bool changed = false;

        foreach (var user in mockUsers)
        {
            if (user.Latitude is null && MockLocations.TryGetValue(user.SpotifyId, out var loc))
            {
                user.Latitude  = loc.Lat;
                user.Longitude = loc.Lon;
                changed = true;
            }
        }

        if (changed)
            await db.SaveChangesAsync();
    }

    private static Message Msg(Guid conversationId, Guid senderId, string plaintext, DateTime createdAt) =>
        new()
        {
            ConversationId = conversationId,
            SenderId = senderId,
            Text = plaintext,
            CreatedAt = createdAt,
        };

    private static User MakeUser(
        string spotifyId, string displayName, string email,
        string country, int followers, string? profileImageUrl,
        double? latitude = null, double? longitude = null)
    {
        var id = Guid.NewGuid();
        return new User
        {
            Id = id,
            SpotifyId = spotifyId,
            DisplayName = displayName,
            Email = email,
            NormalizedEmail = email.ToUpperInvariant(),
            UserName = email,
            NormalizedUserName = email.ToUpperInvariant(),
            Country = country,
            Followers = followers,
            ProfileImageUrl = profileImageUrl,
            Latitude = latitude,
            Longitude = longitude,
            SpotifyAccessToken = "mock_access_token",
            SpotifyRefreshToken = "mock_refresh_token",
            SpotifyTokenExpiresIn = "3600",
            SpotifyTokenExpiresAt = DateTime.UtcNow.AddYears(1),
            CreatedAt = DateTime.UtcNow.AddMonths(-Random.Shared.Next(1, 12)),
            SecurityStamp = Guid.NewGuid().ToString(),
            ConcurrencyStamp = Guid.NewGuid().ToString(),
        };
    }
}
