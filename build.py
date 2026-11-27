"""Build index.html, one page per edition, and feed.xml from editions/*.json."""
import json
from datetime import datetime
from email.utils import format_datetime
from html import escape
from pathlib import Path

SITE = "https://diffofday.com"
TITLE = "Diff of the Day"
TAGLINE = "What changed in AI today, for engineers who build with it."
FEED_SIZE = 30
ROOT = Path(__file__).parent

CSS = """
:root{--bg:#fbfaf7;--fg:#1d1d1b;--muted:#6b6a65;--line:#e4e1da;--accent:#0f7b5f;--add:#e6f4ec;--del:#fbeaea}
@media (prefers-color-scheme:dark){:root{--bg:#141413;--fg:#ecebe6;--muted:#9c9a92;--line:#2c2b28;--accent:#4cc39a;--add:#173327;--del:#3a1f1f}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:17px/1.6 Georgia,'Times New Roman',serif}
main{max-width:720px;margin:0 auto;padding:32px 16px 64px}
header .date{font:13px ui-monospace,Menlo,Consolas,monospace;color:var(--muted)}
h1{font-size:40px;margin:4px 0 0;letter-spacing:-.5px}h1 span{color:var(--accent);font-style:italic}
.tag{font:12px ui-monospace,Menlo,Consolas,monospace;text-transform:uppercase;letter-spacing:1px;color:var(--muted);border-bottom:2px solid var(--fg);padding-bottom:12px}
h2{font:600 12px ui-monospace,Menlo,Consolas,monospace;text-transform:uppercase;letter-spacing:1.5px;color:var(--accent);margin:36px 0 8px}
.story{border-top:1px solid var(--line);padding:16px 0}.story h3{font-size:22px;line-height:1.3;margin:0 0 6px}
.story h3 b{color:var(--accent);font-weight:400}a{color:inherit;text-decoration-color:var(--accent)}
.story p{margin:6px 0;color:var(--fg)}.meta{font:12px ui-monospace,Menlo,Consolas,monospace;color:var(--muted)}
ul{padding-left:18px}li{margin:6px 0}.trend{background:var(--add);padding:10px 14px;margin:8px 0;border-radius:4px}
.notes{background:var(--del);padding:10px 14px;border-radius:4px;font-size:15px}
footer{margin-top:48px;font:13px ui-monospace,Menlo,Consolas,monospace;color:var(--muted)}
"""


def load_editions():
    eds = [json.loads(p.read_text(encoding="utf-8")) for p in sorted((ROOT / "editions").glob("*.json"))]
    return sorted(eds, key=lambda e: e["edition"], reverse=True)


def long_date(ed):
    return datetime.fromisoformat(ed["edition"]).strftime("%A, %d %B %Y")


def link(text, url):
    return f'<a href="{escape(url)}">{escape(text)}</a>'


def render_page(ed, editions):
    parts = [f'<header><div class="date">{long_date(ed)}</div><h1>Diff of the <span>Day</span></h1>',
             f'<div class="tag">{escape(TAGLINE)}</div></header>', "<h2>Top stories</h2>"]
    for n, s in enumerate(ed["top"], 1):
        meta = " · ".join(x for x in (s.get("src"), s.get("when")) if x)
        if s.get("heat"):
            meta += f" · {s['heat']} {s.get('heatLabel', '')}".rstrip()
        more = f' · {link("discussion", s["more"])}' if s.get("more") else ""
        parts.append(f'<div class="story" id="{s["id"]}"><h3><b>{n}</b> {link(s["h"], s["u"])}</h3>'
                     f'<p>{escape(s.get("summary", ""))}</p><div class="meta">{escape(meta)}{more}</div></div>')
    if ed.get("mustread"):
        parts.append("<h2>Must read</h2><ul>")
        parts += [f'<li>{link(m["t"], m["u"])} <span class="meta">{escape(m.get("src", ""))}</span><br>'
                  f'{escape(m.get("why", ""))}</li>' for m in ed["mustread"]]
        parts.append("</ul>")
    if ed.get("trends"):
        parts.append("<h2>Trends</h2>")
        parts += [f'<div class="trend"><strong>{escape(t["name"])}</strong> — {escape(t["summary"])}</div>'
                  for t in ed["trends"]]
    titles = {"network": "From the timeline", "repos": "Repos", "blogs": "Blogs"}
    for sec in ed.get("sections", []):
        if not sec["items"]:
            continue
        parts.append(f'<h2>{titles.get(sec["id"], escape(sec["title"]))}</h2><ul>')
        for it in sec["items"]:
            who = it.get("who") or it.get("src", "")
            parts.append(f'<li>{link(it["t"], it["u"])} <span class="meta">{escape(who)}</span></li>')
        parts.append("</ul>")
    if ed.get("notes"):
        parts.append('<h2>Notes</h2><div class="notes"><ul>' +
                     "".join(f"<li>{escape(n)}</li>" for n in ed["notes"]) + "</ul></div>")
    archive = " · ".join(f'<a href="/editions/{e["edition"]}.html">{e["edition"]}</a>' for e in editions[:14])
    parts.append(f'<footer><a href="/feed.xml">RSS</a> · Archive: {archive}</footer>')
    body = "\n".join(parts)
    return (f'<!doctype html><html lang="en"><head><meta charset="utf-8">'
            f'<meta name="viewport" content="width=device-width,initial-scale=1">'
            f'<title>{TITLE} · {ed["edition"]}</title><meta name="description" content="{escape(TAGLINE)}">'
            f'<link rel="alternate" type="application/rss+xml" title="{TITLE}" href="{SITE}/feed.xml">'
            f'<style>{CSS}</style></head><body><main>{body}</main></body></html>\n')


def render_feed(editions):
    items = []
    for ed in editions[:FEED_SIZE]:
        url = f"{SITE}/editions/{ed['edition']}.html"
        lines = "".join(f'<li><a href="{escape(s["u"])}">{escape(s["h"])}</a></li>' for s in ed["top"])
        lead = ed["top"][0]["h"] if ed["top"] else long_date(ed)
        pub = format_datetime(datetime.fromisoformat(ed["updated"]))
        items.append(f"<item><title>{escape(ed['edition'])}: {escape(lead)}</title><link>{url}</link>"
                     f"<guid isPermaLink=\"true\">{url}</guid><pubDate>{pub}</pubDate>"
                     f"<description>{escape('<ul>' + lines + '</ul>')}</description></item>")
    return ('<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel>'
            f"<title>{TITLE}</title><link>{SITE}/</link><description>{escape(TAGLINE)}</description>"
            f"<language>en</language>{''.join(items)}</channel></rss>\n")


def main():
    editions = load_editions()
    (ROOT / "index.html").write_text(render_page(editions[0], editions), encoding="utf-8", newline="\n")
    for ed in editions:
        (ROOT / "editions" / f"{ed['edition']}.html").write_text(render_page(ed, editions), encoding="utf-8", newline="\n")
    (ROOT / "feed.xml").write_text(render_feed(editions), encoding="utf-8", newline="\n")
    print(f"built {len(editions)} edition(s)")


if __name__ == "__main__":
    main()
