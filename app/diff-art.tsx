import type { Edition } from '@/lib/types';

const COLS = 30;
const ROWS = 7;
const CELL = 16;
const GAP = 5;
const WIDTH = 690;
const GRID_TOP = 58;

function seeded(text: string) {
  let h = 2166136261;
  for (const ch of text) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export function DiffArt({ edition }: { edition: Edition }) {
  const random = seeded(edition.edition);
  const gridWidth = COLS * (CELL + GAP) - GAP;
  const gridLeft = (WIDTH - gridWidth) / 2;
  const height = GRID_TOP + ROWS * (CELL + GAP) - GAP + 26;
  const cells = Array.from({ length: COLS * ROWS }, (_, i) => ({
    x: gridLeft + Math.floor(i / ROWS) * (CELL + GAP),
    y: GRID_TOP + (i % ROWS) * (CELL + GAP),
    level: Math.floor(random() ** 1.6 * 5),
  }));

  return (
    <figure className="diffart">
      <svg viewBox={`0 0 ${WIDTH} ${height}`} role="img" aria-label={`Activity pattern for the ${edition.edition} edition`}>
        <rect x="0.5" y="0.5" width={WIDTH - 1} height={height - 1} rx="6" className="frame" />
        <text x="22" y="34" className="head">{`diff --git a/yesterday b/${edition.edition}`}</text>
        {cells.map((c) => (
          <rect key={`${c.x}-${c.y}`} x={c.x} y={c.y} width={CELL} height={CELL} rx="3" className={`cell l${c.level}`} />
        ))}
      </svg>
    </figure>
  );
}
