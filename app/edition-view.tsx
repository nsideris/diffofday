import type { Edition, TopStory } from '@/lib/types';
import { ArchiveSelect } from './archive-select';
import { DiffArt } from './diff-art';
import { Feed } from './feed';
import { ext, safeUrl } from './links';

function longDate(date: string) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  });
}

function athensTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Athens' });
}

function Heat({ story }: { story: TopStory }) {
  if (!story.heat) return null;
  return <span className="heat"><mark className="hl">{story.heat}</mark> {story.heatLabel}</span>;
}

export function EditionView({ edition, archive, isLatest }: { edition: Edition; archive: string[]; isLatest: boolean }) {
  const [lead, ...rest] = edition.top;
  const number = archive.length - archive.indexOf(edition.edition);
  return (
    <>
      <div className="topbar"><div className="wrap">
        <div className="left">
          <span>{longDate(edition.edition)}</span>
          {number > 0 && <span>No. {number}</span>}
          <span>Updated {athensTime(edition.updated)} EET</span>
        </div>
        <div className="right">
          <ArchiveSelect dates={archive} current={isLatest ? '' : edition.edition} />
          <a href="/feed.xml">RSS</a>
          <a href="#about">About</a>
        </div>
      </div></div>

      <header className="nameplate"><div className="wrap">
        <h1>Diff of the <em>Day</em></h1>
        <p className="tag">What changed in AI today, for engineers who build with it</p>
      </div></header>

      <nav className="sectionnav" aria-label="Sections"><div className="wrap">
        <a href="#top-stories">Top stories</a><a href="#must-read">Must read</a><a href="#feed">The feed</a><a href="#about">About</a>
      </div></nav>

      <main className="wrap" id="main">
        {lead && (
          <section className="block" id="top-stories" aria-labelledby="ts-h">
            <p className="kicker" id="ts-h">Top stories · ranked by conversation</p>
            <div className="front">
              <article className="lead">
                <span className="rank">No. 1 today</span>
                <h3><a href={safeUrl(lead.u)} {...ext}>{lead.h}</a></h3>
                {lead.summary && <p className="dek">{lead.summary}</p>}
                <div className="byline">
                  <Heat story={lead} />
                  {lead.src && <span>{lead.src}</span>}
                  {lead.when && <span>{lead.when}</span>}
                  {lead.more && <a href={safeUrl(lead.more)} {...ext}>Primary source</a>}
                </div>
                <DiffArt edition={edition} />
              </article>
              <div className="side">
                {rest.map((s, i) => (
                  <article key={s.id}>
                    <span className="n">{i + 2}</span>
                    <div>
                      <h3><a href={safeUrl(s.u)} {...ext}>{s.h}</a></h3>
                      {s.summary && <p>{s.summary}</p>}
                      <div className="byline">
                        <Heat story={s} />
                        {s.when && <span>{s.when}</span>}
                        {s.more && <a href={safeUrl(s.more)} {...ext}>Source</a>}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="block" id="must-read" aria-label="Must read and signals">
          <div className="split">
            <div>
              <p className="kicker">Must read</p>
              <h2 className="sec">Things worth your time</h2>
              <ol className="must">
                {edition.mustread.map((m) => (
                  <li key={m.u}><div>
                    <a href={safeUrl(m.u)} {...ext}>{m.t}</a>
                    {m.src && <span className="s">{m.src}</span>}
                    {m.why && <span className="w">{m.why}</span>}
                  </div></li>
                ))}
              </ol>
            </div>
            <div>
              <p className="kicker">Signals</p>
              <h2 className="sec">This week</h2>
              <ul className="signals">
                {edition.trends.map((t) => (
                  <li key={t.name}>
                    <h4>{t.name}{t.n ? <span>{t.n} items</span> : null}</h4>
                    <p>{t.summary}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="block" id="feed" aria-labelledby="feed-h">
          <p className="kicker">The feed</p>
          <h2 className="sec" id="feed-h">Everything else from today</h2>
          <Feed sections={edition.sections} />
        </section>
      </main>

      <div className="wrap">
        <section className="block" id="about" aria-labelledby="about-h">
          <p className="kicker">About</p>
          <h2 className="sec" id="about-h">How this paper is made</h2>
          <div className="about-grid">
            <div>
              <h3>What it is</h3>
              <p>A morning briefing on AI for software engineers. It leads with what everyone is talking about, then collects the posts, repos and engineering blogs worth reading today.</p>
            </div>
            <div>
              <h3>Where it reads</h3>
              <ul>
                <li>Top news on X and the most-discussed AI posts on LinkedIn</li>
                <li>Engineering blogs and AI labs: Anthropic, OpenAI, Google DeepMind, Hugging Face, Microsoft, GitHub</li>
                <li>GitHub Trending and Hacker News</li>
              </ul>
            </div>
            <div>
              <h3>How it&apos;s written</h3>
              <p>An AI agent (Claude) reads the sources every weekday morning, ranks them, and writes the summaries in its own words. Summaries can contain mistakes: follow the links to the original before you rely on a detail.</p>
              <p>Use it from your tools: <a href="/feed.xml">RSS</a>, <a href="/api/editions/latest">JSON</a>, or MCP at <code>https://diffofday.com/mcp</code>.</p>
            </div>
          </div>
        </section>
        <footer>
          <span>Diff of the Day · written with Claude</span>
          {edition.notes.length > 0 && <span>Notes: {edition.notes.join(' ')}</span>}
        </footer>
      </div>
    </>
  );
}
