import { specText } from '@/lib/specs';
import { ideaTopic, SPIKE_TOPIC, triesByTopic } from '@/lib/tried-by';
import type { Edition } from '@/lib/types';
import { AgentBox } from './agent-box';
import { ext, safeUrl } from './links';

const stars = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(n));
const githubOnly = (u: string) => (/^https:\/\/github\.com\//.test(u) ? u : '#');

export async function Ideas({ edition }: { edition: Edition }) {
  const tries = await triesByTopic();
  return (
    <div className="ideas">
      {(edition.ideas ?? []).map((x, i) => {
        const topic = ideaTopic(edition.edition, i + 1);
        const tried = tries.get(topic) ?? [];
        return (
          <article key={x.title} className="idea">
            <div className="tags">
              {x.angle && <span className="angle">{x.angle}</span>}
              {x.effort && <span className="effort">· {x.effort}</span>}
            </div>
            <h3>{x.title}</h3>
            <p>{x.why}</p>
            <ol>{x.steps.map((s) => <li key={s}><span>{s}</span></li>)}</ol>
            <div className="srcs">{x.sources.map((s) => <a key={s.u} href={safeUrl(s.u)} {...ext}>{s.t}</a>)}</div>
            {x.priorArt && (
              <div className="prior">
                <span className="prior-label">Already on GitHub</span>
                {x.priorArt.length === 0 ? (
                  <p>Nothing yet. This one is open.</p>
                ) : (
                  <ul>
                    {x.priorArt.map((p) => (
                      <li key={p.repo}>
                        <a href={githubOnly(p.url)} {...ext}>{p.repo}</a>
                        <span className="meta mono">★ {stars(p.stars)} · {p.updated}</span>
                        {p.description && <span className="desc">{p.description}</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            <div className="tried">
              <span className="prior-label">Tried by</span>
              {tried.length ? (
                <p>{tried.map((t, n) => <span key={t.repo}>{n > 0 && ', '}<a href={githubOnly(t.url)} {...ext}>{t.owner}</a></span>)}</p>
              ) : (
                <p>Nobody yet. Tried it? Add the topics <code>{SPIKE_TOPIC}</code> and <code>{topic}</code> to your public repo and it shows up here.</p>
              )}
            </div>
            <AgentBox kind="idea" date={edition.edition} n={i + 1} spec={specText(edition, x, i + 1)} />
          </article>
        );
      })}
    </div>
  );
}
