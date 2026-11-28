import type { Metadata } from 'next';
import { recentEditions } from '@/lib/editions';
import { archiveEntries } from '@/lib/markdown';

export const dynamic = 'force-dynamic';

const DESCRIPTION = 'Every Diff of the Day edition, newest first, with its lead story and what it holds.';

export const metadata: Metadata = {
  title: 'Archive · Diff of the Day',
  description: DESCRIPTION,
  alternates: { canonical: '/archive' },
  openGraph: { title: 'Archive · Diff of the Day', description: DESCRIPTION, url: 'https://diffofday.com/archive' },
};

export default async function Archive() {
  const entries = archiveEntries(await recentEditions(1000));
  return (
    <>
      <header className="nameplate small"><div className="wrap">
        <p className="home"><a href="/">Diff of the <em>Day</em></a></p>
      </div></header>
      <main className="wrap info">
        <h1>Archive</h1>
        <p className="lede">{DESCRIPTION}</p>
        {entries.length === 0 && <p>The first edition is on its way.</p>}
        <ol className="archive">
          {entries.map((e) => (
            <li key={e.date}>
              <a href={`/editions/${e.date}`}><span className="mono">{e.date}</span> {e.lead}</a>
              <span className="archive-meta">{e.counts}</span>
            </li>
          ))}
        </ol>
        <nav className="info-nav" aria-label="More pages"><a href="/">Today&apos;s edition</a><a href="/feed.xml">RSS</a><a href="/about">About</a></nav>
      </main>
    </>
  );
}
