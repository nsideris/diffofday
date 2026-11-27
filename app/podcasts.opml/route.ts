import { SHOWS } from '@/lib/podcasts';

function xml(text: string) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function GET() {
  const outlines = SHOWS.map((s) => `    <outline type="rss" text="${xml(s.name)}" title="${xml(s.name)}" xmlUrl="${xml(s.feed)}"/>`).join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<opml version="2.0">\n  <head><title>Diff of the Day podcasts</title></head>\n  <body>\n${outlines}\n  </body>\n</opml>\n`;
  return new Response(body, {
    headers: {
      'Content-Type': 'text/x-opml; charset=utf-8',
      'Content-Disposition': 'attachment; filename="diffofday-podcasts.opml"',
    },
  });
}
