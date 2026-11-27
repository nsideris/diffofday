import { latestEdition } from '@/lib/editions';
import { llmsTxt } from '@/lib/markdown';

export const dynamic = 'force-dynamic';

export async function GET() {
  const latest = await latestEdition().catch(() => null);
  return new Response(llmsTxt(latest), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400' },
  });
}
