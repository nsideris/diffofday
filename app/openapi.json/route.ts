import { OPENAPI } from '@/lib/openapi';

export function GET() {
  return Response.json(OPENAPI, { headers: { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, s-maxage=3600' } });
}
