import { readFileSync, writeFileSync } from 'node:fs';
import type { Edition, PriorArt } from '../lib/types.ts';

const file = process.argv[2];
if (!file) throw new Error('usage: npm run prior-art -- <edition.json>');
const headers: Record<string, string> = { Accept: 'application/vnd.github+json', 'User-Agent': 'diffofday-prior-art' };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

async function searchRepos(query: string): Promise<PriorArt[]> {
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(`${query} in:name,description fork:false`)}&per_page=5`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`GitHub search failed for "${query}": ${res.status}`);
  const body = (await res.json()) as { items: { full_name: string; html_url: string; stargazers_count: number; pushed_at: string; description: string | null }[] };
  return body.items.map((r) => ({
    repo: r.full_name,
    url: r.html_url,
    stars: r.stargazers_count,
    updated: r.pushed_at.slice(0, 10),
    ...(r.description ? { description: r.description.replace(/\s+/g, ' ').slice(0, 140) } : {}),
  }));
}

const ed = JSON.parse(readFileSync(file, 'utf8')) as Edition;
for (const idea of ed.ideas ?? []) {
  if (!idea.search?.length) continue;
  const found = new Map<string, PriorArt>();
  for (const query of idea.search) {
    for (const repo of await searchRepos(query)) if (!found.has(repo.repo)) found.set(repo.repo, repo);
    await new Promise((r) => setTimeout(r, 7000));
  }
  const exclude = new Set((idea as { priorArtExclude?: string[] }).priorArtExclude ?? []);
  delete (idea as { priorArtExclude?: string[] }).priorArtExclude;
  idea.priorArt = [...found.values()].filter((p) => !exclude.has(p.repo)).sort((a, b) => b.stars - a.stars).slice(0, 4);
  console.log(`${idea.title.slice(0, 50)}: ${idea.priorArt.map((p) => `${p.repo} (${p.stars})`).join(', ') || 'nothing found'}`);
}
writeFileSync(file, JSON.stringify(ed, null, 1) + '\n', 'utf8');
