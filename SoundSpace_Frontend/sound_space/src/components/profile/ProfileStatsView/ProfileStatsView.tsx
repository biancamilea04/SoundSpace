"use client";

import { CurrentlyListening } from "@/components/profile/CurrentlyListening/CurrentlyListening";
import { TopArtists } from "@/components/profile/TopArtists/TopArtists";
import { TopTracks } from "@/components/profile/TopTracks/TopTracks";
import { RecentStreams } from "@/components/profile/RecentStreams/RecentStreams";
import { useTopArtists } from "@/hooks/TopArtists/useTopArtists";
import { useTopTracks } from "@/hooks/TopTracks/useTopTracks";
import { useRecentStreams } from "@/hooks/RecentStreams/useRecentStreams";
import { useUserMusicStatus } from "@/hooks/UserProfile/useUserMusicStatus";
import "./ProfileStatsView.css";

interface ProfileStatsViewProps {
    username?: string;
}

export const ProfileStatsView = ({ username }: ProfileStatsViewProps) => {
    const { artists, isLoading: isLoadingArtists } = useTopArtists(username);
    const { tracks, isLoading: isLoadingTracks } = useTopTracks(username);
    const { streams, isLoading: isLoadingStreams } = useRecentStreams(username);
    const musicStatus = useUserMusicStatus(username);

    const isListening = musicStatus?.isListening ?? false;
    const trackName   = isListening ? musicStatus?.currentlyPlayingTitle  : musicStatus?.lastPlayedTitle;
    const artistName  = isListening ? musicStatus?.currentlyPlayingArtist : musicStatus?.lastPlayedArtist;
    const coverUrl    = isListening ? musicStatus?.currentlyPlayingCoverUrl : musicStatus?.lastPlayedCoverUrl;
    const trackUri    = isListening ? musicStatus?.currentlyPlayingUri    : musicStatus?.lastPlayedUri;
    const artistUrl   = isListening ? musicStatus?.currentlyPlayingArtistUrl : musicStatus?.lastPlayedArtistUrl;

    return (
        <div className="stats-view">
            <div className="stats-view__currently-listening">
                <CurrentlyListening
                    trackName={trackName ?? null}
                    artistName={artistName ?? null}
                    coverUrl={coverUrl ?? null}
                    trackUri={trackUri ?? null}
                    artistUrl={artistUrl ?? null}
                    label={isListening ? 'Currently Listening' : 'Last Listened'}
                    isListening={isListening}
                />
            </div>

            <div className="stats-view__section">
                <div className="stats-view__artists-wrap">
                    <TopArtists artists={artists} isLoading={isLoadingArtists} />
                </div>
            </div>

            <div className="stats-view__section">
                <div className="stats-view__tracks-wrap">
                    <TopTracks tracks={tracks} isLoading={isLoadingTracks} showSlider />
                </div>
            </div>

            <div className="stats-view__recent-wrap">
                <RecentStreams streams={streams} isLoading={isLoadingStreams} showTimestamp />
            </div>
        </div>
    );
};

export default ProfileStatsView;
