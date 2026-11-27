import { recentEpisodes, SHOWS } from '@/lib/podcasts';
import { ext } from './links';
import { SpotifyIcon, spotifySearchUrl } from './spotify-icon';

function when(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
}

export async function Listen() {
  const episodes = (await recentEpisodes(14).catch(() => [])).slice(0, 8);
  return (
    <section className="block" id="listen" aria-labelledby="listen-h">
      <p className="kicker">Listen</p>
      <h2 className="sec" id="listen-h">New podcast episodes</h2>
      <p className="sec-note">
        New in the last two weeks from {SHOWS.map((s) => s.name).join(', ')}.
        Want them in your podcast app? Import <a href="/podcasts.opml">podcasts.opml</a>.
      </p>
      {episodes.length === 0 ? (
        <p className="empty">No new episodes in the last two weeks.</p>
      ) : (
        <ul className="episodes">
          {episodes.map((e) => (
            <li key={`${e.show}-${e.published}-${e.title}`}>
              <div className="ep-show">{e.show}<span>{when(e.published)}{e.minutes ? ` · ${e.minutes} min` : ''}</span></div>
              <h3>{e.link ? <a href={e.link} {...ext}>{e.title}</a> : e.title}</h3>
              {e.summary && <p>{e.summary}</p>}
              <div className="ep-links">
                <a className="btn spotify" href={spotifySearchUrl(e.show, e.title)} {...ext} aria-label={`Listen on Spotify: ${e.title}`}>
                  <SpotifyIcon />Listen on Spotify
                </a>
                {e.audio && <a className="btn" href={e.audio} {...ext}>MP3</a>}
                {e.link && <a className="btn" href={e.link} {...ext}>Episode page</a>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
