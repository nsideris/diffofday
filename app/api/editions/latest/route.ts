import { latestEdition } from '@/lib/editions';

export const dynamic = 'force-dynamic';

export async function GET() {
  const edition = await latestEdition();
  return edition ? Response.json(edition) : Response.json({ error: 'no edition yet' }, { status: 404 });
}
