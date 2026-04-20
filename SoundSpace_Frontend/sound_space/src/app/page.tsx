"use client";

import { Suspense } from "react";

import MenuSidebar from "@/components/global/MenuSidebar/MenuSidebar";
import SharePost from "@/components/global/SharePost/SharePost";
import FeedPost from "@/components/global/FeedPost/FeedPost";
import './page.css';
import FriendSidebar from "@/components/global/FriendSidebar/FriendSidebar";
import Header from "@/components/global/Header/Header";
import { useGlobalFeed } from "@/hooks/Post/useGlobalFeed";

function PageContent() {
	const { posts, isLoading, refresh } = useGlobalFeed();

	return (
		<div className="page-wrapper">
			<Header title="Home" />
			<div className="feed-container">
				<MenuSidebar />
				<div className="feed-main">
					<SharePost onPostCreated={refresh} />

					{isLoading && <p style={{ color: "var(--text-muted)" }}>Loading feed...</p>}

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
