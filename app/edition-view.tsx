import type { Edition, TopStory } from '@/lib/types';
import { ArchiveSelect } from './archive-select';
import { DiffArt } from './diff-art';
import { Feed } from './feed';
import { BigOnes } from './big-ones';
import { Ideas } from './ideas';

const LINKEDIN = 'https://www.linkedin.com/in/nsideris/';
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
          <a href={LINKEDIN} {...ext}>by Nikos Sideris</a>
          <a href="#about">About</a>
        </div>
      </div></div>

      <header className="nameplate"><div className="wrap">
        <h1>Diff of the <em>Day</em></h1>
        <p className="tag">What changed in AI today, for engineers who build with it</p>
      </div></header>

      <nav className="sectionnav" aria-label="Sections"><div className="wrap">
        <a href="#top-stories">Top stories</a><a href="#ideas">Ideas to try</a><a href="#big-ones">From the big ones</a><a href="#must-read">Must read</a><a href="#feed">The feed</a><a href="#mcp">MCP</a><a href="#about">About</a>
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
                <p className="also">Also today</p>
                <ol className="alsolist">
                  {rest.map((s, i) => (
                    <li key={s.id}>
                      <span className="n">{i + 2}</span>
                      <div>
                        <h3><a href={safeUrl(s.u)} title={s.summary} {...ext}>{s.h}</a></h3>
                        <div className="byline">
                          <Heat story={s} />
                          {s.src && <span>{s.src}</span>}
                          {s.when && <span>{s.when}</span>}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </section>
        )}

        {(edition.ideas?.length ?? 0) > 0 && (
          <section className="block" id="ideas" aria-labelledby="ideas-h">
            <p className="kicker">Ideas to try</p>
            <h2 className="sec" id="ideas-h">Side projects from today&apos;s reading</h2>
            <p className="sec-note">Each idea comes from today&apos;s stories and ships with an agent-ready spec: goals, scope, requirements with acceptance criteria and build steps. Hand it to Claude Code, Codex or Cursor and start building.</p>
            <Ideas edition={edition} />
          </section>
        )}

        {(edition.bigco?.length ?? 0) > 0 && (
          <section className="block" id="big-ones" aria-labelledby="big-h">
            <p className="kicker">From the big ones</p>
            <h2 className="sec" id="big-h">What big tech ships, sized for your team</h2>
            <p className="sec-note">Big companies publish how they work. Each day one of their engineering posts gets a small-team version: the part that gives most of the value, buildable by one or two people, with a spec your agent can start from.</p>
            <BigOnes edition={edition} />
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
        <section className="block" id="mcp" aria-labelledby="mcp-h">
          <p className="kicker">MCP</p>
          <h2 className="sec" id="mcp-h">Use it from your AI tools</h2>
          <p className="sec-note">Diff of the Day is also a public, read-only MCP server. Connect it once, then ask your agent about today&apos;s AI news, search past editions or follow the trends.</p>
          <div className="mcp-grid">
            <div>
              <h3>Claude Code</h3>
              <pre><code>{'claude mcp add --transport http diffofday \\\n  https://diffofday.com/mcp'}</code></pre>
              <h3>Cursor, VS Code and other clients</h3>
              <pre><code>{'{\n  "mcpServers": {\n    "diffofday": { "url": "https://diffofday.com/mcp" }\n  }\n}'}</code></pre>
              <h3>Clients that only run local servers</h3>
              <pre><code>{'{\n  "mcpServers": {\n    "diffofday": {\n      "command": "npx",\n      "args": ["-y", "mcp-remote", "https://diffofday.com/mcp"]\n    }\n  }\n}'}</code></pre>
            </div>
            <div>
              <h3>Tools</h3>
              <ul className="tools">
                <li><code>latest_edition</code> Today&apos;s top stories, must-reads and trends</li>
                <li><code>ideas_to_try</code> Side projects from the day&apos;s stories, with steps</li>
                <li><code>small_team_playbook</code> Big-company practices with a small-team version, searchable</li>
                <li><code>get_idea_spec</code> The agent-ready build spec for an idea or a playbook entry</li>
                <li><code>build_idea</code> A prompt: your agent fetches the spec and starts building. In Claude Code: <code>/mcp__diffofday__build_idea</code></li>
                <li><code>get_edition</code> Any past edition by date</li>
                <li><code>search</code> Full-text search across every story and link</li>
                <li><code>list_trends</code> The trend lines of recent editions</li>
              </ul>
              <h3>Try asking</h3>
              <ul className="prompts">
                <li>Give me today&apos;s ideas to try and help me start the first one.</li>
                <li>What changed in AI today that matters for a backend team?</li>
                <li>Search Diff of the Day for MCP quota changes this month.</li>
                <li>Which trends keep coming back over the last two weeks?</li>
              </ul>
              <p className="sec-note">Prefer plain data? Use the <a href="/feed.xml">RSS feed</a> or the <a href="/api/editions/latest">JSON API</a>.</p>
            </div>
          </div>
        </section>
        <section className="block" id="about" aria-labelledby="about-h">
          <p className="kicker">About</p>
          <h2 className="sec" id="about-h">How this paper is made</h2>
          <div className="about-grid">
            <div>
              <h3>What it is</h3>
              <p>A morning briefing on AI for software engineers. It leads with what everyone is talking about, turns the day&apos;s reading into side projects you can try, then collects the posts, repos and engineering blogs worth reading today.</p>
              <p>Made and curated by <a href={LINKEDIN} {...ext}>Nikos Sideris</a>. Follow me on <a href={LINKEDIN} {...ext}>LinkedIn</a> for more.</p>
            </div>
          </div>
        </section>
        <footer>
          <span>Diff of the Day · made and curated by <a href={LINKEDIN} {...ext}>Nikos Sideris</a> · written with Claude</span>
          {edition.notes.length > 0 && <span>Notes: {edition.notes.join(' ')}</span>}
        </footer>
      </div>
    </>
  );
}
