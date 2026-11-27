import { recentEpisodes } from '@/lib/podcasts';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const days = Math.min(Math.max(Number(new URL(req.url).searchParams.get('days')) || 14, 1), 60);
  return Response.json({ days, episodes: await recentEpisodes(days) });
}
