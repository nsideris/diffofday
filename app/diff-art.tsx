import type { Edition } from '@/lib/types';

const COLS = 30;
const ROWS = 7;
const CELL = 14;
const GAP = 4;
const WIDTH = 640;
const LINE_HEIGHT = 26;

function seeded(text: string) {
  let h = 2166136261;
  for (const ch of text) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

function clip(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

export function DiffArt({ edition }: { edition: Edition }) {
  const random = seeded(edition.edition);
  const gridWidth = COLS * (CELL + GAP) - GAP;
  const gridLeft = (WIDTH - gridWidth) / 2;
  const cells = Array.from({ length: COLS * ROWS }, (_, i) => ({
    x: gridLeft + Math.floor(i / ROWS) * (CELL + GAP),
    y: 52 + (i % ROWS) * (CELL + GAP),
    level: Math.floor(random() ** 1.6 * 5),
  }));
  const lines = edition.top.slice(1, 7).map((s) => clip(s.h, 62));
  const diffTop = 52 + ROWS * (CELL + GAP) + 34;
  const height = diffTop + (lines.length + 1) * LINE_HEIGHT + 18;

  return (
    <figure className="diffart">
      <svg viewBox={`0 0 ${WIDTH} ${height}`} role="img" aria-label={`Diff of ${edition.edition}: today's other top stories`}>
        <rect x="0.5" y="0.5" width={WIDTH - 1} height={height - 1} rx="6" className="frame" />
        <text x="22" y="30" className="head">diff --git a/yesterday b/{edition.edition}</text>
        {cells.map((c) => (
          <rect key={`${c.x}-${c.y}`} x={c.x} y={c.y} width={CELL} height={CELL} rx="3" className={`cell l${c.level}`} />
        ))}
        <text x="22" y={diffTop} className="hunk">@@ -0,0 +1,{edition.top.length} @@ today in AI</text>
        {lines.map((line, i) => (
          <g key={line} transform={`translate(0 ${diffTop + (i + 1) * LINE_HEIGHT})`}>
            <rect x="12" y="-17" width={WIDTH - 24} height="23" className="addbg" />
            <text x="22" y="0" className="add">+ {line}</text>
          </g>
        ))}
      </svg>
    </figure>
  );
}
