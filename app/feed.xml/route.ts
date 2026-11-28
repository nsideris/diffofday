import { recentEditions } from '@/lib/editions';
import type { Edition } from '@/lib/types';

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
    const list = editionHtml(ed);
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

function editionHtml(ed: Edition) {
  const href = (u: string) => (/^https?:\/\//i.test(u) ? xml(u) : '#');
  const li = (title: string, u: string, text?: string) => `<li><a href="${href(u)}">${xml(title)}</a>${text ? `<br>${xml(text)}` : ''}</li>`;
  const parts = [`<h2>Top stories</h2><ol>${ed.top.map((s) => li(s.h, s.u, s.summary)).join('')}</ol>`];
  if (ed.ideas?.length) {
    parts.push(`<h2>Ideas to try</h2><ol>${ed.ideas.map((x, i) => li(x.title, `${SITE}/ideas/${ed.edition}/${i + 1}/spec.md`, x.why)).join('')}</ol>`);
  }
  if (ed.bigco?.length) {
    parts.push(`<h2>From the big ones</h2><ol>${ed.bigco.map((p, i) => li(`${p.company}: ${p.title}`, `${SITE}/playbook/${ed.edition}/${i + 1}/spec.md`, p.small)).join('')}</ol>`);
  }
  if (ed.mustread.length) parts.push(`<h2>Must read</h2><ul>${ed.mustread.map((m) => li(m.t, m.u, m.why)).join('')}</ul>`);
  return parts.join('');
}
