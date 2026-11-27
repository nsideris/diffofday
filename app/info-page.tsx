import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { infoPage, INFO_PAGES } from '@/lib/site-pages';

export function infoMetadata(path: string): Metadata {
  const page = infoPage(path);
  return page ? { title: `${page.title} · Diff of the Day`, description: page.description, alternates: { canonical: path } } : {};
}

function autolink(text: string) {
  return text.split(/(https:\/\/[^\s,;)]+[^\s,;.)])/g).map((part, i) =>
    /^https:\/\//.test(part) ? <a key={i} href={part}>{part}</a> : part);
}

export function InfoPageView({ path }: { path: string }) {
  const page = infoPage(path);
  if (!page) notFound();
  return (
    <>
      <header className="nameplate small"><div className="wrap">
        <p className="home"><a href="/">Diff of the <em>Day</em></a></p>
      </div></header>
      <main className="wrap info">
        <h1>{page.title}</h1>
        <p className="lede">{page.description}</p>
        {page.sections.map((s) => (
          <section key={s.heading}>
            <h2>{s.heading}</h2>
            {s.paragraphs.map((p) => <p key={p}>{autolink(p)}</p>)}
          </section>
        ))}
        <nav className="info-nav" aria-label="More pages">
          <a href="/">Today&apos;s edition</a>
          {INFO_PAGES.filter((p) => p.path !== path).map((p) => <a key={p.path} href={p.path}>{p.title}</a>)}
        </nav>
      </main>
    </>
  );
}
