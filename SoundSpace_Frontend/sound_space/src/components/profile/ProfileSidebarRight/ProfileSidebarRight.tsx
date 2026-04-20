"use client";

import { CurrentlyListening } from "@/components/profile/CurrentlyListening/CurrentlyListening";
import { TopArtists } from "@/components/profile/TopArtists/TopArtists";
import { TopTracks } from "@/components/profile/TopTracks/TopTracks";
import { RecentStreams } from "@/components/profile/RecentStreams/RecentStreams";
import { useTopArtists } from "@/hooks/TopArtists/useTopArtists";
import { useTopTracks } from "@/hooks/TopTracks/useTopTracks";
import { useRecentStreams } from "@/hooks/RecentStreams/useRecentStreams";
import "./ProfileSidebarRight.css";

export const ProfileSidebarRight = () => {
    const { artists, isLoading: isLoadingArtists } = useTopArtists();
    const { tracks, isLoading: isLoadingTracks } = useTopTracks();
    const { streams, isLoading: isLoadingStreams } = useRecentStreams();

    return (
        <aside className="profile-sidebar-right">
            <CurrentlyListening
                trackName="Blinding Lights"
                artistName="The Weeknd"
            />
            <TopArtists artists={artists} isLoading={isLoadingArtists} />
            <TopTracks tracks={tracks} isLoading={isLoadingTracks} />
            <RecentStreams streams={streams} isLoading={isLoadingStreams} />
        </aside>
    );
};

export default ProfileSidebarRight;
