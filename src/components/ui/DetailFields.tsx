import React from 'react';

export function DetailFields({
  rows,
}: {
  rows: Array<{ label: string; value: React.ReactNode }>;
}) {
  return (
    <dl className="space-y-2.5 text-xs">
      {rows.map((row) => (
        <div key={row.label} className="grid grid-cols-3 gap-2 items-start">
          <dt className="text-[#7D938A] font-medium">{row.label}</dt>
          <dd className="col-span-2 font-semibold text-[#16211D] dark:text-slate-200 break-words">{row.value || '—'}</dd>
        </div>
      ))}
    </dl>
  );
}
