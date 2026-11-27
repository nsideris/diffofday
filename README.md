# Diff of the Day

What changed in AI today, for engineers who build with it.

Read it at [diffofday.com](https://diffofday.com), follow the [RSS feed](https://diffofday.com/feed.xml), or connect the MCP server at `https://diffofday.com/mcp`.

## How it works

- A Next.js app on Vercel. Editions live in Neon (Postgres); the repository holds code only.
- `npm run publish-edition -- <edition.json>` checks an edition with the guard and the spec check, then writes it to Neon.
- Routes: the page and `/editions/<date>`, `/feed.xml`, `/api/editions/latest`, `/api/editions/<date>`, `/api/search?q=`, `/api/episodes`, `/ideas/<date>/<n>/spec.md`, `/playbook/<date>/<n>/spec.md`, `/podcasts.opml` and `/mcp`.
- `scripts/guard.ts` stops a commit, a push or a publish that contains private words or secrets.

Summaries are written in our own words and link to the original source.

## Licence

MIT. See [LICENSE](LICENSE). The code is open; edition content (summaries, ideas, specs) stays © Nikos Sideris.
