import { editionOn } from '@/lib/editions';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ date: string }> }) {
  const edition = await editionOn((await params).date);
  return edition ? Response.json(edition) : Response.json({ error: 'not found' }, { status: 404 });
}
