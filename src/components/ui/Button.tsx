import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  icon,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const variants = {
    primary: 'bg-[#0B9D6D] hover:bg-[#091D15] text-white shadow-sm focus:ring-[#0B9D6D]',
    secondary: 'bg-[#A3DBC8] hover:bg-[#0B9D6D] text-[#091D15] hover:text-white border border-[#A3DBC8]',
    accent: 'bg-[#C8933B] hover:bg-[#091D15] text-white shadow-sm focus:ring-[#C8933B]',
    outline: 'border border-[#D4DBD6] hover:bg-[#F3F6F4] text-[#14271F] dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800',
    ghost: 'hover:bg-[#EBEFEB] text-[#14271F] dark:text-slate-300 dark:hover:bg-slate-800',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-500',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-xs px-4 py-2 gap-2',
    lg: 'text-sm px-5 py-2.5 gap-2.5',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
