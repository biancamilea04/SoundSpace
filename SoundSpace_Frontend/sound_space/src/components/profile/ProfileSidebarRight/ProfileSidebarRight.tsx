"use client";

import { CurrentlyListening } from "@/components/profile/CurrentlyListening/CurrentlyListening";
import { TopArtists } from "@/components/profile/TopArtists/TopArtists";
import { TopTracks } from "@/components/profile/TopTracks/TopTracks";
import { TopGenres } from "@/components/profile/TopGenres/TopGenres";
import { RecentStreams } from "@/components/profile/RecentStreams/RecentStreams";
import { useTopArtists } from "@/hooks/TopArtists/useTopArtists";
import { useTopTracks } from "@/hooks/TopTracks/useTopTracks";
import { useTopGenres } from "@/hooks/TopGenres/useTopGenres";
import { useRecentStreams } from "@/hooks/RecentStreams/useRecentStreams";
import { useUserMusicStatus } from "@/hooks/UserProfile/useUserMusicStatus";
import "./ProfileSidebarRight.css";

interface ProfileSidebarRightProps {
    username?: string;
}

export const ProfileSidebarRight = ({ username }: ProfileSidebarRightProps) => {
    const { artists, isLoading: isLoadingArtists } = useTopArtists(username);
    const { tracks, isLoading: isLoadingTracks } = useTopTracks(username);
    const { genres, isLoading: isLoadingGenres } = useTopGenres(username);
    const { streams, isLoading: isLoadingStreams } = useRecentStreams(username);
    const musicStatus = useUserMusicStatus(username);

    return (
        <aside className="profile-sidebar-right">
            {musicStatus?.isListening && (
                <CurrentlyListening
                    trackName={musicStatus.currentlyPlayingTitle}
                    artistName={musicStatus.currentlyPlayingArtist}
                    coverUrl={musicStatus.currentlyPlayingCoverUrl}
                    trackUri={musicStatus.currentlyPlayingUri}
                    artistUrl={musicStatus.currentlyPlayingArtistUrl}
                />
            )}
            <TopArtists artists={artists} isLoading={isLoadingArtists} />
            <TopTracks tracks={tracks} isLoading={isLoadingTracks} />
            <TopGenres genres={genres} isLoading={isLoadingGenres} />
            <RecentStreams streams={streams} isLoading={isLoadingStreams} />
        </aside>
    );
};

export default ProfileSidebarRight;
