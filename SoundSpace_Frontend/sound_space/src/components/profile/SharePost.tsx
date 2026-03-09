"use client";

import { Headphones, Music, Send } from "lucide-react";
import { useState } from "react";

interface SharePostProps {
    onPost?: (text: string, song?: string) => void;
}

export const SharePost = ({ onPost }: SharePostProps) => {
    const [text, setText] = useState("");
    const [attachedSong, setAttachedSong] = useState<string | null>(null);

    const handlePost = () => {
        if (!text.trim()) return;
        onPost?.(text, attachedSong ?? undefined);
        setText("");
        setAttachedSong(null);
    };

    const handleAttachSong = () => {
        setAttachedSong("Selected Song");
    };

    return (
        <section>
            <h2 className="text-xs font-bold tracking-[0.2em] text-zinc-400 uppercase mb-4">
                Share Your Thoughts
            </h2>
            <div className="rounded-xl bg-[#181818] border border-zinc-800/60 p-5 md:p-6 shadow-lg">
                {/* Input Area */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                        <Headphones className="w-4.5 h-4.5 text-zinc-400" />
                    </div>
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="What are you listening to?"
                        className="flex-1 bg-transparent text-white placeholder-zinc-500 text-sm md:text-base outline-none border-none"
                        onKeyDown={(e) => e.key === "Enter" && handlePost()}
                    />
                </div>

                {/* Attached Song Chip */}
                {attachedSong && (
                    <div className="mb-4 flex items-center gap-2 bg-zinc-800/80 rounded-lg px-3 py-2 w-fit">
                        <Music className="w-3.5 h-3.5 text-[#1ed760]" />
                        <span className="text-sm text-zinc-300">{attachedSong}</span>
                        <button
                            onClick={() => setAttachedSong(null)}
                            className="ml-1 text-zinc-500 hover:text-white text-xs"
                            aria-label="Remove attached song"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={handleAttachSong}
                        className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm transition-colors group"
                    >
                        <Music className="w-4 h-4 group-hover:text-[#1ed760] transition-colors" />
                        Attach Song
                    </button>

                    <button
                        onClick={handlePost}
                        disabled={!text.trim()}
                        className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#1ed760] hover:bg-[#1db954] text-black font-semibold text-sm transition-all hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-[0_0_12px_rgba(30,215,96,0.2)]"
                    >
                        <Send className="w-3.5 h-3.5" />
                        Post
                    </button>
                </div>
            </div>
        </section>
    );
};

export default SharePost;
