import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';

export function RecordDetailShell({
  title,
  subtitle,
  onBack,
  children,
  actions,
}: {
  title: string;
  subtitle?: string;
  onBack: () => void;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-2">
          <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />} onClick={onBack}>
            Kembali ke daftar
          </Button>
          <div>
            <h1 className="text-2xl font-extrabold text-[#16211D] dark:text-slate-100">{title}</h1>
            {subtitle && <p className="text-xs text-[#7D938A] mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
      <div className="bg-white dark:bg-slate-900 border border-[#E3E8E4] dark:border-slate-800 rounded-2xl p-6">{children}</div>
    </div>
  );
}
