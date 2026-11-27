'use client';

import { useEffect, useState } from 'react';
import type { Idea } from '@/lib/types';
import { ext, safeUrl } from './links';

const KEY = 'dod-tried';

export function Ideas({ ideas }: { ideas: Idea[] }) {
  const [tried, setTried] = useState<Record<string, number>>({});

  useEffect(() => {
    try { setTried(JSON.parse(localStorage.getItem(KEY) ?? '{}')); } catch { /* storage unavailable */ }
  }, []);

  const toggle = (title: string) => setTried((prev) => {
    const next = { ...prev };
    if (next[title]) delete next[title]; else next[title] = Date.now();
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* storage unavailable */ }
    return next;
  });

  return (
    <div className="ideas">
      {ideas.map((x) => {
        const done = !!tried[x.title];
        return (
          <article key={x.title} className={`idea${done ? ' done' : ''}`}>
            <div className="tags">
              <span className="kind">{x.kind ?? 'Idea'}</span>
              {x.angle && <span className="angle">{x.angle}</span>}
              {x.effort && <span className="effort">· {x.effort}</span>}
            </div>
            <h3>{x.title}</h3>
            <p>{x.why}</p>
            <ol>{x.steps.map((s) => <li key={s}><span>{s}</span></li>)}</ol>
            <div className="foot">
              <div className="srcs">{x.sources.map((s) => <a key={s.u} href={safeUrl(s.u)} {...ext}>{s.t}</a>)}</div>
              <button className="btn" onClick={() => toggle(x.title)}>{done ? 'Tried ✓' : 'Mark as tried'}</button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
