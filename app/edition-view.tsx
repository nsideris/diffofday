import type { Edition } from '@/lib/types';

const SECTION_TITLES = { network: 'From the timeline', repos: 'Repos', blogs: 'Blogs' } as const;

function longDate(date: string) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  });
}

export function EditionView({ edition, archive }: { edition: Edition; archive: string[] }) {
  return (
    <>
      <header>
        <div className="date mono">{longDate(edition.edition)}</div>
        <h1>Diff of the <span>Day</span></h1>
        <div className="tag mono">What changed in AI today, for engineers who build with it.</div>
      </header>

      <h2>Top stories</h2>
      {edition.top.map((s, i) => (
        <div className="story" id={s.id} key={s.id}>
          <h3><b>{i + 1}</b> <a href={s.u}>{s.h}</a></h3>
          {s.summary && <p>{s.summary}</p>}
          <div className="meta mono">
            {[s.src, s.when, s.heat ? `${s.heat} ${s.heatLabel ?? ''}`.trim() : null].filter(Boolean).join(' · ')}
            {s.more && <> · <a href={s.more}>discussion</a></>}
          </div>
        </div>
      ))}

      {edition.mustread.length > 0 && (
        <>
          <h2>Must read</h2>
          <ul>
            {edition.mustread.map((m) => (
              <li key={m.u}><a href={m.u}>{m.t}</a> <span className="meta mono">{m.src}</span><br />{m.why}</li>
            ))}
          </ul>
        </>
      )}

      {edition.trends.length > 0 && (
        <>
          <h2>Trends</h2>
          {edition.trends.map((t) => (
            <div className="trend" key={t.name}><strong>{t.name}</strong> — {t.summary}</div>
          ))}
        </>
      )}

      {edition.sections.filter((s) => s.items.length > 0).map((s) => (
        <section key={s.id}>
          <h2>{SECTION_TITLES[s.id] ?? s.title}</h2>
          <ul>
            {s.items.map((it) => (
              <li key={it.u + it.t}><a href={it.u}>{it.t}</a> <span className="meta mono">{it.who ?? it.src}</span></li>
            ))}
          </ul>
        </section>
      ))}

      {edition.notes.length > 0 && (
        <>
          <h2>Notes</h2>
          <div className="notes"><ul>{edition.notes.map((n) => <li key={n}>{n}</li>)}</ul></div>
        </>
      )}

      <footer className="mono">
        <a href="/feed.xml">RSS</a><a href="/api/editions/latest">JSON</a><span>MCP: https://diffofday.com/mcp</span>
        <div>Archive: {archive.map((d) => <a key={d} href={`/editions/${d}`}>{d}</a>)}</div>
      </footer>
    </>
  );
}
