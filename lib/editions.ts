import { neon } from '@neondatabase/serverless';
import type { Edition, SearchHit, Trend } from './types';

function sql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return neon(url);
}

export async function latestEdition(): Promise<Edition | null> {
  const rows = await sql()`select payload from editions order by date desc limit 1`;
  return (rows[0]?.payload as Edition) ?? null;
}

export async function editionOn(date: string): Promise<Edition | null> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const rows = await sql()`select payload from editions where date = ${date}`;
  return (rows[0]?.payload as Edition) ?? null;
}

export async function recentEditions(limit: number): Promise<Edition[]> {
  const rows = await sql()`select payload from editions order by date desc limit ${limit}`;
  return rows.map((r) => r.payload as Edition);
}

export async function editionDates(limit: number): Promise<string[]> {
  const rows = await sql()`select to_char(date, 'YYYY-MM-DD') as d from editions order by date desc limit ${limit}`;
  return rows.map((r) => r.d as string);
}

export async function search(query: string, limit: number): Promise<SearchHit[]> {
  const rows = await sql()`
    with q as (select websearch_to_tsquery('english', ${query}) as q),
    specs as (
      select e.date, 'idea' as kind, 'ideas' as path, n, x->>'title' as title, x->>'why' as summary, x->>'angle' as source,
        setweight(to_tsvector('english', coalesce(x->>'title', '')), 'A') ||
        setweight(to_tsvector('english', coalesce(x->>'why', '') || ' ' || coalesce(x->>'angle', '') || ' ' || coalesce(x->'steps', '[]')::text), 'B') ||
        setweight(to_tsvector('english', coalesce(x->>'spec', '')), 'D') as search
      from editions e cross join lateral jsonb_array_elements(coalesce(e.payload->'ideas', '[]')) with ordinality as t(x, n)
      union all
      select e.date, 'playbook', 'playbook', n, x->>'title', x->>'small', x->>'company',
        setweight(to_tsvector('english', coalesce(x->>'title', '') || ' ' || coalesce(x->>'company', '')), 'A') ||
        setweight(to_tsvector('english', coalesce(x->>'what', '') || ' ' || coalesce(x->>'why', '') || ' ' || coalesce(x->>'small', '') || ' ' || coalesce(x->'steps', '[]')::text), 'B') ||
        setweight(to_tsvector('english', coalesce(x->>'spec', '')), 'D')
      from editions e cross join lateral jsonb_array_elements(coalesce(e.payload->'bigco', '[]')) with ordinality as t(x, n)
    ),
    hits as (
      select edition, kind, title, summary, url, source, who, ts_rank(search, q.q) as r from items, q where search @@ q.q
      union all
      select date, kind, title, summary, 'https://diffofday.com/' || path || '/' || to_char(date, 'YYYY-MM-DD') || '/' || n || '/spec.md', source, null,
        ts_rank(search, q.q)
      from specs, q where search @@ q.q
    )
    select to_char(edition, 'YYYY-MM-DD') as edition, kind, title, summary, url, source, who
    from hits order by r desc, edition desc limit ${limit}`;
  return rows as SearchHit[];
}

export async function countToolCall(tool: string): Promise<void> {
  try {
    await sql()`
      insert into mcp_calls (day, tool, calls) values (current_date, ${tool}, 1)
      on conflict (day, tool) do update set calls = mcp_calls.calls + 1`;
  } catch (error) {
    console.error('mcp_calls count failed', (error as Error).message);
  }
}

export async function trendsSince(days: number): Promise<(Trend & { edition: string })[]> {
  const rows = await sql()`
    select to_char(edition, 'YYYY-MM-DD') as edition, name, n, summary
    from trends where edition >= current_date - ${days}::int
    order by edition desc, rank`;
  return rows as (Trend & { edition: string })[];
}
