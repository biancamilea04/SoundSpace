using SoundSpaceBackend.Models.Entities;
using SoundSpaceBackend.Persistence;

namespace SoundSpace_SpotifyWorker.Seed;

public static class SpotifyDataSeeder
{
    private const string ArcticMonkeys  = "7Ln80lUS6He07XvHI8qqHH";
    private const string Radiohead      = "4Z8W4fKeB5YxbusRsdQVPb";
    private const string TheWeeknd      = "1Xyo4u8uXC1ZmMpatF05PJ";
    private const string TameImpala     = "5INjqkS1o8h1imAzPqGZBb";
    private const string KendrickLamar  = "2YZyLoL8N0Wb9xBt1NhZWg";
    private const string Coldplay       = "4gzpq5DPGxSnKTe4SA8HAU";
    private const string BillieEilish   = "6qqNVTkY8uBg9cP3Jd7DAH";
    private const string Drake          = "3TVXtAsR1Inumwj472S9r4";
    private const string TaylorSwift    = "06HL4z0CvFAxyc27GXpf02";
    private const string DuaLipa        = "6M2wZ9GZgrQXHCFfjv46we";
    private const string ImagineDragons = "53XhwfbYqKCa1cC15pYq2q";
    private const string EdSheeran      = "6eUKZXaKkcviH0Ku9w2n3V";
    private const string ArianaGrande   = "66CXWjxzNUsdJxJ2JdwvnR";
    private const string TravisScott    = "0Y5tJX1MQlPlqiwlOH1tJY";
    private const string PostMalone     = "246dkjvS1zLTtiykXe5h60";
    private const string JuiceWRLD      = "4MCBfE4596Uoi2O4DtmEMz";
    private const string SZA            = "7tYKF4w9nC0nq9CsPZTHyP";
    private const string Beyonce        = "6vWDO969PvNqNYHIOW5v0m";
    private const string Rihanna        = "5pKCCKE2ajJHZ9KAiaK11H";
    private const string HarryStyles    = "6KImCVD70vtIoJWnq6nGn3";
    private const string Adele          = "4dpARuHxo51G3z768sgnrY";
    private const string LanaDelRey     = "00FQb4jTyendYWaN8pK0wa";
    private const string BrunoMars      = "0du5cEVh5yTK9QJze8zA0C";
    private const string Queen          = "1dfeR4HaWDbWqFHLkxsg1d";
    private const string LinkinPark     = "6XyY86QOPPrYVGvF9ch6wz";
    private const string ACDC           = "711MCceyCBcFnzjGY4Q7Un";
    private const string OliviaRodrigo     = "1McMsnEElThX1knmY4oliG";
    private const string LadyGaga          = "1HY2Jd0NmPuamShAr6KMms";
    private const string SleepToken        = "2n2RSaZqBuUUukhbLlpnE6";
    private const string TheMotans         = "05qpk4JDcLSFNJSsPIZ8Ye";
    private const string CarlasDreams      = "1n5LD9Ar3D6RK2X2ewGvXb";
    private const string Alternosfera      = "2Bfpg6VC7SNEQKez2uXyuP";
    private const string IrinaRimes        = "1OQa8VMULlbmbFmDcdfBZj";
    private const string MotionlessInWhite = "6MwPCCR936cYfM1dLsGVnl";

