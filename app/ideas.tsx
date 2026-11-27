import { specText } from '@/lib/specs';
import type { Edition } from '@/lib/types';
import { AgentBox } from './agent-box';
import { ext, safeUrl } from './links';

export function Ideas({ edition }: { edition: Edition }) {
  return (
    <div className="ideas">
      {(edition.ideas ?? []).map((x, i) => (
        <article key={x.title} className="idea">
          <div className="tags">
            {x.angle && <span className="angle">{x.angle}</span>}
            {x.effort && <span className="effort">· {x.effort}</span>}
          </div>
          <h3>{x.title}</h3>
          <p>{x.why}</p>
          <ol>{x.steps.map((s) => <li key={s}><span>{s}</span></li>)}</ol>
          <div className="srcs">{x.sources.map((s) => <a key={s.u} href={safeUrl(s.u)} {...ext}>{s.t}</a>)}</div>
          <AgentBox kind="idea" date={edition.edition} n={i + 1} spec={specText(edition, x, i + 1)} />
        </article>
      ))}
    </div>
  );
}
