"use client";

import "./RecentStreams.css";
import Image from "next/image";

interface Stream {
    title: string;
    artist: string;
    albumArtUrl: string;
    timeAgo: string;
}

interface RecentStreamsProps {
    streams: Stream[];
}

export const RecentStreams = ({streams}: RecentStreamsProps) => {
    return (
        <div className="recent-streams">
            <h3 className="recent-streams__title">Recent Streams</h3>
            <div className="recent-streams__list">
                {streams.map((stream, index) => (
                    <div key={index} className="recent-streams__item">
                        <Image
                            src={stream.albumArtUrl}
                            alt={`${stream.title} album art`}
                            width={40}
                            height={40}
                            className="top-streams__album-art"
                        />
                        <div className="top-streams__info">
                            <span className="recent-streams__track">{stream.title}</span>
                            <span className="top-streams__artist">{stream.artist}</span>
                        </div>
                        <span className="recent-streams__time">{stream.timeAgo}</span>

                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentStreams;
