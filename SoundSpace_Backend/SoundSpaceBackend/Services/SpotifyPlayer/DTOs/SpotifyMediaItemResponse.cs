namespace SoundSpaceBackend.Services.SpotifyPlayer.DTOs;

public record SpotifyMediaItemResponse(
    string Uri,
    string Name,
    string Type,
    string CoverUrl,
    string Subtitle,
    string ExternalUrl,
    string SubtitleUrl,
    string? PreviewUrl = null
);
