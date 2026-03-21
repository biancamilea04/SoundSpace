import Image from "next/image";
import { SpotifyButton } from "@/components/ui/SpotifyButton/SpotifyButton";
import "./page.css";

export default function Home() {
  return (
    <div className="home-container">
      {/* Navigation */}
      <nav className="home-nav">
        <div className="home-nav__brand">
          <Image
            src="/icons/SoundSpaceIcon.png"
            alt="SoundSpace Logo"
            width={36}
            height={36}
            className="home-nav__logo"
          />
          <span className="home-nav__title">SoundSpace</span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="home-main">
        {/* Typography */}
        <h1 className="home-heading">
          <span className="home-heading__line1">Your music.</span>
          <span className="home-heading__line2">
            Your vibe.
          </span>
        </h1>

        <p className="home-subtitle">
          Connect with friends through music. Share playlists, discover new tracks, and see what everyone's listening to.
        </p>

        {/* CTA Button Wrapper with Glow */}
        <div className="home-cta-wrapper">
          <div className="home-cta-glow"></div>
          <div className="home-cta-button">
            <SpotifyButton />
          </div>
        </div>
      </main>

    </div>
  );
}
