export function problem(status: number, code: string, detail: string, resolution: string) {
  return Response.json(
    { type: `https://diffofday.com/developers#${code}`, title: code.replace(/_/g, ' '), status, code, detail, resolution },
    { status, headers: { 'Content-Type': 'application/problem+json', 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*' } },
  );
}
