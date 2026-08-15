import React from 'react';
import { Bell, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import type { AuthUser, NavModul } from '../../types/acl';
import { findMenuLabel } from '../../types/acl';

export interface HeaderProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  onOpenQuickZis: () => void;
  onLogout?: () => void;
  navigation?: NavModul[];
  currentUser?: AuthUser | null;
  onToggleSidebar?: () => void;
  sidebarCollapsed?: boolean;
}

function initialsFromName(nama?: string): string {
  if (!nama) return 'AZ';
  const parts = nama.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  onLogout,
  navigation = [],
  currentUser,
  onToggleSidebar,
  sidebarCollapsed = false,
}) => {
  const screenLabel = findMenuLabel(navigation, currentScreen);
  const canOpenInbox = currentUser?.menus?.includes('inbox') ?? navigation.some((modul) =>
    modul.menus.some((menu) => menu.kodeMenu === 'inbox')
  );
  const roleLabel = currentUser?.roles?.[0]?.replace(/_/g, ' ') || 'Pengguna';

  return (
    <header className="h-16 bg-white dark:bg-[#091D15] border-b border-[#EBEFEB] dark:border-slate-800 px-8 flex items-center justify-between sticky top-0 z-30 font-sans">
      <div className="flex items-center gap-3 text-xs font-medium text-[#8A9691]">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            title={sidebarCollapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
            className="p-2 rounded-xl border border-[#D4DBD6] dark:border-slate-700 hover:bg-[#F3F6F4] dark:hover:bg-slate-800 text-[#14271F] dark:text-slate-200 transition-colors cursor-pointer"
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        )}
        <div className="flex items-center gap-2">
          <span>AmanahZakat ERP</span>
          <span>/</span>
          <span className="font-extrabold text-[#14271F] dark:text-white">{screenLabel}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-64">
          <span className="w-2 h-2 rounded-full bg-[#0B9D6D] absolute left-3 top-1/2 -translate-y-1/2"></span>
          <input
            type="text"
            placeholder="Cari data..."
            className="w-full pl-8 pr-4 py-1.5 text-xs bg-[#F3F6F4] dark:bg-slate-800 border border-[#D4DBD6] dark:border-slate-700 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0B9D6D] text-[#14271F] dark:text-slate-200"
          />
        </div>

        {canOpenInbox && (
          <button
            onClick={() => onNavigate('inbox')}
            className="relative p-2 rounded-full hover:bg-[#F3F6F4] dark:hover:bg-slate-800 text-[#14271F] dark:text-slate-300 transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4 text-[#8A9691]" />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center border-2 border-white dark:border-slate-900">
              6
            </span>
          </button>
        )}

        <div className="flex items-center gap-3 bg-[#F3F6F4] dark:bg-slate-800/80 p-1.5 pr-3 rounded-full border border-[#D4DBD6] dark:border-slate-700">
          <div className="w-8 h-8 rounded-full bg-[#091D15] text-[#A3DBC8] font-bold text-xs flex items-center justify-center shrink-0">
            {initialsFromName(currentUser?.namaLengkap)}
          </div>
          <div className="text-left text-xs">
            <span className="font-extrabold text-[#14271F] dark:text-white block leading-tight">
              {currentUser?.namaLengkap || currentUser?.username || 'Pengguna'}
            </span>
            <span className="text-[10px] text-[#8A9691] font-medium block">{roleLabel}</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-[#E6F7EE] text-[#0B9D6D] text-[10px] font-black border border-[#A3DBC8] ml-1">
            {currentUser?.roles?.[0] || 'USER'}
          </span>
          <button
            onClick={() => {
              if (onLogout) {
                onLogout();
              } else {
                onNavigate('login');
              }
            }}
            className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer border border-rose-200 dark:border-rose-800 bg-white dark:bg-slate-800"
          >
            Keluar
          </button>
        </div>
      </div>
    </header>
  );
};