    private static readonly Dictionary<string, string[]> ArtistsByUser = new()
    {
        ["mock_spotify_001"] = [ArcticMonkeys, SleepToken, TheWeeknd, TameImpala, MotionlessInWhite],
        ["mock_spotify_002"] = [TheWeeknd, TheMotans, CarlasDreams, BillieEilish, TaylorSwift],
        ["mock_spotify_003"] = [ArcticMonkeys, SleepToken, Radiohead, Coldplay, TheMotans],
        ["mock_spotify_004"] = [SleepToken, MotionlessInWhite, KendrickLamar, Drake, TravisScott],
        ["mock_spotify_005"] = [TheMotans, CarlasDreams, Alternosfera, IrinaRimes, TameImpala],
        ["mock_spotify_006"] = [TheWeeknd, CarlasDreams, Alternosfera, IrinaRimes, Drake],
        ["mock_spotify_007"] = [TaylorSwift, TheMotans, CarlasDreams, OliviaRodrigo, BillieEilish],
        ["mock_spotify_008"] = [SleepToken, ArcticMonkeys, TheWeeknd, TameImpala, Coldplay],
        ["mock_spotify_009"] = [IrinaRimes, Adele, LanaDelRey, BrunoMars, Beyonce],
        ["mock_spotify_010"] = [MotionlessInWhite, Coldplay, ImagineDragons, ACDC, Queen],
    };

    private static readonly Dictionary<string, string> ArtistNames = new()
    {
        [ArcticMonkeys]  = "Arctic Monkeys",
        [Radiohead]      = "Radiohead",
        [TheWeeknd]      = "The Weeknd",
        [TameImpala]     = "Tame Impala",
        [KendrickLamar]  = "Kendrick Lamar",
        [Coldplay]       = "Coldplay",
        [BillieEilish]   = "Billie Eilish",
        [Drake]          = "Drake",
        [TaylorSwift]    = "Taylor Swift",
        [DuaLipa]        = "Dua Lipa",
        [ImagineDragons] = "Imagine Dragons",
        [EdSheeran]      = "Ed Sheeran",
        [ArianaGrande]   = "Ariana Grande",
        [TravisScott]    = "Travis Scott",
        [PostMalone]     = "Post Malone",
        [JuiceWRLD]      = "Juice WRLD",
        [SZA]            = "SZA",
        [Beyonce]        = "Beyoncé",
        [Rihanna]        = "Rihanna",
        [HarryStyles]    = "Harry Styles",
        [Adele]          = "Adele",
        [LanaDelRey]     = "Lana Del Rey",
        [BrunoMars]      = "Bruno Mars",
        [Queen]          = "Queen",
        [LinkinPark]     = "Linkin Park",
        [ACDC]           = "AC/DC",
        [OliviaRodrigo]      = "Olivia Rodrigo",
        [LadyGaga]           = "Lady Gaga",
        [SleepToken]         = "Sleep Token",
        [TheMotans]          = "The Motans",
        [CarlasDreams]       = "Carla's Dreams",
        [Alternosfera]       = "Alternosfera",
        [IrinaRimes]         = "Irina Rimes",
        [MotionlessInWhite]  = "Motionless In White",
    };

    public static async Task SeedAsync(ApplicationContext db)
    {
        if (db.TopArtists.Any(a => a.SpotifyArtistId.StartsWith("seed_artist_")))
        {
            db.TopArtists.RemoveRange(
                db.TopArtists.Where(a => a.SpotifyArtistId.StartsWith("seed_artist_")));
            db.TopTracks.RemoveRange(
                db.TopTracks.Where(t => t.SpotifyTrackId.StartsWith("seed_track_")));
            db.RecentStreams.RemoveRange(
                db.RecentStreams.Where(r => r.SpotifyTrackId.StartsWith("seed_track_")));
            await db.SaveChangesAsync();
        }

        if (db.TopArtists.Any(a => a.SpotifyArtistId == ArcticMonkeys))
            return;

        var now = DateTime.UtcNow;

        foreach (var (spotifyId, artistIds) in ArtistsByUser)
        {
            var user = db.Users.FirstOrDefault(u => u.SpotifyId == spotifyId);
            if (user == null) continue;

            for (int i = 0; i < artistIds.Length; i++)
            {
                db.TopArtists.Add(new TopArtistEntry
                {
                    UserId          = user.Id,
                    SpotifyArtistId = artistIds[i],
                    Name            = ArtistNames[artistIds[i]],
                    Rank            = i + 1,
                    UpdatedAt       = now,
                });
            }
        }

        await db.SaveChangesAsync();
    }
}
