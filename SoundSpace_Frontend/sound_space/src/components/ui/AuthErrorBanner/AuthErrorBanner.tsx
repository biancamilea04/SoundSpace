"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, X } from "lucide-react";
import "./AuthErrorBanner.css";

const MESSAGES: Record<string, string> = {
    spotify_cancelled: "Spotify login was cancelled. Please try again.",
};

const AUTO_DISMISS_MS = 5000;

interface AuthErrorBannerProps {
    errorCode: string;
}

export function AuthErrorBanner({ errorCode }: AuthErrorBannerProps) {
    const router = useRouter();
    const [visible, setVisible] = useState(true);

    const message = MESSAGES[errorCode] ?? "Authentication failed. Please try again.";

    const dismiss = () => {
        setVisible(false);
        // Remove the error param from the URL so a refresh doesn't re-show the banner
        router.replace("/landing");
    };

    useEffect(() => {
        const timer = setTimeout(dismiss, AUTO_DISMISS_MS);
        return () => clearTimeout(timer);
    }, []);

    if (!visible) return null;

    return (
        <div className="auth-error-banner" role="alert">
            <AlertTriangle size={16} className="auth-error-banner__icon" />
            <span className="auth-error-banner__message">{message}</span>
            <button
                className="auth-error-banner__close"
                onClick={dismiss}
                aria-label="Dismiss"
            >
                <X size={15} />
            </button>
        </div>
    );
}
