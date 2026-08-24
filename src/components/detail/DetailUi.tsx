import React from 'react';
import { ArrowLeft, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '../../lib/utils';

export function formatTanggalId(iso: string) {
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export function inisialNama(nama: string) {
  return nama
    .split(' ')
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export function DetailBackLink({ label, onBack }: { label: string; onBack: () => void }) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="text-xs font-bold text-[#0F9D6E] hover:text-[#0B7C56] flex items-center gap-1.5 transition-colors"
    >
      <ArrowLeft className="w-4 h-4" /> {label}
    </button>
  );
}

export function DetailLoading({ label, onBack }: { label: string; onBack: () => void }) {
  return (
    <div className="space-y-4">
      <DetailBackLink label={label} onBack={onBack} />
      <p className="text-sm text-[#7D938A]">Memuat data...</p>
    </div>
  );
}

export function DetailNotFound({ label, onBack }: { label: string; onBack: () => void }) {
  return (
    <div className="space-y-4">
      <DetailBackLink label={label} onBack={onBack} />
      <p className="text-sm text-rose-600">Data tidak ditemukan.</p>
    </div>
  );
}

export function DetailHero({
  eyebrow,
  title,
  subtitle,
  actions,
  progress,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
  progress?: { pct: number; label: string };
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0D1714] via-[#04241a] to-[#0B7C56] text-white p-6 sm:p-8 border border-emerald-900/40">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_#A5E4CB_0%,_transparent_50%)]" />
      <div className="relative space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/90">{eyebrow}</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight break-words">{title}</h1>
            <p className="text-sm text-emerald-100/80 font-medium">{subtitle}</p>
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
        </div>
        {progress && (
          <div className="space-y-2 pt-2">
            <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-[#A5E4CB] rounded-full transition-all"
                style={{ width: `${Math.min(100, progress.pct)}%` }}
              />
            </div>
            <p className="text-xs font-bold text-[#A5E4CB]">{progress.label}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function DetailHeroProfile({
  inisial,
  title,
  subtitle,
  meta,
  actions,
}: {
  inisial: string;
  title: string;
  subtitle: string;
  meta: Array<{ label: string; value: string }>;
  actions?: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0D1714] via-[#04241a] to-[#0B7C56] text-white p-6 sm:p-8 border border-emerald-900/40">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_#A5E4CB_0%,_transparent_50%)]" />
      <div className="relative flex flex-col lg:flex-row lg:items-start gap-5">
        <div className="w-16 h-16 rounded-2xl bg-[#0F9D6E] text-[#04241a] font-extrabold text-xl flex items-center justify-center shrink-0">
          {inisial}
        </div>
        <div className="flex-1 min-w-0 space-y-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{title}</h1>
            <p className="text-sm text-emerald-100/80 font-mono mt-1">{subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-6 text-xs">
            {meta.map((m) => (
              <div key={m.label}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#7D938A]">{m.label}</p>
                <p className="font-semibold mt-1 text-white">{m.value}</p>
              </div>
            ))}
          </div>
        </div>
        {actions && <div className="flex flex-wrap gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}

export function SummaryCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-[#E3E8E4] dark:border-slate-800 rounded-2xl p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#7D938A]">{label}</span>
        {icon && <span className="text-[#0F9D6E]">{icon}</span>}
      </div>
      <p className="text-lg font-extrabold text-[#16211D] dark:text-white font-mono">{value}</p>
      <p className="text-[11px] text-[#7D938A]">{sub}</p>
    </div>
  );
}

export function InfoPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-[#E3E8E4] dark:border-slate-800 rounded-2xl overflow-hidden">
      <div className="px-5 sm:px-6 py-4 border-b border-[#E3E8E4] dark:border-slate-800">
        <h2 className="text-sm font-extrabold text-[#16211D] dark:text-white">{title}</h2>
      </div>
      <div className="px-5 sm:px-6 py-1">{children}</div>
    </div>
  );
}

export function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-0.5 py-2.5 border-b border-[#E3E8E4] dark:border-slate-800 last:border-0 text-xs">
      <span className="text-[#7D938A] font-medium shrink-0">{label}</span>
      <span className="font-semibold text-[#16211D] dark:text-slate-100 text-right sm:max-w-[60%] break-words">
        {value || '—'}
      </span>
    </div>
  );
}

export function TimelineSection({
  title,
  steps,
}: {
  title: string;
  steps: Array<{ title: string; desc: string; waktu?: string; done: boolean }>;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-[#E3E8E4] dark:border-slate-800 rounded-2xl p-5 sm:p-6">
      <h2 className="text-sm font-extrabold text-[#16211D] dark:text-white mb-5">{title}</h2>
      <div>
        {steps.map((step, idx) => (
          <div key={step.title} className="flex gap-4">
            <div className="flex flex-col items-center">
              {step.done ? (
                <CheckCircle2 className="w-5 h-5 text-[#0F9D6E] shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-[#A4B8AF] shrink-0" />
              )}
              {idx < steps.length - 1 && (
                <div className={cn('w-0.5 flex-1 min-h-[2rem] my-1', step.done ? 'bg-emerald-200' : 'bg-[#E3E8E4]')} />
              )}
            </div>
            <div className="pb-6 flex-1">
              <p className={cn('text-sm font-bold', step.done ? 'text-[#16211D] dark:text-white' : 'text-[#7D938A]')}>
                {step.title}
              </p>
              <p className="text-xs text-[#7D938A] mt-0.5">{step.desc}</p>
              {step.waktu && <p className="text-[10px] text-[#A4B8AF] font-mono mt-1">{step.waktu}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DocChecklist({
  title,
  items,
}: {
  title: string;
  items: Array<{ nama: string; status: string }>;
}) {
  return (
    <InfoPanel title={title}>
      {items.map((d) => (
        <div key={d.nama} className="flex items-center justify-between gap-3 py-2.5 border-b border-[#E3E8E4] dark:border-slate-800 last:border-0 text-xs">
          <span className="font-medium text-[#16211D] dark:text-slate-200">{d.nama}</span>
          <span
            className={cn(
              'px-2.5 py-0.5 rounded-full text-[10px] font-bold',
              d.status === 'Lengkap'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            )}
          >
            {d.status}
          </span>
        </div>
      ))}
    </InfoPanel>
  );
}

export function ProgressBreakdown({
  title,
  subtitle,
  rows,
}: {
  title: string;
  subtitle?: string;
  rows: Array<{ label: string; value: string; pct: number }>;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-[#E3E8E4] dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
      <div>
        <h2 className="text-sm font-extrabold text-[#16211D] dark:text-white">{title}</h2>
        {subtitle && <p className="text-xs text-[#7D938A] mt-1">{subtitle}</p>}
      </div>
      {rows.map((row) => (
        <div key={row.label} className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-[#16211D] dark:text-white">{row.label}</span>
            <span className="font-mono text-[#7D938A]">
              {row.value} · {row.pct}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-[#EEF1EE] overflow-hidden">
            <div className="h-full bg-[#0F9D6E] rounded-full" style={{ width: `${row.pct}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
