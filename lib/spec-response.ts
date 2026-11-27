import { findSpec, type SpecKind } from './specs';

export async function specResponse(kind: SpecKind, date: string, n: string) {
  const index = Number(n);
  if (!Number.isInteger(index) || index < 1 || index > 20) return new Response('Not found\n', { status: 404 });
  const found = await findSpec(kind, date, index);
  if (!found) return new Response('Not found\n', { status: 404 });
  return new Response(found.spec, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `inline; filename="diffofday-${found.edition.edition}-${kind}-${index}.md"`,
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400',
      'Access-Control-Allow-Origin': '*',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
