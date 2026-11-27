export const SPIKE_TOPIC = 'diffofday-spike';

export interface Try { repo: string; url: string; stars: number; owner: string }

export function ideaTopic(date: string, n: number) {
  return `diffofday-${date.replace(/-/g, '')}-${n}`;
}

export async function triesByTopic(): Promise<Map<string, Try[]>> {
  const tries = new Map<string, Try[]>();
  try {
    const res = await fetch(`https://api.github.com/search/repositories?q=topic:${SPIKE_TOPIC}&per_page=100`, {
      headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'diffofday-tried-by' },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return tries;
    const body = (await res.json()) as { items: { full_name: string; html_url: string; stargazers_count: number; topics?: string[]; owner: { login: string } }[] };
    for (const r of body.items) {
      for (const topic of r.topics ?? []) {
        if (!/^diffofday-\d{8}-\d{1,2}$/.test(topic)) continue;
        const list = tries.get(topic) ?? [];
        list.push({ repo: r.full_name, url: r.html_url, stars: r.stargazers_count, owner: r.owner.login });
        tries.set(topic, list);
      }
    }
  } catch { /* GitHub unreachable: show no tries */ }
  return tries;
}
