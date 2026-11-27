import { specText, specUrl } from '@/lib/specs';
import type { Edition } from '@/lib/types';
import { CopyButton } from './copy-button';
import { ext, safeUrl } from './links';

export function Ideas({ edition }: { edition: Edition }) {
  return (
    <div className="ideas">
      {(edition.ideas ?? []).map((x, i) => {
        const n = i + 1;
        const url = specUrl(edition.edition, n);
        const command = `claude "$(curl -s ${url})"`;
        return (
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
            <div className="agent">
              <span className="agent-label">Build it with your agent</span>
              <div className="agent-actions">
                <CopyButton text={specText(edition, x, n)} label="Copy agent spec" />
                <a className="btn" href={`/ideas/${edition.edition}/${n}/spec.md`} {...ext}>spec.md</a>
                <CopyButton text={command} label="Copy command" />
              </div>
              <code className="agent-cmd">{command}</code>
            </div>
          </article>
        );
      })}
    </div>
  );
}
