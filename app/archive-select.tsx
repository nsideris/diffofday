'use client';

export function ArchiveSelect({ dates, current, base = '' }: { dates: string[]; current: string; base?: '' | '/classic' }) {
  return (
    <>
      <label htmlFor="archive" className="mono">Edition</label>
      <select
        id="archive"
        aria-label="Choose an edition"
        defaultValue={current}
        onChange={(e) => { window.location.href = e.target.value ? `${base || '/editions'}/${e.target.value}` : base || '/'; }}
      >
        <option value="">Today</option>
        {dates.map((d) => <option key={d} value={d}>{d}</option>)}
      </select>
    </>
  );
}
