import { editionDates, latestEdition } from '@/lib/editions';
import { EditionView } from './edition-view';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [edition, archive] = await Promise.all([latestEdition(), editionDates(1000)]);
  if (!edition) return <p className="loading">The first edition is on its way.</p>;
  return <EditionView edition={edition} archive={archive} isLatest />;
}
