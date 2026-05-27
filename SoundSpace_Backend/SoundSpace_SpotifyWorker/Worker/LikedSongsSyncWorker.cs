namespace SoundSpace_SpotifyWorker.Worker;

public class LikedSongsSyncWorker(ILogger<LikedSongsSyncWorker> logger) : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromHours(1);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("[LikedSongsSyncWorker] Started. Interval: {Interval}h", Interval.TotalHours);

        while (!stoppingToken.IsCancellationRequested)
        {
            await Task.Delay(Interval, stoppingToken);
        }
    }
}
