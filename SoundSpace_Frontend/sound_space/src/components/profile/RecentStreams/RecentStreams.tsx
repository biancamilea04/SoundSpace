"use client";

import Image from "next/image";
import { RecentStream } from "@/types/recentStream";
import "./RecentStreams.css";

interface RecentStreamsProps {
    streams: RecentStream[];
    isLoading?: boolean;
}

export const RecentStreams = ({ streams, isLoading }: RecentStreamsProps) => {
    if (isLoading) {
        return (
            <div className="recent-streams">
                <h3 className="recent-streams__title">Recent Streams</h3>
                <span className="recent-streams__loading">Loading...</span>
            </div>
        );
    }

    if (streams.length === 0) {
        return (
            <div className="recent-streams">
                <h3 className="recent-streams__title">Recent Streams</h3>
                <span className="recent-streams__loading">No recent streams found. You may need to log out and log in again to grant permissions.</span>
            </div>
        );
    }

    return (
        <div className="recent-streams">
            <h3 className="recent-streams__title">Recent Streams</h3>
            <div className="recent-streams__list">
                {streams.map((stream, idx) => (
                    <div key={`${stream.name}-${idx}`} className="recent-streams__item">
                        {stream.imageUrl ? (
                            <Image
                                src={stream.imageUrl}
                                alt={`${stream.name} album art`}
                                width={40}
                                height={40}
                                className="recent-streams__album-art"
                            />
                        ) : (
                            <div className="recent-streams__album-art recent-streams__album-art--fallback">
                                {stream.name.charAt(0)}
                            </div>
                        )}
                        <div className="recent-streams__info">
                            <a
                                href={stream.spotifyUrl || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="recent-streams__track-name-link"
                            >
                                {stream.name}
                            </a>
                            <a
                                href={stream.artistUrl || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="recent-streams__artist-link"
                            >
                                {stream.artistName}
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentStreams;

