import type { NextConfig } from 'next';

const cached = [{ key: 'Cache-Control', value: 'public, s-maxage=300, stale-while-revalidate=86400' }];
const security = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
];

const config: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: '/:path*', headers: security },
      { source: '/', headers: [...cached, { key: 'Vary', value: 'Accept' }] },
      { source: '/editions/:date', headers: [...cached, { key: 'Vary', value: 'Accept' }] },
      { source: '/:page(about|privacy|contact|developers)', headers: [{ key: 'Vary', value: 'Accept' }] },
      { source: '/feed.xml', headers: cached },
      { source: '/api/:path*', headers: [...cached, { key: 'Access-Control-Allow-Origin', value: '*' }] },
    ];
  },
};

export default config;
