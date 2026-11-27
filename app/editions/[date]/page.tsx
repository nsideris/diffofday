import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { editionDates, editionOn } from '@/lib/editions';
import { EditionView } from '../../edition-view';
import { JsonLd, siteGraph } from '../../json-ld';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ date: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { date } = await params;
  return {
    title: `Diff of the Day · ${date}`,
    alternates: { canonical: `/editions/${date}` },
    openGraph: { type: 'article', url: `https://diffofday.com/editions/${date}` },
  };
}

export default async function EditionPage({ params }: Props) {
  const { date } = await params;
  const [edition, archive] = await Promise.all([editionOn(date), editionDates(1000)]);
  if (!edition) notFound();
  return (
    <>
      <JsonLd data={siteGraph(edition, `/editions/${date}`)} />
      <EditionView edition={edition} archive={archive} isLatest={archive[0] === date} />
    </>
  );
}
