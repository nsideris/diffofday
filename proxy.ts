import { NextResponse, type NextRequest } from 'next/server';

function wantsMarkdown(req: NextRequest) {
  const accept = req.headers.get('accept') ?? '';
  return /text\/markdown/i.test(accept) && !/text\/html/i.test(accept.split(',')[0] ?? '');
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (wantsMarkdown(req)) {
    const url = req.nextUrl.clone();
    url.pathname = `/api/markdown${pathname === '/' ? '' : pathname.slice(0, 200)}`;
    url.search = '';
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/|api/|mcp|feed\\.xml|llms\\.txt|sitemap\\.xml|robots\\.txt|podcasts\\.opml|ideas/|playbook/|icon|apple-icon|opengraph-image|favicon|openapi\.json|\.well-known/).*)'],
};
