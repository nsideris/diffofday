import { problem } from '@/lib/problem';

const notFound = () => problem(404, 'endpoint_not_found', 'There is no API endpoint at this path.',
  'See https://diffofday.com/openapi.json for the list of endpoints, or use GET https://diffofday.com/api/editions/latest.');

export const GET = notFound;
export const POST = notFound;
export const PUT = notFound;
export const DELETE = notFound;
export const PATCH = notFound;
