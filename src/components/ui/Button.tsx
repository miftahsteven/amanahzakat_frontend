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
    primary: 'bg-[#0F9D6E] hover:bg-[#0B7C56] text-white shadow-xs focus:ring-[#0F9D6E]',
    secondary: 'bg-[#A5E4CB] hover:bg-[#8ED9BC] text-[#04241A] font-bold border border-[#A5E4CB]',
    accent: 'bg-[#C8933A] hover:bg-[#A97A2C] text-white shadow-xs focus:ring-[#C8933A]',
    outline: 'bg-white border border-[#DDE3DF] hover:bg-[#F4F6F4] text-[#4D5C56] font-semibold',
    ghost: 'hover:bg-[#E3E8E4] text-[#4D5C56]',
    danger: 'bg-[#D4574C] hover:bg-[#B83D32] text-white shadow-xs focus:ring-[#D4574C]',
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
