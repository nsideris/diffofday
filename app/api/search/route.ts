import { search } from '@/lib/editions';
import { problem } from '@/lib/problem';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const q = (params.get('q') ?? '').trim().slice(0, 200);
  const limit = Math.min(Math.max(Number(params.get('limit')) || 20, 1), 50);
  if (q.length < 2) return problem(400, 'missing_query', 'The q parameter is required and needs at least 2 characters.', 'Call /api/search?q=mcp+quotas');
  return Response.json({ query: q, results: await search(q, limit) });
}
