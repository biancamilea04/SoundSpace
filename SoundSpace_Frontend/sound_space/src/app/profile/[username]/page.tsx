"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/global/Header/Header";
import MenuSidebar from "@/components/global/MenuSidebar/MenuSidebar";
import ProfileMainView from "@/components/profile/ProfileMainView/ProfileMainView";
import ProfileSidebarRight from "@/components/profile/ProfileSidebarRight/ProfileSidebarRight";
import "./page.css";

function ProfilePageContent() {
    const params = useParams<{ username: string }>();
    const username = decodeURIComponent(params.username);

    return (
        <div className="page-wrapper">
            <Header title="Profile" />
            <div className="feed-container">
                <MenuSidebar />
                <div className="profile-layout-main">
                    <div className="profile-layout-center">
                        <ProfileMainView username={username} />
                    </div>
                    <div className="profile-layout-right">
                        <ProfileSidebarRight username={username} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ProfilePage() {
    return (
        <Suspense fallback={<div className="profile-loading-fallback">Loading...</div>}>
            <ProfilePageContent />
        </Suspense>
    );
}
