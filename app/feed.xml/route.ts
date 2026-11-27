import { recentEditions } from '@/lib/editions';

export const dynamic = 'force-dynamic';

const SITE = 'https://diffofday.com';

function xml(text: string) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export async function GET() {
  const editions = await recentEditions(30);
  const items = editions.map((ed) => {
    const url = `${SITE}/editions/${ed.edition}`;
    const lead = ed.top[0]?.h ?? ed.edition;
    const list = `<ul>${ed.top.map((s) => `<li><a href="${xml(s.u)}">${xml(s.h)}</a></li>`).join('')}</ul>`;
    return `<item><title>${xml(`${ed.edition}: ${lead}`)}</title><link>${url}</link>` +
      `<guid isPermaLink="true">${url}</guid><pubDate>${new Date(ed.updated).toUTCString()}</pubDate>` +
      `<description>${xml(list)}</description></item>`;
  });
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel>` +
    `<title>Diff of the Day</title><link>${SITE}/</link>` +
    `<description>What changed in AI today, for engineers who build with it.</description>` +
    `<language>en</language>${items.join('')}</channel></rss>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
