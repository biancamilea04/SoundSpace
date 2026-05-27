namespace SoundSpaceBackend.Services.PreviewUrl.Abstractions;

public interface IPreviewUrlService
{
    Task<string?> ResolveAsync(string spotifyId, string spotifyUri, string? artistName, string? trackName);
}
