import { search } from '@/lib/editions';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const q = (params.get('q') ?? '').trim().slice(0, 200);
  const limit = Math.min(Math.max(Number(params.get('limit')) || 20, 1), 50);
  if (!q) return Response.json({ error: 'q is required' }, { status: 400 });
  return Response.json({ query: q, results: await search(q, limit) });
}
