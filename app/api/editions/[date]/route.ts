import { editionOn } from '@/lib/editions';
import { problem } from '@/lib/problem';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return problem(400, 'invalid_date', `"${date.slice(0, 40)}" is not a date in YYYY-MM-DD format.`, 'Use a date such as 2026-11-27, or call /api/editions/latest.');
  }
  const edition = await editionOn(date);
  return edition ? Response.json(edition)
    : problem(404, 'edition_not_found', `There is no edition for ${date}.`, 'Editions are published on weekdays. Call /api/editions/latest for the newest one.');
}
