import type { MetadataRoute } from 'next';
import { recentEditions } from '@/lib/editions';
import { INFO_PAGES, SITE } from '@/lib/site-pages';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const editions = await recentEditions(1000).catch(() => []);
  const latest = editions[0]?.updated ?? new Date().toISOString();
  return [
    { url: `${SITE}/`, lastModified: latest, changeFrequency: 'daily', priority: 1 },
    ...INFO_PAGES.map((p) => ({ url: `${SITE}${p.path}`, lastModified: latest, changeFrequency: 'monthly' as const, priority: 0.5 })),
    { url: `${SITE}/archive`, lastModified: latest, changeFrequency: 'daily', priority: 0.6 },
    { url: `${SITE}/llms.txt`, lastModified: latest, changeFrequency: 'daily', priority: 0.6 },
    ...editions.flatMap((e) => [
      { url: `${SITE}/editions/${e.edition}`, lastModified: e.updated, changeFrequency: 'never' as const, priority: 0.7 },
      ...(e.ideas ?? []).map((_, i) => ({ url: `${SITE}/ideas/${e.edition}/${i + 1}/spec.md`, lastModified: e.updated, changeFrequency: 'never' as const, priority: 0.4 })),
      ...(e.bigco ?? []).map((_, i) => ({ url: `${SITE}/playbook/${e.edition}/${i + 1}/spec.md`, lastModified: e.updated, changeFrequency: 'never' as const, priority: 0.4 })),
    ]),
  ];
}
