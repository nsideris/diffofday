import type { LinkItem, Section } from './types';

export const TOPICS = ['Models & releases', 'Agents & MCP', 'Coding agents & dev practice', 'Evals & verification',
  'Infra, inference & tools', 'Security & safety', 'Research & applied ML', 'Industry & society'];

export type FeedItem = LinkItem & { topic: string };

export function feedItems(sections: Section[]): FeedItem[] {
  const seen = new Set<string>();
  const all: FeedItem[] = [];
  for (const s of sections) for (const i of s.items) {
    const k = `${i.src}|${i.u}|${i.t}`;
    if (!seen.has(k)) { seen.add(k); all.push({ ...i, topic: i.topic ?? 'Industry & society' }); }
  }
  return all.sort((a, b) => score(b) - score(a) || String(b.date ?? '').localeCompare(String(a.date ?? '')));
}

function score(i: FeedItem) {
  return i.today != null ? i.today * 1e6 : i.comments != null ? i.comments * 1e3 + (i.likes ?? 0) : (i.likes ?? 0);
}

export const compact = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K` : String(n));
