"use client";

import { Suspense } from "react";

import Sidebar from "@/components/global/Sidebar/Sidebar";
import SharePost from "@/components/global/SharePost/SharePost";
import Post from "@/components/global/Post/Post";
import './page.css';

function FeedContent() {
	return (
		<div className="feed-container">
			<Sidebar />
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
						isNewRelease: true,
						showProgress: true,
						progressPercent: 45,
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
