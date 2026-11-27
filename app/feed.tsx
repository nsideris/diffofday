'use client';

import { useEffect, useMemo, useState } from 'react';
import type { LinkItem, Section } from '@/lib/types';
import { ext, safeUrl } from './links';

const TOPICS = ['Models & releases', 'Agents & MCP', 'Coding agents & dev practice', 'Evals & verification',
  'Infra, inference & tools', 'Security & safety', 'Research & applied ML', 'Industry & society'];
const SOURCES = ['LinkedIn', 'X', 'GitHub', 'Anthropic', 'Claude', 'OpenAI', 'DeepMind', 'Hugging Face'];
const ABOUT: Record<string, string> = {
  LinkedIn: 'linkedin.com', X: 'x.com', GitHub: 'github.com/trending · stars gained today',
  'Models & releases': 'New models, launches and comparisons', 'Agents & MCP': 'Agent design, memory, MCP',
  'Coding agents & dev practice': 'Claude Code, Codex, Cursor and how teams work with them',
  'Evals & verification': 'Benchmarks, evals, testing agent output', 'Infra, inference & tools': 'Serving, local models, tooling',
  'Security & safety': 'Securing agents, misuse, safety', 'Research & applied ML': 'Papers, science, applied ML at scale',
  'Industry & society': 'Business, policy, jobs, events',
};

type Mode = 'topic' | 'source';
type Item = LinkItem & { topic: string };

function load<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : fallback; } catch { return fallback; }
}
function save(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
}
const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K` : String(n));
const day = (d?: string) => {
  if (!d) return '';
  const x = new Date(`${d}T12:00:00`);
  return Number.isNaN(x.getTime()) ? d : x.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};
const score = (i: Item) => (i.today != null ? i.today * 1e6 : i.comments != null ? i.comments * 1e3 + (i.likes ?? 0) : (i.likes ?? 0));

export function Feed({ sections }: { sections: Section[] }) {
  const items = useMemo(() => {
    const seen = new Set<string>();
    const all: Item[] = [];
    for (const s of sections) for (const i of s.items) {
      const k = `${i.src}|${i.u}|${i.t}`;
      if (!seen.has(k)) { seen.add(k); all.push({ ...i, topic: i.topic ?? 'Industry & society' }); }
    }
    return all.sort((a, b) => score(b) - score(a) || String(b.date ?? '').localeCompare(String(a.date ?? '')));
  }, [sections]);

  const [mode, setMode] = useState<Mode>('topic');
  const [only, setOnly] = useState('');
  const [q, setQ] = useState('');
  const [hide, setHide] = useState(false);
  const [read, setRead] = useState<Record<string, number>>({});

  useEffect(() => {
    setMode(load<Mode>('dod-mode', 'topic'));
    setHide(load('dod-hide', false));
    setRead(load('dod-read', {}));
  }, []);

  const groups = useMemo(() => {
    const key = (i: Item) => (mode === 'topic' ? i.topic : i.src ?? 'Other');
    const map = new Map<string, Item[]>();
    for (const i of items) map.set(key(i), [...(map.get(key(i)) ?? []), i]);
    const order = [...(mode === 'topic' ? TOPICS : SOURCES)];
    for (const k of map.keys()) if (!order.includes(k)) order.push(k);
    return order.filter((k) => map.has(k)).map((k) => ({ key: k, list: map.get(k)! }));
  }, [items, mode]);

  const toggleRead = (u: string, force?: boolean) => {
    setRead((prev) => {
      const next = { ...prev };
      if (force || !next[u]) next[u] = Date.now(); else delete next[u];
      save('dod-read', next);
      return next;
    });
  };
  const needle = q.toLowerCase();
  const visible = (i: Item) => !(hide && read[i.u]) &&
    (!needle || `${i.t} ${i.desc ?? ''} ${i.topic} ${i.src ?? ''} ${i.who ?? ''}`.toLowerCase().includes(needle));

  return (
    <>
      <div className="toolbar">
        <div className="seg" role="group" aria-label="Group by">
          {(['topic', 'source'] as const).map((m) => (
            <button key={m} aria-pressed={mode === m} onClick={() => { setMode(m); setOnly(''); save('dod-mode', m); }}>
              By {m}
            </button>
          ))}
        </div>
        <input type="search" placeholder="Filter by keyword" aria-label="Filter by keyword" value={q} onChange={(e) => setQ(e.target.value)} />
        <label><input type="checkbox" checked={hide} onChange={(e) => { setHide(e.target.checked); save('dod-hide', e.target.checked); }} /> Hide read</label>
      </div>
      <div className="chips" role="group" aria-label="Show one group">
        <button className="chip" aria-pressed={only === ''} onClick={() => setOnly('')}>All<span className="c">{items.length}</span></button>
        {groups.map((g) => (
          <button key={g.key} className="chip" aria-pressed={only === g.key} onClick={() => setOnly(g.key)}>
            {g.key}<span className="c">{g.list.length}</span>
          </button>
        ))}
      </div>
      <div className="groups">
        {groups.filter((g) => !only || g.key === only).map((g) => {
          const list = g.list.filter(visible);
          return (
            <section className="group" key={g.key}>
              <h3>{g.key}</h3>
              {ABOUT[g.key] && <p className="about">{ABOUT[g.key]}</p>}
              <ul className="items">
                {list.length === 0 && <li className="empty">Nothing here with these filters.</li>}
                {list.map((i) => {
                  const isRead = !!read[i.u];
                  return (
                    <li key={i.u + i.t} className={isRead ? 'read' : ''}>
                      <a className="t" href={safeUrl(i.u)} {...ext} onClick={() => toggleRead(i.u, true)}>{i.t}</a>
                      {i.desc && <div className="d">{i.desc}</div>}
                      <div className="m">
                        <span className="src">{mode === 'topic' ? i.src : i.topic}</span>
                        {i.who && <span className="who">{i.who}</span>}
                        {i.lang && <span>{i.lang}</span>}
                        {i.date && <span>{day(i.date)}</span>}
                        {i.d && <a href={safeUrl(i.d)} {...ext}>discussion</a>}
                      </div>
                      <div className="r">
                        {i.today != null && <><span className="big">+{fmt(i.today)}</span><span>stars today</span></>}
                        {i.today == null && i.stars != null && <span>{fmt(i.stars)} stars</span>}
                        {i.comments != null && <><span className="big">{fmt(i.comments)}</span><span>comments</span></>}
                        {i.points != null && <span>{fmt(i.points)} points</span>}
                        {i.likes != null && <span>{fmt(i.likes)} likes</span>}
                        <button className="btn" onClick={() => toggleRead(i.u)}>{isRead ? 'Unread' : 'Mark read'}</button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}
