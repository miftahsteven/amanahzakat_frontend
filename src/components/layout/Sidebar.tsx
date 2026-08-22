import React from 'react';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { getMenuIcon } from '../../lib/menuIcons';
import type { NavModul } from '../../types/acl';

export interface SidebarProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  navigation?: NavModul[];
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  onNavigate,
  navigation = [],
  collapsed = false,
  onToggleCollapse,
}) => {
  const [hovered, setHovered] = React.useState(false);
  const leaveTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const filteredSections = navigation
    .map((section) => ({
      title: section.namaModul,
      items: section.menus.filter((item) => item.tampilDiSidebar),
    }))
    .filter((section) => section.items.length > 0);

  // Preferensi collapse tetap, hover hanya expand sementara
  const visuallyExpanded = !collapsed || hovered;
  const overlayMode = collapsed && hovered;

  const clearLeaveTimer = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
  };

  const handleMouseEnter = () => {
    clearLeaveTimer();
    if (collapsed) setHovered(true);
  };

  const handleMouseLeave = () => {
    clearLeaveTimer();
    leaveTimerRef.current = setTimeout(() => {
      setHovered(false);
    }, 120);
  };

  React.useEffect(() => {
    if (!collapsed) setHovered(false);
    return () => clearLeaveTimer();
  }, [collapsed]);

  return (
    <div className={cn('relative shrink-0', collapsed ? 'w-[76px]' : 'w-64')}>
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          'bg-[#0D1714] text-[#A4B8AF] flex flex-col h-screen sticky top-0 select-none overflow-hidden font-sans border-r border-white/[0.07] transition-[width,box-shadow] duration-250 ease-in-out',
          visuallyExpanded ? 'w-64' : 'w-[76px]',
          overlayMode && 'absolute left-0 top-0 z-50 shadow-2xl shadow-black/60 border-r-[#0F9D6E]/40'
        )}
      >
        <div
          className={cn(
            'flex items-center border-b border-white/[0.07]',
            visuallyExpanded ? 'p-5 gap-3' : 'p-3 justify-center'
          )}
        >
          <div className="w-8 h-8 rounded-xl bg-[#0F9D6E] text-[#04241A] flex items-center justify-center font-extrabold text-base shadow-sm shrink-0">
            A
          </div>
          {visuallyExpanded && (
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-[#E7EFE9] tracking-tight truncate">AmanahZakat</h1>
              <span className="text-[10px] font-semibold text-[#7D938A] block uppercase tracking-widest truncate">
                LEMBAGA AMIL ZAKAT
              </span>
            </div>
          )}
        </div>

        <nav
          className={cn(
            'flex-1 overflow-y-auto text-xs scrollbar-thin',
            visuallyExpanded ? 'p-3.5 space-y-5' : 'p-2 space-y-3'
          )}
        >
          {filteredSections.map((section) => (
            <div key={section.title} className="space-y-1">
              {visuallyExpanded ? (
                <h2 className="px-2.5 text-[10px] font-bold text-[#5F766C] tracking-[1.2px] uppercase mb-1.5">
                  {section.title}
                </h2>
              ) : (
                <div className="h-px bg-white/[0.07] mx-2 mb-2" />
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = currentScreen === item.kodeMenu;
                  const MenuIcon = getMenuIcon(item.icon);
                  return (
                    <button
                      key={item.kodeMenu}
                      type="button"
                      title={item.namaMenu}
                      onClick={() => onNavigate(item.kodeMenu)}
                      className={cn(
                        'w-full flex items-center rounded-lg font-semibold transition-colors cursor-pointer text-left',
                        visuallyExpanded ? 'gap-2.5 px-2.5 py-2 text-[12.5px]' : 'justify-center p-2',
                        isActive
                          ? 'bg-[#A5E4CB] text-[#04241A] font-bold shadow-xs'
                          : 'text-[#A4B8AF] hover:text-white hover:bg-white/[0.07]'
                      )}
                    >
                      <span
                        className={cn(
                          'w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 font-mono',
                          isActive
                            ? 'bg-[#04241A]/15 text-[#04241A]'
                            : 'bg-white/[0.09] text-[#C4D4CC]'
                        )}
                      >
                        {MenuIcon ? <MenuIcon className="w-3 h-3" /> : item.kodeTampil}
                      </span>
                      {visuallyExpanded && <span className="truncate">{item.namaMenu}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className={cn('border-t border-white/[0.07]', visuallyExpanded ? 'p-4' : 'p-2')}>
          {visuallyExpanded ? (
            <div className="p-3.5 rounded-xl bg-white/[0.05] border border-white/[0.07] text-xs space-y-1.5">
              <span className="text-[10px] font-semibold text-[#7D938A] uppercase tracking-wider block">
                PERIODE AKTIF
              </span>
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-[#E7EFE9] text-sm truncate">Juli 2026</span>
                <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-[#E6F6EF] text-[#0B7C56] shrink-0">
                  Terbuka
                </span>
              </div>
            </div>
          ) : (
            <div
              className="mx-auto w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.07] flex items-center justify-center"
              title="Periode Aktif: Juli 2026 (Terbuka)"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#0F9D6E]" />
            </div>
          )}
        </div>

        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            title={collapsed ? 'Perluas sidebar (pin)' : 'Ciutkan sidebar'}
            className="absolute top-20 -right-3 z-40 w-6 h-6 rounded-full bg-white border border-[#DDE3DF] text-[#0D1714] shadow-md flex items-center justify-center hover:bg-[#E6F6EF] transition-colors cursor-pointer"
          >
            {collapsed ? <ChevronsRight className="w-3.5 h-3.5" /> : <ChevronsLeft className="w-3.5 h-3.5" />}
          </button>
        )}
      </aside>

    </div>
  );
};
