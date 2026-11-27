export const SITE = 'https://diffofday.com';
export const LINKEDIN = 'https://www.linkedin.com/in/nsideris/';
export const AUTHOR = 'Nikos Sideris';

export interface InfoPage { path: string; title: string; description: string; sections: { heading: string; paragraphs: string[] }[] }

export const INFO_PAGES: InfoPage[] = [
  {
    path: '/about',
    title: 'About Diff of the Day',
    description: 'What Diff of the Day is, who makes it and how each edition is written.',
    sections: [
      { heading: 'What it is', paragraphs: [
        'Diff of the Day is a daily briefing on what changed in AI for software engineers. Each weekday edition ranks the top stories by how much engineers are discussing them, turns the reading into side projects with agent-ready specs, sizes one big-company engineering practice for small teams, and collects the posts, repositories, blogs and podcast episodes worth your time.',
        'It is built for people and for AI agents. Every edition is available as a web page, as Markdown, as JSON, as RSS and through a public, read-only MCP server.',
      ] },
      { heading: 'Who makes it', paragraphs: [
        `Diff of the Day is made and curated by ${AUTHOR}, a software engineer who builds with AI agents every day. Follow him on LinkedIn for more: ${LINKEDIN}.`,
      ] },
      { heading: 'How it is written', paragraphs: [
        'An AI agent (Claude) reads the sources every weekday morning: top news on X, the most discussed AI posts on LinkedIn, engineering blogs and AI labs, GitHub Trending, Hacker News and selected podcasts. It ranks them and writes the summaries, ideas and specs in its own words, and every item links to the original source. The curator reviews each edition before it is published.',
        'Summaries can contain mistakes. Follow the links to the original before you rely on a detail.',
      ] },
    ],
  },
  {
    path: '/privacy',
    title: 'Privacy',
    description: 'What Diff of the Day collects about readers and agents, and what it does not.',
    sections: [
      { heading: 'No cookies, no accounts', paragraphs: [
        'Diff of the Day does not set cookies, does not ask you to sign in and does not collect names, email addresses or other personal data. The only data stored in your browser is your choice of grouping in the feed (by topic or by source), kept in local storage on your own device.',
      ] },
      { heading: 'Analytics', paragraphs: [
        'Page visits are counted with Vercel Web Analytics, which works without cookies and does not store personal data. It reports totals such as page views, referring sites, countries and device types.',
      ] },
      { heading: 'MCP and API use', paragraphs: [
        'For the MCP server, Diff of the Day stores one counter per tool per day (for example, ideas_to_try was called 12 times today). It does not store IP addresses, client names, prompts or any other information about who called. The JSON API, RSS feed and spec files are not logged beyond the standard request logs of the hosting provider, Vercel, which keeps them for a short period.',
      ] },
      { heading: 'Questions', paragraphs: [
        `For any question about privacy, contact ${AUTHOR} on LinkedIn: ${LINKEDIN}.`,
      ] },
    ],
  },
  {
    path: '/contact',
    title: 'Contact',
    description: 'How to reach the curator of Diff of the Day with feedback, corrections or ideas.',
    sections: [
      { heading: 'Get in touch', paragraphs: [
        `Diff of the Day is made and curated by ${AUTHOR}. The best way to reach him is a message on LinkedIn: ${LINKEDIN}.`,
        'Corrections are welcome: if a summary gets a fact wrong, send the edition date, the story and the correct fact with a link to the source, and the edition will be fixed.',
      ] },
      { heading: 'Suggestions', paragraphs: [
        'Suggest sources, podcasts or big-company engineering posts that belong in the edition, or tell us which MCP tools or API fields your agents need. Feedback from people who build with agents shapes what comes next.',
      ] },
    ],
  },
  {
    path: '/developers',
    title: 'Diff of the Day for developers and agents',
    description: 'The Diff of the Day API, MCP server, spec files, RSS feed and Markdown pages, with examples.',
    sections: [
      { heading: 'MCP server', paragraphs: [
        `Connect any MCP client to ${SITE}/mcp (Streamable HTTP, no key, read-only). In Claude Code: claude mcp add --transport http diffofday ${SITE}/mcp`,
        'Tools: latest_edition, ideas_to_try, get_idea_spec (kind idea or playbook), small_team_playbook, new_episodes, get_edition, search, list_trends. Prompt: build_idea, which hands your agent the spec of a side project and asks it to plan before it builds.',
      ] },
      { heading: 'JSON API', paragraphs: [
        `GET ${SITE}/api/editions/latest returns today's edition. GET ${SITE}/api/editions/YYYY-MM-DD returns any past edition. GET ${SITE}/api/search?q=your+words returns matching stories and links. GET ${SITE}/api/episodes?days=14 returns new podcast episodes. All responses are JSON, allow any origin and need no key.`,
      ] },
      { heading: 'Specs, Markdown and feeds', paragraphs: [
        `Each side-project idea has an agent-ready spec at ${SITE}/ideas/YYYY-MM-DD/N/spec.md, and each big-company entry at ${SITE}/playbook/YYYY-MM-DD/N/spec.md (use latest for today). Every page answers with Markdown when you send Accept: text/markdown. The RSS feed is ${SITE}/feed.xml, the agent guide is ${SITE}/llms.txt and the sitemap is ${SITE}/sitemap.xml.`,
        'Specs are reference material: review the plan before an agent acts on one.',
      ] },
    ],
  },
];

export function infoPage(path: string) {
  return INFO_PAGES.find((p) => p.path === path);
}
