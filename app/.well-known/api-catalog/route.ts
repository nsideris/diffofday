const SITE = 'https://diffofday.com';

export function GET() {
  const linkset = {
    linkset: [
      {
        anchor: `${SITE}/api`,
        'service-desc': [{ href: `${SITE}/openapi.json`, type: 'application/openapi+json' }],
        'service-doc': [{ href: `${SITE}/developers`, type: 'text/html' }],
        'service-meta': [{ href: `${SITE}/llms.txt`, type: 'text/plain' }],
      },
      {
        anchor: `${SITE}/mcp`,
        'service-doc': [{ href: `${SITE}/developers`, type: 'text/html' }],
      },
    ],
  };
  return Response.json(linkset, {
    headers: { 'Content-Type': 'application/linkset+json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, s-maxage=3600' },
  });
}
