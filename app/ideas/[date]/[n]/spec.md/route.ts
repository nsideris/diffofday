import { findIdea, specText } from '@/lib/specs';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ date: string; n: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { date, n } = await params;
  const index = Number(n);
  if (!Number.isInteger(index) || index < 1 || index > 20) return new Response('Not found\n', { status: 404 });
  const found = await findIdea(date, index);
  if (!found) return new Response('Not found\n', { status: 404 });
  return new Response(specText(found.edition, found.idea, index), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `inline; filename="diffofday-${found.edition.edition}-idea-${index}.md"`,
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
