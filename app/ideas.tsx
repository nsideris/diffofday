import type { Idea } from '@/lib/types';
import { ext, safeUrl } from './links';

export function Ideas({ ideas }: { ideas: Idea[] }) {
  return (
    <div className="ideas">
      {ideas.map((x) => (
        <article key={x.title} className="idea">
          <div className="tags">
            <span className="kind">{x.kind ?? 'Idea'}</span>
            {x.angle && <span className="angle">{x.angle}</span>}
            {x.effort && <span className="effort">· {x.effort}</span>}
          </div>
          <h3>{x.title}</h3>
          <p>{x.why}</p>
          <ol>{x.steps.map((s) => <li key={s}><span>{s}</span></li>)}</ol>
          <div className="srcs">{x.sources.map((s) => <a key={s.u} href={safeUrl(s.u)} {...ext}>{s.t}</a>)}</div>
        </article>
      ))}
    </div>
  );
}
