"use client";

import "./CurrentlyListening.css";

interface CurrentlyListeningProps {
    trackName: string;
    artistName: string;
}

export const CurrentlyListening = ({ trackName, artistName }: CurrentlyListeningProps) => {
    return (
        <div className="currently-listening">
            <h3 className="currently-listening__label">CURRENTLY LISTENING</h3>
            <div className="currently-listening__content">
                <div className="currently-listening__icon">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
                    </svg>
                </div>
                <div className="currently-listening__info">
                    <span className="currently-listening__track">{trackName}</span>
                    <span className="currently-listening__artist">{artistName}</span>
                </div>
            </div>
        </div>
    );
};

export default CurrentlyListening;
