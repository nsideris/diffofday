import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { editionDates, editionOn } from '@/lib/editions';
import { EditionView } from '../../edition-view';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ date: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { date } = await params;
  return {
    title: `Diff of the Day · ${date} · classic view`,
    alternates: { canonical: `/editions/${date}` },
    robots: { index: false, follow: true },
  };
}

export default async function ClassicEdition({ params }: Props) {
  const { date } = await params;
  const [edition, archive] = await Promise.all([editionOn(date), editionDates(1000)]);
  if (!edition) notFound();
  return <EditionView edition={edition} archive={archive} isLatest={archive[0] === date} />;
}
