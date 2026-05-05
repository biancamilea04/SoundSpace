using Microsoft.AspNetCore.Identity;
using SoundSpaceBackend.Models.Entities;
using SoundSpaceBackend.Persistence;

namespace SoundSpaceBackend.Seed;

public static class DataSeeder
{
    private static readonly IPasswordHasher<User> Hasher = new PasswordHasher<User>();

    public static async Task SeedAsync(ApplicationContext db)
    {
        if (db.Users.Any(u => u.SpotifyId.StartsWith("mock_")))
            return;

        var now = DateTime.UtcNow;

        var users = new[]
        {
            MakeUser("mock_spotify_001", "Alex Turner",    "alex.turner@soundspace.dev",    "GB", 1240, null),
            MakeUser("mock_spotify_002", "Maya Chen",      "maya.chen@soundspace.dev",      "US", 843,  null),
            MakeUser("mock_spotify_003", "Luca Rossi",     "luca.rossi@soundspace.dev",     "IT", 2105, null),
            MakeUser("mock_spotify_004", "Yuki Tanaka",    "yuki.tanaka@soundspace.dev",    "JP", 390,  null),
            MakeUser("mock_spotify_005", "Sofia Andrade",  "sofia.andrade@soundspace.dev",  "BR", 678,  null),
            MakeUser("mock_spotify_006", "James Okafor",   "james.okafor@soundspace.dev",   "NG", 1502, null),
            MakeUser("mock_spotify_007", "Elena Vasquez",  "elena.vasquez@soundspace.dev",  "MX", 921,  null),
            MakeUser("mock_spotify_008", "Noah Schmidt",   "noah.schmidt@soundspace.dev",   "DE", 455,  null),
            MakeUser("mock_spotify_009", "Priya Sharma",   "priya.sharma@soundspace.dev",   "IN", 317,  null),
            MakeUser("mock_spotify_010", "Finn Larsen",    "finn.larsen@soundspace.dev",    "DK", 789,  null),
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

        // --- Conversation 1: Alex ↔ Maya (DM) ---
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

        // --- Conversation 2: Luca ↔ Yuki (DM) ---
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

        // --- Conversation 3: Sofia, James, Elena, Noah (Group) ---
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
        string country, int followers, string? profileImageUrl)
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
