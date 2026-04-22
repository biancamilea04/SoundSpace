"use client";

import { Suspense } from "react";

import MenuSidebar from "@/components/global/MenuSidebar/MenuSidebar";
import PostComposer from "@/components/profile/PostComposer/PostComposer";
import FeedPost from "@/components/global/FeedPost/FeedPost";
import './page.css';
import FriendSidebar from "@/components/global/FriendSidebar/FriendSidebar";
import Header from "@/components/global/Header/Header";
import { useGlobalFeed } from "@/hooks/Post/useGlobalFeed";
import { useUserProfile } from "@/hooks/UserProfile/useUserProfile";

function PageContent() {
	const { posts, isLoading, refresh } = useGlobalFeed();
	const { user } = useUserProfile();

	return (
		<div className="page-wrapper">
			<Header title="Home" />
			<div className="feed-container">
				<MenuSidebar />
				<div className="feed-main">
					<PostComposer 
						avatarUrl={user?.profileImageUrl} 
						username={user?.displayName}
						onPostCreated={refresh} 
					/>

					{isLoading && posts.length === 0 && <p style={{ color: "var(--text-muted)", marginBottom: "16px" }}>Loading feed...</p>}

					{posts.map((post) => (
						<FeedPost key={post.id} post={post} />
					))}
				</div>
				<FriendSidebar />
			</div>
		</div>
	);
}

export default function Page() {
	return (
		<Suspense fallback={<div>Loading Feed...</div>}>
			<PageContent />
		</Suspense>
	);
}
