import React, { useCallback, useEffect, useState } from 'react';
import { Bell, Monitor, Moon, PanelLeftClose, PanelLeftOpen, Sun, Wallet } from 'lucide-react';
import type { AuthUser, NavModul } from '../../types/acl';
import { findMenuLabel } from '../../types/acl';
import { useTheme } from '../../hooks/useTheme';
import { GlobalSearch } from './GlobalSearch';
import { inboxApi } from '../../lib/api';
import { hasPermission } from '../../lib/permissions';
import iconAmanahZakat from '../../assets/amanahzakat_icon.png';

export interface HeaderProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  onOpenQuickZis: () => void;
  onSearchSelect?: (screen: string, id: string) => void;
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
  onOpenQuickZis,
  onSearchSelect,
  onLogout,
  navigation = [],
  currentUser,
  onToggleSidebar,
  sidebarCollapsed = false,
}) => {
  const { preference, cycle } = useTheme();
  const screenLabel = findMenuLabel(navigation, currentScreen);
  const canOpenInbox = currentUser?.menus?.includes('inbox') ?? navigation.some((modul) =>
    modul.menus.some((menu) => menu.kodeMenu === 'inbox')
  );
  const canQuickZis = hasPermission(currentUser, 'penerimaan.create');
  const roleLabel = currentUser?.roles?.[0]?.replace(/_/g, ' ') || 'Pengguna';
  const themeLabel =
    preference === 'system' ? 'Ikuti sistem' : preference === 'light' ? 'Mode terang' : 'Mode gelap';
  const ThemeIcon = preference === 'system' ? Monitor : preference === 'light' ? Sun : Moon;

  const [unreadCount, setUnreadCount] = useState(0);

  const loadUnreadCount = useCallback(async () => {
    if (!canOpenInbox) return;
    try {
      const rows = await inboxApi.list();
      setUnreadCount(rows.filter((r: any) => !r.dibaca).length);
    } catch {
      // Quiet: unread count is UI-only.
    }
  }, [canOpenInbox]);

  useEffect(() => {
    // Refresh unread count when user changes.
    loadUnreadCount();
  }, [currentUser?.id, loadUnreadCount]);

  useEffect(() => {
    // Refresh unread count after InboxPage is visited (items are usually marked as read there).
    if (currentScreen !== 'inbox') return;
    loadUnreadCount();
  }, [currentScreen, loadUnreadCount]);

  return (
    <header className="min-h-[60px] h-[60px] bg-white/95 backdrop-blur-md border-b border-[#E3E8E4] px-7 flex items-center justify-between sticky top-0 z-30 font-sans">
      <div className="flex items-center gap-3 text-xs font-medium text-[#6B7A74]">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            title={sidebarCollapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
            className="p-1.5 rounded-lg border border-[#DDE3DF] hover:bg-[#F1F4F1] text-[#16211D] transition-colors cursor-pointer"
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-[#7D938A]" />
            ) : (
              <PanelLeftClose className="w-4 h-4 text-[#7D938A]" />
            )}
          </button>
        )}
        <div className="flex items-center gap-2.5">
          <img
            src={iconAmanahZakat}
            alt="Amanah Zakat"
            className="w-5 h-5 object-contain shrink-0"
          />
          <span>Dashboard ERP</span>
          <span className="text-[#C2CCC6]">/</span>
          <span className="font-semibold text-[#16211D]">{screenLabel}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {onSearchSelect ? (
          <GlobalSearch onSelect={onSearchSelect} />
        ) : (
          <div className="relative w-64">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0F9D6E] absolute left-3 top-1/2 -translate-y-1/2"></span>
            <input
              type="text"
              placeholder="Cari data…"
              className="w-full pl-7 pr-3 py-1.5 text-xs bg-[#F1F4F1] border border-[#E3E8E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0F9D6E] text-[#16211D] placeholder:text-[#9FB3AA]"
            />
          </div>
        )}

        <button
          type="button"
          onClick={cycle}
          title={`${themeLabel} — klik untuk ganti`}
          className="p-1.5 rounded-lg hover:bg-[#F1F4F1] text-[#7D938A] transition-colors cursor-pointer border border-transparent hover:border-[#E3E8E4]"
        >
          <ThemeIcon className="w-4 h-4" />
        </button>

        {canQuickZis && (
          <button
            type="button"
            onClick={onOpenQuickZis}
            title="Catat penerimaan ZIS kilat"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0F9D6E] hover:bg-[#0B7C56] text-white text-[11px] font-bold transition-colors cursor-pointer"
          >
            <Wallet className="w-3.5 h-3.5" />
            Quick ZIS
          </button>
        )}

        {canOpenInbox && (
          <button
            onClick={() => onNavigate('inbox')}
            className="relative p-1.5 rounded-lg hover:bg-[#F1F4F1] text-[#7D938A] transition-colors cursor-pointer border border-transparent hover:border-[#E3E8E4]"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        )}

        <div className="flex items-center gap-2.5 bg-[#F1F4F1] border border-[#E3E8E4] p-1 pr-2.5 rounded-full">
          <div className="w-7 h-7 rounded-full bg-[#0D1714] text-[#A5E4CB] font-extrabold text-[11px] flex items-center justify-center shrink-0">
            {initialsFromName(currentUser?.namaLengkap)}
          </div>
          <div className="text-left text-xs">
            <span className="font-bold text-[#16211D] block leading-tight">
              {currentUser?.namaLengkap || currentUser?.username || 'Pengguna'}
            </span>
            <span className="text-[10px] text-[#7D938A] font-medium block leading-tight">{roleLabel}</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-[#E6F6EF] text-[#0B7C56] text-[10px] font-bold ml-1">
            {currentUser?.roles?.[0] || 'Approver'}
          </span>
          <button
            onClick={() => {
              if (onLogout) {
                onLogout();
              } else {
                onNavigate('login');
              }
            }}
            className="text-xs font-semibold text-[#4D5C56] hover:text-rose-600 px-2 py-0.5 rounded-md hover:bg-rose-50 transition-colors cursor-pointer border border-[#DDE3DF] bg-white ml-1"
          >
            Keluar
          </button>
        </div>
      </div>
    </header>
  );
};

