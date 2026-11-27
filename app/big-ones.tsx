import { playSpecText } from '@/lib/specs';
import type { Edition } from '@/lib/types';
import { AgentBox } from './agent-box';
import { ext, safeUrl } from './links';

export function BigOnes({ edition }: { edition: Edition }) {
  return (
    <div className="plays">
      {(edition.bigco ?? []).map((p, i) => (
        <article key={p.u} className="play">
          <div className="tags">
            <span className="kind">{p.company}</span>
            {p.effort && <span className="effort">Small-team version · {p.effort}</span>}
          </div>
          <h3><a href={safeUrl(p.u)} {...ext}>{p.title}</a></h3>
          {p.author && <p className="by">by {p.author}, {p.company}</p>}
          <div className="play-cols">
            <div><h4>What they did</h4><p>{p.what}</p></div>
            <div><h4>Why it works for them</h4><p>{p.why}</p></div>
            <div className="small">
              <h4>Your small-team version</h4>
              <p>{p.small}</p>
              <ol>{p.steps.map((s) => <li key={s}><span>{s}</span></li>)}</ol>
            </div>
          </div>
          <AgentBox kind="playbook" date={edition.edition} n={i + 1} spec={playSpecText(p)} />
        </article>
      ))}
    </div>
  );
}
