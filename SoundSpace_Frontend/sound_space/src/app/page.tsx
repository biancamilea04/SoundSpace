"use client";

import { Suspense } from "react";

import MenuSidebar from "@/components/global/MenuSidebar/MenuSidebar";
import SharePost from "@/components/global/SharePost/SharePost";
import Post from "@/components/global/Post/Post";
import './page.css';
import FriendSidebar from "@/components/global/FriendSidebar/FriendSidebar";
import Header from "@/components/global/Header/Header";

function PageContent() {
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
							name: "test",
							avatarUrl: "https://eu.ui-avatars.com/api/?name=T+T&size=250",
							isOnline: true
						}}
						timeAgo="[test]"
						content="test"
						stats={{ likes: 999, comments: 999 }}
						song={{
							title: "[Test]",
							artist: "[Test]",
							albumImageUrl: "/icons/SoundSpaceIcon.png",
							durationFormatted: "[Test]"
						}}
					/>

					<Post
						user={{
							name: "test",
							avatarUrl: "https://eu.ui-avatars.com/api/?name=T+T&size=250",
							isOnline: true
						}}
						timeAgo="[test]"
						content="test"
						stats={{ likes: 999, comments: 999 }}
					/>

					<Post
						user={{
							name: "test",
							avatarUrl: "https://eu.ui-avatars.com/api/?name=T+T&size=250",
							isOnline: true
						}}
						timeAgo="[test]"
						content="test"
						stats={{ likes: 999, comments: 999 }}
						song={{
							title: "[Test]",
							artist: "[Test]",
							albumImageUrl: "/icons/SoundSpaceIcon.png",
							durationFormatted: "[Test]"
						}}
					/>

					<Post
						user={{
							name: "test",
							avatarUrl: "https://eu.ui-avatars.com/api/?name=T+T&size=250",
							isOnline: true
						}}
						timeAgo="[test]"
						content="test"
						stats={{ likes: 999, comments: 999 }}
					/>

					<Post
						user={{
							name: "test",
							avatarUrl: "https://eu.ui-avatars.com/api/?name=T+T&size=250",
							isOnline: true
						}}
						timeAgo="[test]"
						content="test"
						stats={{ likes: 999, comments: 999 }}
						song={{
							title: "[Test]",
							artist: "[Test]",
							albumImageUrl: "/icons/SoundSpaceIcon.png",
							durationFormatted: "[Test]"
						}}
					/>
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
