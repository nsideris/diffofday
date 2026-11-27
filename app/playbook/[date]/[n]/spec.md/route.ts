import { specResponse } from '@/lib/spec-response';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ date: string; n: string }> }) {
  const { date, n } = await params;
  return specResponse('playbook', date, n);
}
