import { diffLog } from '@/lib/diff-log';
import { recentEpisodes } from '@/lib/podcasts';
import { triesByTopic } from '@/lib/tried-by';
import type { Edition } from '@/lib/types';
import { ArchiveSelect } from './archive-select';
import { DiffLog } from './diff-log';
import { ext } from './links';
import { Subscribe } from './subscribe';

const LINKEDIN = 'https://www.linkedin.com/in/nsideris/';

export async function DiffLogPage({ edition, archive, isLatest }: { edition: Edition; archive: string[]; isLatest: boolean }) {
  const [tries, episodes] = await Promise.all([
    triesByTopic(),
    isLatest ? recentEpisodes(14).then((e) => e.slice(0, 8)).catch(() => []) : Promise.resolve(null),
  ]);
  const hunks = diffLog(edition, tries, episodes);
  const changes = hunks.reduce((n, h) => n + h.items.length, 0);
  const at = archive.indexOf(edition.edition);
  const previous = at >= 0 ? archive[at + 1] : archive[0];
  const number = at >= 0 ? archive.length - at : 0;
  const classic = isLatest ? '/classic' : `/classic/${edition.edition}`;
  return (
    <div className="dl-page">
      <div className="topbar"><div className="wrap">
        <div className="left">
          {number > 0 && <span>No. {number}</span>}
          <ArchiveSelect dates={archive} current={isLatest ? '' : edition.edition} />
        </div>
        <div className="right">
          <a href="/archive">Archive</a>
          <a href={classic}>Classic view</a>
          <a href="/feed.xml">RSS</a>
          <a href={LINKEDIN} {...ext}>by Nikos Sideris</a>
        </div>
      </div></div>
      <header className="wrap dl-head">
        <h1>Diff of the <em>Day</em></h1>
        <p className="dl-cmd mono">$ git diff {previous ?? 'yesterday'}..{edition.edition} · {changes} changes</p>
        <p className="dl-tagline">What changed in AI today, for engineers who build with it.</p>
        <Subscribe />
      </header>
      <main className="wrap" id="main">
        <DiffLog hunks={hunks} date={edition.edition} />
      </main>
      <footer className="wrap dl-foot">
        <span>Diff of the Day · made and curated by <a href={LINKEDIN} {...ext}>Nikos Sideris</a> · written with Claude · <a href={classic}>Classic view</a> · <a href="/archive">Archive</a> · <a href="/about">About</a> · <a href="/developers">Developers</a> · <a href="/privacy">Privacy</a> · <a href="/contact">Contact</a> · <a href="/llms.txt">llms.txt</a></span>
        {edition.notes.length > 0 && <span>Notes: {edition.notes.join(' ')}</span>}
      </footer>
    </div>
  );
}
