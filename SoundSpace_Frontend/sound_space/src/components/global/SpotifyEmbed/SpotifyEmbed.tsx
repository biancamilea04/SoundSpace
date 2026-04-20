interface SpotifyEmbedProps {
    spotifyUri: string;
}

const toEmbedUrl = (uri: string): string | null => {
    const match = uri.match(/^spotify:(track|album|playlist|episode):([a-zA-Z0-9]+)$/);
    if (match) {
        return `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator&theme=0`;
    }

    const urlMatch = uri.match(/open\.spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/);
    if (urlMatch) {
        return `https://open.spotify.com/embed/${urlMatch[1]}/${urlMatch[2]}?utm_source=generator&theme=0`;
    }

    return null;
};

export const SpotifyEmbed = ({ spotifyUri }: SpotifyEmbedProps) => {
    const embedUrl = toEmbedUrl(spotifyUri);
    if (!embedUrl) return null;

    return (
        <iframe
            style={{ borderRadius: "12px", marginTop: "12px" }}
            src={embedUrl}
            width="100%"
            height="152"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title="Spotify Embed"
        />
    );
};

export default SpotifyEmbed;
