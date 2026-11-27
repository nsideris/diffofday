import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  const bar = (top: number, left: number, width: number, height: number, color: string) => (
    <div style={{ position: 'absolute', top, left, width, height, borderRadius: height / 2, background: color }} />
  );
  return new ImageResponse(
    (
      <div style={{ width: 180, height: 180, background: '#121417', position: 'relative', display: 'flex' }}>
        {bar(48, 51, 78, 17, '#9aa1a8')}
        {bar(107, 51, 78, 19, '#5fd3a5')}
        {bar(77, 80.5, 19, 79, '#5fd3a5')}
      </div>
    ),
    size,
  );
}
