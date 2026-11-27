import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { editionDates, editionOn } from '@/lib/editions';
import { EditionView } from '../../edition-view';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ date: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { date } = await params;
  return { title: `Diff of the Day · ${date}` };
}

export default async function EditionPage({ params }: Props) {
  const { date } = await params;
  const [edition, archive] = await Promise.all([editionOn(date), editionDates(14)]);
  if (!edition) notFound();
  return <EditionView edition={edition} archive={archive} />;
}
