"use client";

import type { ReactNode } from "react";
import { Lock, Check } from "lucide-react";
import "./EventGate.css";

interface EventGateProps {
    isLocked: boolean;
    onAttend: () => void;
    isPending?: boolean;
    description: string;
    preview: ReactNode;
    children: ReactNode;
}

const EventGate = ({ isLocked, onAttend, isPending, description, preview, children }: EventGateProps) => {
    if (!isLocked) return <>{children}</>;

    return (
        <div className="egate">
            <div className="egate__preview" aria-hidden="true">
                {preview}
            </div>
            <div className="egate__overlay">
                <div className="egate__card">
                    <span className="egate__icon">
                        <Lock size={22} strokeWidth={2.5} />
                    </span>
                    <h3 className="egate__title">Members only</h3>
                    <p className="egate__desc">{description}</p>
                    <button
                        className="egate__btn"
                        onClick={onAttend}
                        disabled={isPending}
                    >
                        {isPending ? (
                            "…"
                        ) : (
                            <>
                                <Check size={15} strokeWidth={3} />
                                Attend Event
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventGate;
