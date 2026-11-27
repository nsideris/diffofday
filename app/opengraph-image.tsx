import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Diff of the Day: what changed in AI today, for engineers who build with it';

export default function OpenGraphImage() {
  const cells = Array.from({ length: 7 * 40 }, (_, i) => {
    const x = Math.sin(i * 12.9898) * 43758.5453;
    const level = Math.floor((x - Math.floor(x)) ** 1.6 * 5);
    return ['#2a2f33', 'rgba(95,211,165,.3)', 'rgba(95,211,165,.5)', 'rgba(95,211,165,.75)', '#5fd3a5'][level];
  });
  return new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, background: '#0f1112', color: '#ecebe6', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28 }}>
        <div style={{ display: 'flex', fontSize: 104, letterSpacing: -2 }}>
          <span>Diff of the&nbsp;</span><span style={{ color: '#5fd3a5', fontStyle: 'italic' }}>Day</span>
        </div>
        <div style={{ display: 'flex', fontSize: 28, color: '#9aa1a8', letterSpacing: 2, textTransform: 'uppercase' }}>What changed in AI today, for engineers who build with it</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', width: 40 * 22, gap: 6, marginTop: 20 }}>
          {cells.map((c, i) => <div key={i} style={{ width: 16, height: 16, borderRadius: 3, background: c }} />)}
        </div>
      </div>
    ),
    size,
  );
}
