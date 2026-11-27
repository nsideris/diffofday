import { LINKEDIN, SITE, AUTHOR } from '@/lib/site-pages';
import type { Edition } from '@/lib/types';

const PERSON = { '@type': 'Person', '@id': `${SITE}/#author`, name: AUTHOR, url: LINKEDIN, sameAs: [LINKEDIN] };
const PUBLISHER = {
  '@type': 'Organization',
  '@id': `${SITE}/#publisher`,
  name: 'Diff of the Day',
  url: `${SITE}/`,
  logo: `${SITE}/icon.svg`,
  founder: { '@id': `${SITE}/#author` },
  sameAs: [LINKEDIN, 'https://github.com/nsideris/diffofday'],
  contactPoint: { '@type': 'ContactPoint', contactType: 'editorial', url: `${SITE}/contact` },
};

export function siteGraph(edition?: Edition | null, path = '/') {
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'WebSite',
      '@id': `${SITE}/#website`,
      name: 'Diff of the Day',
      url: `${SITE}/`,
      description: 'What changed in AI today, for engineers who build with it.',
      inLanguage: 'en',
      publisher: { '@id': `${SITE}/#publisher` },
      potentialAction: { '@type': 'SearchAction', target: `${SITE}/api/search?q={query}`, 'query-input': 'required name=query' },
    },
    PUBLISHER,
    PERSON,
  ];
  if (edition) {
    graph.push({
      '@type': 'NewsArticle',
      '@id': `${SITE}${path}#edition`,
      headline: `Diff of the Day · ${edition.edition}: ${edition.top[0]?.h ?? ''}`.slice(0, 110),
      datePublished: edition.updated,
      dateModified: edition.updated,
      author: { '@id': `${SITE}/#author` },
      publisher: { '@id': `${SITE}/#publisher` },
      isPartOf: { '@id': `${SITE}/#website` },
      mainEntityOfPage: `${SITE}${path}`,
      image: `${SITE}/opengraph-image`,
      about: edition.top.slice(0, 7).map((s) => ({ '@type': 'CreativeWork', name: s.h, url: s.u })),
    });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}

export function JsonLd({ data }: { data: unknown }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
