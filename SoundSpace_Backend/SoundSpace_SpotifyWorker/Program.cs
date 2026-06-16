using DotNetEnv;
using Microsoft.EntityFrameworkCore;
using SoundSpaceBackend.Mapping.Profiles;
using SoundSpaceBackend.Persistence;
using SoundSpaceBackend.Seed;
using SoundSpaceBackend.Services.SpotifyPlayer;
using SoundSpaceBackend.Services.SpotifyPlayer.Abstractions;
using SoundSpaceBackend.Services.SpotifyToken;
using SoundSpaceBackend.Services.SpotifyToken.Abstractions;
using SoundSpace_SpotifyWorker.Seed;
using SoundSpace_SpotifyWorker.Worker;

Env.Load();

var host = Host.CreateDefaultBuilder(args)
    .ConfigureServices((_, services) =>
    {
        var connectionString = Environment.GetEnvironmentVariable("SOUNDSPACE_DB")
            ?? throw new InvalidOperationException("SOUNDSPACE_DB environment variable is not set.");

        services.AddDbContext<ApplicationContext>(options =>
            options.UseNpgsql(connectionString));

        services.AddHttpClient();

        services.AddAutoMapper(
            cfg => { },
            typeof(NowPlayingProfile),
            typeof(UserProfile));

        services.AddScoped<ISpotifyTokenService, SpotifyTokenService>();
        services.AddScoped<ISpotifyPlayerService, SpotifyPlayerService>();

        services.AddHostedService<PollingWorker>();
        services.AddHostedService<CurrentlyPlayingWorker>();
        services.AddHostedService<LikedSongsSyncWorker>();
    })
    .Build();

using (var scope = host.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationContext>();
    if (host.Services.GetRequiredService<IHostEnvironment>().IsDevelopment())
    {
        await DataSeeder.SeedAsync(db);
        await SpotifyDataSeeder.SeedAsync(db);
    }
}

await host.RunAsync();
