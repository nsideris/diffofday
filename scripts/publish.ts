import { readFileSync } from 'node:fs';
import { Pool } from '@neondatabase/serverless';
import type { Edition } from '../lib/types.ts';
import { decodedStrings, findProblems } from './guard.ts';

const file = process.argv[2];
if (!file) throw new Error('usage: npm run publish-edition -- <edition.json>');
const url = process.env.DATABASE_URL_WRITE;
if (!url) throw new Error('Set DATABASE_URL_WRITE (owner role) in the environment first.');

const raw = readFileSync(file, 'utf8');
const ed = JSON.parse(raw) as Edition;
const problems = [...findProblems(raw), ...findProblems(decodedStrings(ed).join('\n'))];
if (problems.length) {
  console.log(`guard: blocked, nothing published\n  ${problems.join('\n  ')}`);
  process.exit(1);
}
if (!/^\d{4}-\d{2}-\d{2}$/.test(ed.edition)) throw new Error(`bad edition date: ${ed.edition}`);
if (!ed.top?.length) throw new Error('an edition needs at least one top story');
const httpsOnly = (u: string) => /^https:\/\//.test(u);

type Row = [string, string, string, number, string, string | null, string, string | null, string | null, string | null];
const items: Row[] = [
  ...ed.top.map((s, i): Row => [s.id, ed.edition, 'top', i + 1, s.h, s.summary ?? null, s.u, s.src ?? null, null, null]),
  ...ed.mustread.map((m, i): Row => [`${ed.edition}-m${i + 1}`, ed.edition, 'mustread', i + 1, m.t, m.why ?? null, m.u, m.src ?? null, null, null]),
  ...ed.sections.flatMap((sec) => sec.items.map((it, i): Row =>
    [`${ed.edition}-${sec.id}${i + 1}`, ed.edition, sec.id, i + 1, it.t, null, it.u, it.src ?? null, it.who ?? null, it.topic ?? null])),
];
const badUrl = items.find((r) => !httpsOnly(r[6]));
if (badUrl) throw new Error(`non-https link refused: ${badUrl[0]}`);

const pool = new Pool({ connectionString: url });
const client = await pool.connect();
try {
  await client.query('begin');
  await client.query('delete from editions where date = $1', [ed.edition]);
  await client.query('insert into editions (date, updated, payload) values ($1, $2, $3)', [ed.edition, ed.updated, ed]);
  for (const r of items) {
    await client.query(
      'insert into items (id, edition, kind, rank, title, summary, url, source, who, topic) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)', r);
  }
  for (const [i, t] of ed.trends.entries()) {
    await client.query('insert into trends (edition, rank, name, n, summary) values ($1,$2,$3,$4,$5)',
      [ed.edition, i + 1, t.name, t.n ?? null, t.summary]);
  }
  await client.query('commit');
  console.log(`published ${ed.edition}: ${ed.top.length} top stories, ${items.length} items, ${ed.trends.length} trends`);
} catch (error) {
  await client.query('rollback');
  throw error;
} finally {
  client.release();
  await pool.end();
}
