import { editionOn, latestEdition } from '@/lib/editions';
import { editionMarkdown, infoPageMarkdown, notFoundMarkdown } from '@/lib/markdown';
import { infoPage } from '@/lib/site-pages';

export const dynamic = 'force-dynamic';

function markdown(body: string, status = 200) {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      Vary: 'Accept',
      'Cache-Control': status === 200 ? 'public, s-maxage=300, stale-while-revalidate=86400' : 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

export async function GET(_req: Request, { params }: { params: Promise<{ path?: string[] }> }) {
  const segments = (await params).path ?? [];
  const raw = `/${segments.join('/')}`.slice(0, 200).replace(/\/+$/, '') || '/';
  const path = raw.replace(/^\/classic(?=\/|$)/, '').replace(/^\/(\d{4}-\d{2}-\d{2})$/, '/editions/$1') || '/';

  if (path === '/') {
    const ed = await latestEdition();
    return ed ? markdown(editionMarkdown(ed)) : markdown('# Diff of the Day\n\nThe first edition is on its way.\n');
  }
  const edition = /^\/editions\/(\d{4}-\d{2}-\d{2})$/.exec(path);
  if (edition) {
    const ed = await editionOn(edition[1]);
    return ed ? markdown(editionMarkdown(ed)) : markdown(notFoundMarkdown(path), 404);
  }
  const page = infoPage(path);
  if (page) return markdown(infoPageMarkdown(page));
  return markdown(notFoundMarkdown(path.replace(/[^\w/.-]/g, '')), 404);
}
