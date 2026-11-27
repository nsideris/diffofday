export function SpotifyIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" style={{ flex: 'none' }}>
      <circle cx="12" cy="12" r="12" fill="#1DB954" />
      <path d="M6.2 9.3c3.9-1.2 8.3-.8 11.7 1.1" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" fill="none" />
      <path d="M6.8 12.6c3.2-.9 6.7-.6 9.5.9" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d="M7.4 15.6c2.5-.6 5.1-.4 7.2.7" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function spotifySearchUrl(show: string, title: string) {
  const query = Array.from(`${show} ${title}`).slice(0, 200).join('');
  return `https://open.spotify.com/search/${encodeURIComponent(query)}/episodes`;
}
