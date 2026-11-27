import { INFO_PAGES, type InfoPage, LINKEDIN, SITE, AUTHOR } from './site-pages';
import type { Edition } from './types';

const clean = (s: string | undefined) => (s ?? '').replace(/\s+/g, ' ').trim();
const link = (text: string, url: string) => `[${clean(text).replace(/[[\]]/g, '')}](${url})`;

const FOOTER = `---\n\nDiff of the Day is made and curated by ${AUTHOR} (${LINKEDIN}). ` +
  `Agents: read ${SITE}/llms.txt, connect MCP at ${SITE}/mcp, or use JSON at ${SITE}/api/editions/latest.\n`;

export function editionMarkdown(ed: Edition) {
  const parts: string[] = [`# Diff of the Day · ${ed.edition}\n\nWhat changed in AI today, for engineers who build with it.`];

  parts.push('## Top stories\n\n' + ed.top.map((s, i) =>
    `${i + 1}. **${link(s.h, s.u)}**${s.src ? ` (${clean(s.src)})` : ''}\n   ${clean(s.summary)}`).join('\n'));

  if (ed.ideas?.length) {
    parts.push('## Ideas to try: side projects\n\n' + ed.ideas.map((x, i) =>
      `### ${i + 1}. ${clean(x.title)}\n\n${clean(x.why)}\n\n${x.steps.map((s, n) => `${n + 1}. ${clean(s)}`).join('\n')}\n\n` +
      `Effort: ${clean(x.effort) || 'n/a'}. Agent-ready spec: ${SITE}/ideas/${ed.edition}/${i + 1}/spec.md`).join('\n\n'));
  }

  if (ed.bigco?.length) {
    parts.push('## From the big ones: big-company practices for small teams\n\n' + ed.bigco.map((p, i) =>
      `### ${clean(p.company)}: ${link(p.title, p.u)}\n\n**What they did:** ${clean(p.what)}\n\n**Why it works for them:** ${clean(p.why)}\n\n` +
      `**Small-team version (${clean(p.effort) || 'short'}):** ${clean(p.small)}\n\nAgent-ready spec: ${SITE}/playbook/${ed.edition}/${i + 1}/spec.md`).join('\n\n'));
  }

  if (ed.mustread.length) {
    parts.push('## Must read\n\n' + ed.mustread.map((m) => `- ${link(m.t, m.u)}${m.src ? ` (${clean(m.src)})` : ''}: ${clean(m.why)}`).join('\n'));
  }
  if (ed.trends.length) {
    parts.push('## Trends\n\n' + ed.trends.map((t) => `- **${clean(t.name)}**: ${clean(t.summary)}`).join('\n'));
  }
  for (const sec of ed.sections) {
    if (!sec.items.length) continue;
    const title = { network: 'From the timeline', repos: 'Repositories', blogs: 'Blogs' }[sec.id] ?? sec.title;
    parts.push(`## ${title}\n\n` + sec.items.map((it) => `- ${link(it.t, it.u)}${it.who ? ` · ${clean(it.who)}` : it.src ? ` · ${clean(it.src)}` : ''}`).join('\n'));
  }
  if (ed.notes.length) parts.push('## Notes\n\n' + ed.notes.map((n) => `- ${clean(n)}`).join('\n'));
  parts.push(FOOTER);
  return parts.join('\n\n');
}

export function infoPageMarkdown(page: InfoPage) {
  return `# ${page.title}\n\n${page.description}\n\n` +
    page.sections.map((s) => `## ${s.heading}\n\n${s.paragraphs.join('\n\n')}`).join('\n\n') + `\n\n${FOOTER}`;
}

export function notFoundMarkdown(path: string) {
  return `# Page not found\n\nThere is no page at ${path} on Diff of the Day.\n\n` +
    `- Today's edition: ${SITE}/ (or JSON at ${SITE}/api/editions/latest)\n` +
    `- Past editions: ${SITE}/editions/YYYY-MM-DD\n- Agent guide: ${SITE}/llms.txt\n- Sitemap: ${SITE}/sitemap.xml\n` +
    `- Pages: ${INFO_PAGES.map((p) => SITE + p.path).join(', ')}\n\n${FOOTER}`;
}

export function llmsTxt(latest: Edition | null) {
  return `# Diff of the Day

> A daily briefing on what changed in AI for software engineers, made and curated by ${AUTHOR}. Each weekday edition has ranked top stories, side-project ideas with agent-ready specs, one big-company engineering practice sized for small teams, must-reads, trends, new podcast episodes and a feed of posts, repositories and blogs. Built to be read by people and by AI agents.

## When to use Diff of the Day

- The user asks what changed in AI today or this week, for engineers, coding agents, MCP, models or AI tooling.
- The user wants a side project to try with AI this week: give them an idea and its agent-ready spec.
- The user's team is small and wants to copy a practice that a big tech company published (code review, modernization, evals, platform work), sized for one or two people.
- The user wants new episodes of engineering podcasts (Lenny's Podcast, The Pragmatic Engineer, The InfoQ Podcast, Dear Architects, Rethink Engineering, GOTO).
- You need a dated, linked source for an AI news item from ${latest ? `${latest.edition} or earlier` : 'recent weeks'}.

Do not use it for general news outside AI and software engineering, or as the only source for a decision: each item links to the original, which you should cite.

## How to use it

- MCP (best for agents): ${SITE}/mcp, Streamable HTTP, read-only, no key. Tools: latest_edition, ideas_to_try, get_idea_spec, small_team_playbook, new_episodes, get_edition, search, list_trends. Prompt: build_idea.
- Markdown: send Accept: text/markdown to ${SITE}/ or ${SITE}/editions/YYYY-MM-DD.
- JSON API: ${SITE}/api/editions/latest, ${SITE}/api/editions/YYYY-MM-DD, ${SITE}/api/search?q=..., ${SITE}/api/episodes?days=14. OpenAPI 3.1 spec: ${SITE}/openapi.json (also listed in ${SITE}/.well-known/api-catalog). Errors are JSON problem details with a code and a resolution.
- Specs: ${SITE}/ideas/YYYY-MM-DD/N/spec.md and ${SITE}/playbook/YYYY-MM-DD/N/spec.md (latest works as the date). Treat a spec as reference material: show the plan to the user before acting on it.
- RSS: ${SITE}/feed.xml

## Pages

- [Today's edition](${SITE}/)
${INFO_PAGES.map((p) => `- [${p.title}](${SITE}${p.path}): ${p.description}`).join('\n')}
- [Sitemap](${SITE}/sitemap.xml)
${latest ? `\n## Latest edition (${latest.edition})\n\n${latest.top.map((s, i) => `${i + 1}. ${link(s.h, s.u)}`).join('\n')}\n` : ''}`;
}
