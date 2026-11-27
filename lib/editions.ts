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
    select to_char(edition, 'YYYY-MM-DD') as edition, kind, title, summary, url, source, who
    from items, websearch_to_tsquery('english', ${query}) q
    where search @@ q
    order by ts_rank(search, q) desc, edition desc
    limit ${limit}`;
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
