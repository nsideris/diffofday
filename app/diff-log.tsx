'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { DiffItem, Hunk, Part } from '@/lib/diff-log';
import { CopyButton } from './copy-button';
import { ext } from './links';
import { SpotifyIcon } from './spotify-icon';

const FOLDED_KEY = 'dod-folded';
const ALL = 'All';

export function DiffLog({ hunks }: { hunks: Hunk[] }) {
  const [query, setQuery] = useState('');
  const [folded, setFolded] = useState<Record<string, boolean>>({});
  const [topic, setTopic] = useState(ALL);
  const search = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try { setFolded(JSON.parse(localStorage.getItem(FOLDED_KEY) ?? '{}')); } catch { /* storage unavailable */ }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
      if (e.key === '/' && !typing) { e.preventDefault(); search.current?.focus(); }
      if (e.key === 'Escape' && e.target === search.current) { setQuery(''); search.current?.blur(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const toggle = (id: string) => {
    const next = { ...folded, [id]: !folded[id] };
    setFolded(next);
    try { localStorage.setItem(FOLDED_KEY, JSON.stringify(next)); } catch { /* storage unavailable */ }
  };

  const needle = query.trim().toLowerCase();
  const view = useMemo(() => hunks.map((h) => {
    const items = h.items.filter((i) => matches(i, needle) && (!h.topics || topic === ALL || i.topic === topic));
    return { ...h, shown: items };
  }), [hunks, needle, topic]);
  const total = hunks.reduce((n, h) => n + h.items.length, 0);
  const found = view.reduce((n, h) => n + h.shown.length, 0);

  return (
    <div className="dl">
      <nav className="dl-nav" aria-label="Sections">
        {hunks.map((h) => (
          <a key={h.id} href={`#${h.id}`}>
            <span>{h.name}</span><span className="dl-count">{h.items.length}</span>
          </a>
        ))}
      </nav>
      <div className="dl-main">
        <label className="dl-search">
          <span className="dl-slash" aria-hidden="true">/</span>
          <input
            ref={search}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="grep today’s edition: mcp, security, spotify…"
            aria-label="Search today’s edition"
          />
          <span className="dl-found" aria-live="polite">{needle ? `${found} of ${total}` : ''}</span>
        </label>
        {view.map((h) => {
          const open = !!needle || !folded[h.id];
          return (
            <section key={h.id} id={h.id} className="dl-hunk" aria-labelledby={`${h.id}-h`}>
              <h2 id={`${h.id}-h`}>
                <button type="button" onClick={() => toggle(h.id)} aria-expanded={open}>
                  <span><span className="dl-chev" aria-hidden="true">{open ? '▾' : '▸'}</span> @@ {h.name} @@ <span className="dl-hint">{h.hint}</span></span>
                  <span className="dl-count">{needle ? `${h.shown.length} of ${h.items.length}` : h.items.length}</span>
                </button>
              </h2>
              {open && h.topics && (
                <div className="dl-chips" role="group" aria-label="Filter the feed by topic">
                  {[ALL, ...h.topics].map((t) => (
                    <button key={t} type="button" aria-pressed={topic === t} onClick={() => setTopic(t)}>
                      {t} <span>{t === ALL ? h.items.length : h.items.filter((i) => i.topic === t).length}</span>
                    </button>
                  ))}
                </div>
              )}
              {open && (h.shown.length ? h.shown.map((i) => <Line key={i.id} item={i} />) : <p className="dl-empty">no lines match</p>)}
            </section>
          );
        })}
        <p className="dl-help">Press / to search · click a @@ header to fold it</p>
      </div>
    </div>
  );
}

function matches(i: DiffItem, needle: string) {
  if (!needle) return true;
  const rows = i.rows.flatMap((r) => r.parts.map((p) => p.t)).join(' ');
  return `${i.title} ${i.tag ?? ''} ${i.summary ?? ''} ${i.meta.join(' ')} ${i.topic ?? ''} ${rows}`.toLowerCase().includes(needle);
}

function Line({ item }: { item: DiffItem }) {
  return (
    <article className="dl-line">
      <span className={`dl-sign s${'+~▶*'.indexOf(item.sign)}`} aria-hidden="true">{item.sign}</span>
      <div className="dl-body">
        <h3>
          {item.href ? <a href={item.href} {...ext}>{item.title}</a> : item.title}
          {item.tag && <span className="dl-tag">{item.tag}</span>}
        </h3>
        {item.summary && <p className="dl-summary">{item.summary}</p>}
        {item.meta.length > 0 && <p className="dl-meta">{item.meta.join(' · ')}</p>}
        {item.rows.map((r) => (
          <p key={r.k} className="dl-row"><span className="dl-k">{r.k}</span><span>{r.parts.map((p, n) => <PartView key={n} part={p} />)}</span></p>
        ))}
        {item.actions.length > 0 && (
          <div className="dl-actions">
            {item.actions.map((a) => a.copy
              ? <CopyButton key={a.label} text={a.copy} label={a.label} />
              : <a key={a.label} className={`btn${a.spotify ? ' spotify' : ''}`} href={a.href} {...(a.href?.startsWith('/') ? {} : ext)}>{a.spotify && <SpotifyIcon />}{a.label}</a>)}
          </div>
        )}
      </div>
    </article>
  );
}

function PartView({ part }: { part: Part }) {
  const text = part.code ? <code>{part.t}</code> : part.t;
  return <span className="dl-part">{part.u ? <a href={part.u} {...ext}>{text}</a> : text}</span>;
}
