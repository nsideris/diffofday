# Diff of the Day: design

Status: approved by the owner on 2026-11-27.

## Intent

Diff of the Day publishes a short daily briefing on what changed in AI for engineers. Readers use the web page, the RSS feed, a JSON API or an MCP server. The owner wants a brand that can grow: more readers, later subscribers and sponsors.

## Goals

- `diffofday.com` shows the latest edition and every past edition.
- `/feed.xml` gives the last 30 editions as RSS 2.0.
- `/api/editions/latest`, `/api/editions/<date>` and `/api/search?q=` return JSON.
- `/mcp` is a public, read-only MCP server.
- The repository holds code only. Editions live in Neon.

## Non-goals

- Sign-in, comments or a paid tier.
- Email to subscribers (a later step; Neon will hold the list).

## Anti-goals

- A write path that the public can reach.
- A database credential in the repository, in a page or in a log.
- Private content in an edition. Every edition passes the guard before it reaches Neon.

## Approaches

1. **Vercel and Neon (chosen).** One Next.js project serves the pages, the feed, the API and the MCP server. Neon holds the editions. Vercel's Hobby plan is for non-commercial use; the project moves to Pro before it earns money.
2. GitHub Pages and a build from Neon. Rejected: Pages cannot run the MCP server.
3. Cloudflare Workers and Neon. Not chosen: the owner prefers Vercel.

## Design

### Data (Neon, `db/schema.sql`)

- `editions(date, updated, payload jsonb, published_at)`: one row for each edition. `payload` is the full edition for rendering.
- `items(id, edition, kind, rank, title, summary, url, source, who, topic, search)`: one row for each story and link, with a full-text index for search.
- `trends(edition, rank, name, n, summary)`.
- Role `diffofday_reader` can only `SELECT`. The site uses this role (`DATABASE_URL` in Vercel).
- The owner role writes. Only the publish script uses it, on the owner's machine (`DATABASE_URL_WRITE`).

### Publish

1. The daily run writes the edition JSON to a private folder outside the repository.
2. `npm run publish -- <file>` runs the guard on the edition and stops if the guard finds a private word or a secret.
3. The script replaces the edition, its items and its trends in one transaction.

The guard reads its private words from `~/.config/diffofday/guard-patterns.txt`. That file is never in the repository.

### Serve (Vercel)

- All routes read from Neon at request time. Responses have `Cache-Control: s-maxage=300, stale-while-revalidate=86400`, so the Vercel CDN serves most requests.
- MCP tools: `latest_edition`, `get_edition(date)`, `search(query, limit)`, `list_trends(days)`. All tools are read-only.
- A Vercel Firewall rate limit protects `/mcp` and `/api`.

## Left to the builder

- Page styling.
- MCP tool output format (Markdown text plus the JSON).
