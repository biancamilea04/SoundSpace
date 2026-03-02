import Image from "next/image";
import { SpotifyButton } from "@/components/ui/SpotifyButton";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen text-white/90 font-sans selection:bg-[#1ed760] selection:text-black">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 md:px-12 select-none w-full max-w-[1400px] mx-auto">
        <div className="flex items-center gap-3">
          <Image
            src="/icons/SoundSpaceIcon.png"
            alt="SoundSpace Logo"
            width={36}
            height={36}
            className="brightness-0 invert"
          />
          <span className="font-extrabold text-xl tracking-tight text-white">SoundSpace</span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 text-center mt-[-4rem]">
        {/* Typography */}
        <h1 className="text-6xl md:text-[5.5rem] font-black tracking-tighter leading-[1.1] mb-6">
          <span className="text-white block">Your music.</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-[#1ed760] block">
            Your vibe.
          </span>
        </h1>

        <p className="max-w-[600px] text-lg md:text-xl text-zinc-300 mb-10 leading-relaxed font-normal">
          Connect with friends through music. Share playlists, discover new tracks, and see what everyone's listening to.
        </p>

        {/* CTA Button Wrapper with Glow */}
        <div className="relative group mt-2">
          <div className="absolute inset-0 bg-[#1ed760] blur-2xl opacity-40 rounded-full group-hover:opacity-60 transition-opacity duration-500"></div>
          <div className="relative">
            <SpotifyButton />
          </div>
        </div>
      </main>

    </div>
  );
}
