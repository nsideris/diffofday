import { recentEpisodes, SHOWS } from '@/lib/podcasts';
import { ext } from './links';

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
                {e.audio && <a className="btn" href={e.audio} {...ext}>Listen</a>}
                {e.link && <a className="btn" href={e.link} {...ext}>Episode page</a>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
