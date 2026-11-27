import { XMLParser } from 'fast-xml-parser';

export interface Show { name: string; host: string; feed: string }

export const SHOWS: Show[] = [
  { name: "Lenny's Podcast", host: 'Lenny Rachitsky', feed: 'https://api.substack.com/feed/podcast/10845.rss' },
  { name: 'Dear Architects', host: 'Luca Mezzalira', feed: 'https://anchor.fm/s/10f1e764c/podcast/rss' },
  { name: 'The Pragmatic Engineer', host: 'Gergely Orosz', feed: 'https://api.substack.com/feed/podcast/458709.rss' },
  { name: 'The InfoQ Podcast', host: 'InfoQ', feed: 'https://feeds.soundcloud.com/users/soundcloud:users:215740450/sounds.rss' },
  { name: 'Rethink Engineering', host: 're:cinq & hackers&wizards', feed: 'https://api.riverside.fm/hosting/EO20aZr9.rss' },
  { name: 'GOTO – The Brightest Minds in Tech', host: 'GOTO', feed: 'https://rss.buzzsprout.com/1714721.rss' },
];

export interface Episode {
  show: string;
  host: string;
  title: string;
  published: string;
  link?: string;
  audio?: string;
  minutes?: number;
  summary?: string;
}

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@', processEntities: true, htmlEntities: true });

function httpUrl(value: unknown): string | undefined {
  const s = typeof value === 'string' ? value.trim() : '';
  return /^https?:\/\/[^\s<>"']+$/i.test(s) ? s : undefined;
}

function plain(value: unknown, max: number): string {
  const s = typeof value === 'string' ? value : typeof value === 'object' && value && '#text' in value ? String((value as Record<string, unknown>)['#text']) : '';
  const text = s.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

function minutes(value: unknown): number | undefined {
  const s = String(value ?? '').trim();
  if (!s) return undefined;
  const parts = s.split(':').map(Number);
  if (parts.some(Number.isNaN)) return undefined;
  const seconds = parts.reduce((acc, p) => acc * 60 + p, 0);
  return Math.max(1, Math.round(seconds / 60));
}

function withoutSponsorRead(summary: string) {
  return /^(brought to you by|sponsored by|this episode is (brought|sponsored)|thanks to our sponsor)/i.test(summary) ? '' : summary;
}

async function episodesOf(show: Show): Promise<Episode[]> {
  const res = await fetch(show.feed, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(8000), headers: { 'User-Agent': 'diffofday-podcast-check/1.0' } });
  if (!res.ok) return [];
  const xml = await res.text();
  if (xml.length > 15_000_000) return [];
  const items = parser.parse(xml)?.rss?.channel?.item;
  const list = Array.isArray(items) ? items : items ? [items] : [];
  return list.slice(0, 10).map((it: Record<string, unknown>) => {
    const date = new Date(String(it.pubDate ?? ''));
    return {
      show: show.name,
      host: show.host,
      title: plain(it.title, 200),
      published: Number.isNaN(date.getTime()) ? '' : date.toISOString(),
      link: httpUrl(it.link),
      audio: httpUrl((it.enclosure as Record<string, unknown> | undefined)?.['@url']),
      minutes: minutes(it['itunes:duration']),
      summary: withoutSponsorRead(plain(it['itunes:summary'] ?? it.description, 240)),
    };
  }).filter((e) => e.title && e.published);
}

export async function recentEpisodes(days: number): Promise<Episode[]> {
  const since = Date.now() - days * 86_400_000;
  const results = await Promise.allSettled(SHOWS.map(episodesOf));
  return results
    .flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
    .filter((e) => Date.parse(e.published) >= since)
    .sort((a, b) => b.published.localeCompare(a.published));
}
