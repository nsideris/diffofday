import { INFO_PAGES } from '@/lib/site-pages';

export default function NotFound() {
  return (
    <main className="wrap info">
      <h1>Page not found</h1>
      <p className="lede">There is no page at this address on Diff of the Day.</p>
      <h2>Where to go instead</h2>
      <ul>
        <li><a href="/">Today&apos;s edition</a> (or JSON at <a href="/api/editions/latest">/api/editions/latest</a>)</li>
        <li>Past editions: /editions/YYYY-MM-DD</li>
        <li><a href="/llms.txt">Agent guide (llms.txt)</a> and <a href="/sitemap.xml">sitemap</a></li>
        {INFO_PAGES.map((p) => <li key={p.path}><a href={p.path}>{p.title}</a></li>)}
      </ul>
    </main>
  );
}
