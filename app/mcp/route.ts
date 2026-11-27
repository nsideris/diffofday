import { createMcpHandler } from 'mcp-handler';
import { z } from 'zod';
import { countToolCall, editionOn, latestEdition, search, trendsSince } from '@/lib/editions';
import { findIdea, specText } from '@/lib/specs';
import type { Edition } from '@/lib/types';

function asMarkdown(ed: Edition) {
  const top = ed.top.map((s, i) => `${i + 1}. [${s.h}](${s.u})${s.summary ? `\n   ${s.summary}` : ''}`).join('\n');
  const trends = ed.trends.map((t) => `- **${t.name}**: ${t.summary}`).join('\n');
  const must = ed.mustread.map((m) => `- [${m.t}](${m.u})${m.why ? `: ${m.why}` : ''}`).join('\n');
  const ideas = (ed.ideas ?? []).map((x) =>
    `- **${x.title}** (${x.effort ?? 'side project'}): ${x.why}\n${x.steps.map((s, i) => `   ${i + 1}. ${s}`).join('\n')}`).join('\n');
  return `# Diff of the Day · ${ed.edition}\n\n## Top stories\n${top}\n\n` +
    (ideas ? `## Ideas to try\n${ideas}\n\n` : '') +
    `## Must read\n${must}\n\n## Trends\n${trends}\n`;
}

function text(value: string) {
  return { content: [{ type: 'text' as const, text: value }] };
}

const handler = createMcpHandler(
  (server) => {
    const register = server.registerTool.bind(server);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    server.registerTool = ((name: string, config: any, callback: any) =>
      register(name, config, async (...args: unknown[]) => {
        await countToolCall(name);
        return callback(...args);
      })) as typeof server.registerTool;

    server.registerTool(
      'get_idea_spec',
      {
        title: 'Agent-ready spec for an idea',
        description: 'The full build spec (problem, goals, non-goals, requirements with acceptance criteria, agent instructions) for one Diff of the Day idea. Defaults to today and idea 1.',
        inputSchema: z.object({
          date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe('Date as YYYY-MM-DD; omit for today'),
          n: z.number().int().min(1).max(20).default(1).describe('Idea number on that day, starting at 1'),
        }),
        annotations: { readOnlyHint: true },
      },
      async ({ date, n }) => {
        const found = await findIdea(date, n);
        return text(found ? specText(found.edition, found.idea, n) : `No idea ${n} for ${date ?? 'today'}.`);
      },
    );

    server.registerPrompt(
      'build_idea',
      {
        title: 'Build a Diff of the Day idea',
        description: "Start building one of the day's side-project ideas from its agent-ready spec.",
        argsSchema: z.object({
          n: z.string().regex(/^\d{1,2}$/).optional().describe('Idea number, default 1'),
          date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe('Date as YYYY-MM-DD, default today'),
        }),
      },
      async ({ n, date }) => {
        await countToolCall('build_idea_prompt');
        const index = Number(n ?? '1');
        const found = await findIdea(date, index);
        const body = found
          ? `Build this side project from its spec. Work in a new folder. Start with the P0 requirements, ` +
            `write tests for each acceptance criterion, follow the Safety rules, and ask me before any step ` +
            `that needs a key, money or network access the spec does not name.\n\n${specText(found.edition, found.idea, index)}`
          : `There is no Diff of the Day idea ${index} for ${date ?? 'today'}. Call the ideas_to_try tool and ask me which one to build.`;
        return { messages: [{ role: 'user' as const, content: { type: 'text' as const, text: body } }] };
      },
    );

    server.registerTool(
      'latest_edition',
      {
        title: 'Latest edition',
        description: "Today's Diff of the Day: top AI stories for engineers, must-reads and trends, with links.",
        inputSchema: z.object({}),
        annotations: { readOnlyHint: true },
      },
      async () => {
        const ed = await latestEdition();
        return text(ed ? asMarkdown(ed) : 'No edition has been published yet.');
      },
    );

    server.registerTool(
      'get_edition',
      {
        title: 'Edition by date',
        description: 'The Diff of the Day edition for one date.',
        inputSchema: z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Date as YYYY-MM-DD') }),
        annotations: { readOnlyHint: true },
      },
      async ({ date }) => {
        const ed = await editionOn(date);
        return text(ed ? asMarkdown(ed) : `No edition for ${date}.`);
      },
    );

    server.registerTool(
      'ideas_to_try',
      {
        title: 'Ideas to try',
        description: 'Side-project ideas built from a Diff of the Day edition: why each matters, concrete steps, effort and sources. Defaults to today.',
        inputSchema: z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe('Date as YYYY-MM-DD; omit for today') }),
        annotations: { readOnlyHint: true },
      },
      async ({ date }) => {
        const ed = date ? await editionOn(date) : await latestEdition();
        if (!ed?.ideas?.length) return text(`No ideas for ${date ?? 'today'} yet.`);
        return text(`# Ideas to try · ${ed.edition}\n\n` + ed.ideas.map((x, n) =>
          `## ${n + 1}. ${x.title}\n*${[x.angle, x.effort].filter(Boolean).join(' · ')}*\n\n${x.why}\n\n` +
          x.steps.map((s, i) => `${i + 1}. ${s}`).join('\n') +
          `\n\nSources: ${x.sources.map((s) => `[${s.t}](${s.u})`).join(', ')}`).join('\n\n'));
      },
    );

    server.registerTool(
      'search',
      {
        title: 'Search stories',
        description: 'Full-text search across every Diff of the Day story and link.',
        inputSchema: z.object({
          query: z.string().min(2).max(200),
          limit: z.number().int().min(1).max(50).default(10),
        }),
        annotations: { readOnlyHint: true },
      },
      async ({ query, limit }) => {
        const hits = await search(query, limit);
        if (!hits.length) return text(`No stories match "${query}".`);
        return text(hits.map((h) => `- ${h.edition} [${h.title}](${h.url})${h.summary ? `: ${h.summary}` : ''}`).join('\n'));
      },
    );

    server.registerTool(
      'list_trends',
      {
        title: 'Recent trends',
        description: 'The trend lines from recent editions.',
        inputSchema: z.object({ days: z.number().int().min(1).max(90).default(14) }),
        annotations: { readOnlyHint: true },
      },
      async ({ days }) => {
        const rows = await trendsSince(days);
        if (!rows.length) return text('No trends in that period.');
        return text(rows.map((t) => `- ${t.edition} **${t.name}**: ${t.summary}`).join('\n'));
      },
    );
  },
  { serverInfo: { name: 'diffofday', version: '1.0.0' } },
);

export { handler as GET, handler as POST, handler as DELETE };
