'use client';

export function ArchiveSelect({ dates, current }: { dates: string[]; current: string }) {
  return (
    <>
      <label htmlFor="archive" className="mono">Edition</label>
      <select
        id="archive"
        aria-label="Choose an edition"
        defaultValue={current}
        onChange={(e) => { window.location.href = e.target.value ? `/editions/${e.target.value}` : '/'; }}
      >
        <option value="">Today</option>
        {dates.map((d) => <option key={d} value={d}>{d}</option>)}
      </select>
    </>
  );
}
