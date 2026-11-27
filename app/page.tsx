import { editionDates, latestEdition } from '@/lib/editions';
import { DiffLogPage } from './diff-log-page';
import { JsonLd, siteGraph } from './json-ld';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [edition, archive] = await Promise.all([latestEdition(), editionDates(1000)]);
  if (!edition) return <p className="loading">The first edition is on its way.</p>;
  return (
    <>
      <JsonLd data={siteGraph(edition, '/')} />
      <DiffLogPage edition={edition} archive={archive} isLatest />
    </>
  );
}
