"use client";

import Post from "@/components/global/Post/Post";
import "./ProfileFeed.css";

const MOCK_POSTS = [
    {
        user: {
            name: "Alex Rivera",
            avatarUrl: "https://eu.ui-avatars.com/api/?name=Alex+Rivera&size=250&background=1ed760&color=000",
            isOnline: true,
        },
        timeAgo: "2h ago",
        content: "Just discovered this amazing album by The Weeknd. Dawn FM is a masterpiece! 🎧",
        stats: { likes: 24, comments: 5 },
        song: {
            title: "Blinding Lights",
            artist: "The Weeknd",
            albumImageUrl: "https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36",
            durationFormatted: "3:20",
        },
    },
    {
        user: {
            name: "Alex Rivera",
            avatarUrl: "https://eu.ui-avatars.com/api/?name=Alex+Rivera&size=250&background=1ed760&color=000",
            isOnline: true,
        },
        timeAgo: "5h ago",
        content: "Anyone else going to the Dua Lipa concert next month? 🎤",
        stats: { likes: 42, comments: 12 },
    },
    {
        user: {
            name: "Alex Rivera",
            avatarUrl: "https://eu.ui-avatars.com/api/?name=Alex+Rivera&size=250&background=1ed760&color=000",
            isOnline: true,
        },
        timeAgo: "1d ago",
        content: "My top genre this month: Alternative. Didn't see that coming 😄",
        stats: { likes: 18, comments: 3 },
    },
];

export const ProfileFeed = () => {
    return (
        <div className="profile-feed">
            {MOCK_POSTS.map((post, index) => (
                <Post
                    key={index}
                    user={post.user}
                    timeAgo={post.timeAgo}
                    content={post.content}
                    stats={post.stats}
                    song={post.song}
                />
            ))}
        </div>
    );
};

export default ProfileFeed;
