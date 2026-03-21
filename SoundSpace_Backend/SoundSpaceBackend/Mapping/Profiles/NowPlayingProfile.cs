using AutoMapper;
using SoundSpaceBackend.Services.SpotifyPlayer.DTOs;

namespace SoundSpaceBackend.Mapping.Profiles;

public class NowPlayingProfile : Profile
{
    public NowPlayingProfile()
    {
        CreateMap<SpotifyArtistDto, NowPlayingArtist>()
            .ConstructUsing(src => new NowPlayingArtist(
                src.Name,
                src.Uri,
                src.ExternalUrls != null ? src.ExternalUrls.Spotify : null));

        CreateMap<SpotifyCurrentlyPlayingDto, NowPlayingResponse>()
            .ConstructUsing((src, ctx) =>
            {
                var track = src.Item!;
                var album = track.Album;

                var artists = ctx.Mapper.Map<List<NowPlayingArtist>>(track.Artists);
                var artistNames = string.Join(", ", artists.Select(a => a.Name));
                var albumImageUrl = album?.Images.FirstOrDefault()?.Url;

                return new NowPlayingResponse(
                    IsPlaying: src.IsPlaying,
                    ProgressMs: src.ProgressMs,
                    DurationMs: track.DurationMs,
                    RepeatState: src.RepeatState ?? "off",
                    ShuffleState: src.ShuffleState,

                    SongTitle: track.Name,
                    SongUri: track.Uri ?? string.Empty,
                    IsExplicit: track.Explicit,

                    ArtistNames: artistNames,
                    Artists: artists,

                    AlbumName: album?.Name ?? string.Empty,
                    AlbumUri: album?.Uri ?? string.Empty,
                    AlbumImageUrl: albumImageUrl,
                    ReleaseDate: album?.ReleaseDate,

                    DeviceName: src.Device?.Name,
                    DeviceType: src.Device?.Type,
                    VolumePercent: src.Device?.VolumePercent ?? 0);
            });

        CreateMap<SpotifyPlayHistoryDto, NowPlayingResponse>()
            .ConstructUsing((src, ctx) =>
            {
                var track = src.Track!;
                var album = track.Album;

                var artists = ctx.Mapper.Map<List<NowPlayingArtist>>(track.Artists);
                var artistNames = string.Join(", ", artists.Select(a => a.Name));
                var albumImageUrl = album?.Images.FirstOrDefault()?.Url;

                return new NowPlayingResponse(
                    IsPlaying: false, 
                    ProgressMs: 0,
                    DurationMs: track.DurationMs,
                    RepeatState: "off",
                    ShuffleState: false,

                    SongTitle: track.Name,
                    SongUri: track.Uri ?? string.Empty,
                    IsExplicit: track.Explicit,

                    ArtistNames: artistNames,
                    Artists: artists,

                    AlbumName: album?.Name ?? string.Empty,
                    AlbumUri: album?.Uri ?? string.Empty,
                    AlbumImageUrl: albumImageUrl,
                    ReleaseDate: album?.ReleaseDate,

                    DeviceName: null,
                    DeviceType: null,
                    VolumePercent: 0
                );
            });
    }
}
