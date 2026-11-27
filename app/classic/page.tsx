import type { Metadata } from 'next';
import { editionDates, latestEdition } from '@/lib/editions';
import { EditionView } from '../edition-view';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Diff of the Day · classic view',
  alternates: { canonical: '/' },
  robots: { index: false, follow: true },
};

export default async function ClassicHome() {
  const [edition, archive] = await Promise.all([latestEdition(), editionDates(1000)]);
  if (!edition) return <p className="loading">The first edition is on its way.</p>;
  return <EditionView edition={edition} archive={archive} isLatest />;
}
