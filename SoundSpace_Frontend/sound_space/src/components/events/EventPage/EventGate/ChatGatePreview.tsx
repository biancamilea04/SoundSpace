"use client";

import "./ChatGatePreview.css";

const BUBBLES = [
    { side: "left",  cls: "cgp__bubble--1" },
    { side: "right", cls: "cgp__bubble--2" },
    { side: "left",  cls: "cgp__bubble--3" },
    { side: "right", cls: "cgp__bubble--4" },
    { side: "left",  cls: "cgp__bubble--5" },
    { side: "right", cls: "cgp__bubble--6" },
] as const;

const ChatGatePreview = () => (
    <div className="cgp">
        <div className="cgp__header">
            <span className="cgp__live-dot" />
            <span className="cgp__live-text">LIVE</span>
            <span className="cgp__title">Event Chat</span>
        </div>
        <div className="cgp__messages">
            {BUBBLES.map((b, i) => (
                <div key={i} className={`cgp__row cgp__row--${b.side}`}>
                    <div className={`cgp__bubble ${b.cls} ${b.side === "right" ? "cgp__bubble--sent" : "cgp__bubble--received"}`} />
                </div>
            ))}
        </div>
    </div>
);

export default ChatGatePreview;
