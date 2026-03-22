"use client";

import { Suspense } from "react";

import MenuSidebar from "@/components/global/MenuSidebar/MenuSidebar";
import SharePost from "@/components/global/SharePost/SharePost";
import Post from "@/components/global/Post/Post";
import './page.css';
import FriendSidebar from "@/components/global/FriendSidebar/FriendSidebar";
import Header from "@/components/global/Header/Header";

function FeedContent() {
	return (
		<div className="page-wrapper">
			<Header title="Home" />
			<div className="feed-container">
				<MenuSidebar />
				<div className="feed-main">
					<SharePost />

					{/* Mock Data Posts */}
					<Post
						user={{
							name: "Alex R.",
							avatarUrl: "https://i.pravatar.cc/150?img=11",
							isOnline: true
						}}
						timeAgo="2 hours ago"
						content="Vibing to this new single! The production on this is absolutely insane. 🔥 🎧"
						stats={{ likes: 245, comments: 42 }}
						song={{
							title: "Midnight Echoes",
							artist: "The Synthwave Collective",
							albumImageUrl: "/icons/SoundSpaceIcon.png",
							durationFormatted: "1:24"
						}}
					/>

					<Post
						user={{
							name: "Sarah M.",
							avatarUrl: "https://i.pravatar.cc/150?img=5",
							isOnline: false
						}}
						timeAgo="5 hours ago"
						content="Does anyone have good playlist recommendations for studying? I've been listening to lo-fi hip hop but I need something fresh!"
						stats={{ likes: 112, comments: 14 }}
					/>

					<Post
						user={{
							name: "David K.",
							avatarUrl: "https://i.pravatar.cc/150?img=12",
							isOnline: true
						}}
						timeAgo="12 hours ago"
						content="Just got tickets for the upcoming festival! Who else is going? 🎶🤘"
						stats={{ likes: 340, comments: 89 }}
						song={{
							title: "Festival Anthem",
							artist: "The Headliners",
							albumImageUrl: "/icons/SoundSpaceIcon.png",
							durationFormatted: "3:45"
						}}
					/>

					<Post
						user={{
							name: "Emily W.",
							avatarUrl: "https://i.pravatar.cc/150?img=23",
							isOnline: true
						}}
						timeAgo="1 day ago"
						content="Trying to learn how to produce my own beats. It's so much harder than it looks, but I'm having a blast!"
						stats={{ likes: 45, comments: 5 }}
					/>

					<Post
						user={{
							name: "Chris J.",
							avatarUrl: "https://i.pravatar.cc/150?img=33",
							isOnline: false
						}}
						timeAgo="2 days ago"
						content="Throwback to the 90s hits. Nothing beats the classics! 📼"
						stats={{ likes: 890, comments: 120 }}
						song={{
							title: "Retro Vibes",
							artist: "Classics",
							albumImageUrl: "/icons/SoundSpaceIcon.png",
							durationFormatted: "4:00"
						}}
					/>
				</div>
				<FriendSidebar />
			</div>
		</div>
	);
}

export default function FeedPage() {
	return (
		<Suspense fallback={<div>Loading Feed...</div>}>
			<FeedContent />
		</Suspense>
	);
}
