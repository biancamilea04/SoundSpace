namespace SoundSpaceBackend.Configuration;

public class SpotifyApiConfiguration
{
    public string CurrentlyPlayingUrl { get; set; } = string.Empty;
    public string RecentlyPlayedUrl { get; set; } = string.Empty;
    public string TopArtistsUrl { get; set; } = string.Empty;
    public string TopTracksUrl { get; set; } = string.Empty;
    public string RecentStreamsUrl { get; set; } = string.Empty;
}