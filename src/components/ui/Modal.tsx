import React, { useEffect, useState } from 'react';
import { Maximize2, Minimize2, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  /** Sticky footer di bawah body (selalu terlihat, tidak ikut scroll form). */
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  /** Mode peta/fullscreen gelap (existing). */
  fullscreen?: boolean;
  /** Tampilkan tombol perbesar / kembalikan ukuran modal. */
  maximizable?: boolean;
  /** Mulai dalam keadaan diperbesar. */
  defaultMaximized?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'lg',
  fullscreen = false,
  maximizable = false,
  defaultMaximized = false,
}) => {
  const [maximized, setMaximized] = useState(defaultMaximized);

  useEffect(() => {
    if (!isOpen) setMaximized(defaultMaximized);
  }, [isOpen, defaultMaximized]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
  };

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="flex flex-col w-full h-full bg-[#0D1714] text-white overflow-hidden">
          <div className="flex items-start justify-between px-5 py-4 border-b border-emerald-950 shrink-0">
            <div>
              <h3 className="text-lg font-bold text-white">{title}</h3>
              {subtitle && <p className="text-xs text-emerald-400/80 mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">{children}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={cn(
          'flex flex-col w-full bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all',
          maximized
            ? 'max-w-[min(100vw-1.5rem,96rem)] h-[min(96vh,920px)] rounded-xl'
            : cn(maxWidths[maxWidth], 'max-h-[90vh] rounded-2xl'),
        )}
      >
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate">{title}</h3>
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            {maximizable && (
              <button
                type="button"
                onClick={() => setMaximized((v) => !v)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
                aria-label={maximized ? 'Kembalikan ukuran' : 'Perbesar modal'}
                title={maximized ? 'Kembalikan ukuran' : 'Perbesar'}
              >
                {maximized ? <Minimize2 className="w-4.5 h-4.5 w-[18px] h-[18px]" /> : <Maximize2 className="w-[18px] h-[18px]" />}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 sm:p-6">{children}</div>

        {footer && (
          <div className="shrink-0 px-5 sm:px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
