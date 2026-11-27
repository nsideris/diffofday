import { latestEdition } from '@/lib/editions';
import { problem } from '@/lib/problem';

export const dynamic = 'force-dynamic';

export async function GET() {
  const edition = await latestEdition();
  return edition ? Response.json(edition)
    : problem(404, 'edition_not_found', 'No edition has been published yet.', 'Try again after the next weekday morning edition.');
}
