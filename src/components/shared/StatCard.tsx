import React from 'react';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';

export interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  accentColor?: 'emerald' | 'blue' | 'amber' | 'purple';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  accentColor = 'emerald',
}) => {
  const bgIcons = {
    emerald: 'bg-[#E6F6EF] text-[#0F9D6E]',
    blue: 'bg-[#E6F6EF] text-[#0F9D6E]',
    amber: 'bg-[#FDF5EA] text-[#C8933B]',
    purple: 'bg-[#F3F6F4] text-[#16211D]',
  };

  return (
    <Card className="relative p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-xs font-bold text-[#7D938A] dark:text-slate-400 uppercase tracking-wider">{title}</p>
          <h2 className="text-2xl font-extrabold text-[#16211D] dark:text-slate-100 tracking-tight">{value}</h2>
          {subtitle && <p className="text-xs text-[#7D938A] dark:text-slate-400 font-medium">{subtitle}</p>}
        </div>
        <div className={cn('p-3 rounded-xl shrink-0 font-bold', bgIcons[accentColor])}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold">
          <span className={trend.isPositive ? 'text-[#0F9D6E]' : 'text-rose-600'}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
          <span className="text-[#7D938A] font-normal">vs bulan lalu</span>
        </div>
      )}
    </Card>
  );
};
