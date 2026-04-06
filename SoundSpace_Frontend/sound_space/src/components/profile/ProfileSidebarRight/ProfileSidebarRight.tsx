"use client";

import { CurrentlyListening } from "@/components/profile/CurrentlyListening/CurrentlyListening";
import { TopArtists } from "@/components/profile/TopArtists/TopArtists";
import { TopTracks } from "@/components/profile/TopTracks/TopTracks";
import { RecentStreams } from "@/components/profile/RecentStreams/RecentStreams";
import "./ProfileSidebarRight.css";

const MOCK_ARTISTS = [
    { name: "The Weeknd", imageUrl: "https://eu.ui-avatars.com/api/?name=The+Weeknd&size=80&background=e74c3c&color=fff" },
    { name: "Dua Lipa", imageUrl: "https://eu.ui-avatars.com/api/?name=Dua+Lipa&size=80&background=9b59b6&color=fff" },
    { name: "Drake", imageUrl: "https://eu.ui-avatars.com/api/?name=Drake&size=80&background=3498db&color=fff" },
    { name: "Billie Eilish", imageUrl: "https://eu.ui-avatars.com/api/?name=Billie+Eilish&size=80&background=2ecc71&color=fff" },
    { name: "Bad Bunny", imageUrl: "https://eu.ui-avatars.com/api/?name=Bad+Bunny&size=80&background=f39c12&color=fff" },
];

const MOCK_TRACKS = [
    { rank: 1, title: "Blinding Lights", artist: "The Weeknd", albumArtUrl: "https://eu.ui-avatars.com/api/?name=BL&size=80&background=e74c3c&color=fff" },
    { rank: 2, title: "As It Was", artist: "Harry Styles", albumArtUrl: "https://eu.ui-avatars.com/api/?name=AW&size=80&background=3498db&color=fff" },
    { rank: 3, title: "Anti-Hero", artist: "Taylor Swift", albumArtUrl: "https://eu.ui-avatars.com/api/?name=AH&size=80&background=e74c3c&color=fff" },
    { rank: 4, title: "Flowers", artist: "Miley Cyrus", albumArtUrl: "https://eu.ui-avatars.com/api/?name=FL&size=80&background=e91e63&color=fff" },
    { rank: 5, title: "Calm Down", artist: "Rema", albumArtUrl: "https://eu.ui-avatars.com/api/?name=CD&size=80&background=2ecc71&color=fff" },
];

const MOCK_STREAMS = [
    { title: "Levitating", artist: "The Weeknd", timeAgo: "2 mins ago", albumArtUrl: "https://eu.ui-avatars.com/api/?name=BL&size=80&background=e74c3c&color=fff" },
    { title: "Starboy", artist: "The Weeknd", timeAgo: "8 mins ago", albumArtUrl: "https://eu.ui-avatars.com/api/?name=BL&size=80&background=e74c3c&color=fff" },
    { title: "Bad Guy", artist: "The Weeknd", timeAgo: "15 mins ago", albumArtUrl: "https://eu.ui-avatars.com/api/?name=BL&size=80&background=e74c3c&color=fff" },
    { title: "Watermelon Sugar", artist: "The Weeknd", timeAgo: "22 mins ago", albumArtUrl: "https://eu.ui-avatars.com/api/?name=BL&size=80&background=e74c3c&color=fff" },
    { title: "Peaches", artist: "The Weeknd", timeAgo: "30 mins ago", albumArtUrl: "https://eu.ui-avatars.com/api/?name=BL&size=80&background=e74c3c&color=fff" },
    { title: "Save Your Tears", artist: "The Weeknd", timeAgo: "45 mins ago", albumArtUrl: "https://eu.ui-avatars.com/api/?name=BL&size=80&background=e74c3c&color=fff" },
    { title: "Montero", artist: "The Weeknd", timeAgo: "1 hour ago", albumArtUrl: "https://eu.ui-avatars.com/api/?name=BL&size=80&background=e74c3c&color=fff" },
];

export const ProfileSidebarRight = () => {
    return (
        <aside className="profile-sidebar-right">
            <CurrentlyListening
                trackName="Blinding Lights"
                artistName="The Weeknd"
            />
            <TopArtists artists={MOCK_ARTISTS} />
            <TopTracks tracks={MOCK_TRACKS} />
            <RecentStreams streams={MOCK_STREAMS} />
        </aside>
    );
};

export default ProfileSidebarRight;
