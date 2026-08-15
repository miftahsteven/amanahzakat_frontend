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
          'bg-[#091D15] text-[#8A9691] flex flex-col h-screen sticky top-0 select-none overflow-hidden font-sans border-r border-[#14271F] transition-[width,box-shadow] duration-250 ease-in-out',
          visuallyExpanded ? 'w-64' : 'w-[76px]',
          overlayMode && 'absolute left-0 top-0 z-50 shadow-2xl shadow-black/40 border-r-[#0B9D6D]/40'
        )}
      >
        <div
          className={cn(
            'flex items-center border-b border-[#14271F]',
            visuallyExpanded ? 'p-5 gap-3' : 'p-3 justify-center'
          )}
        >
          <div className="w-10 h-10 rounded-xl bg-[#0B9D6D] text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
            A
          </div>
          {visuallyExpanded && (
            <div className="min-w-0">
              <h1 className="text-sm font-extrabold text-white tracking-wide truncate">AmanahZakat</h1>
              <span className="text-[10px] font-bold text-[#8A9691] block uppercase tracking-wider truncate">
                LEMBAGA AMIL ZAKAT
              </span>
            </div>
          )}
        </div>

        <nav
          className={cn(
            'flex-1 overflow-y-auto text-xs scrollbar-thin',
            visuallyExpanded ? 'p-4 space-y-6' : 'p-2 space-y-4'
          )}
        >
          {filteredSections.map((section) => (
            <div key={section.title} className="space-y-1.5">
              {visuallyExpanded ? (
                <h2 className="px-2 text-[10px] font-black text-[#8A9691] tracking-widest uppercase mb-2">
                  {section.title}
                </h2>
              ) : (
                <div className="h-px bg-[#14271F] mx-2 mb-2" />
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
                        'w-full flex items-center rounded-xl font-bold transition-all cursor-pointer text-left',
                        visuallyExpanded ? 'gap-3 px-3 py-2.5' : 'justify-center px-2 py-2.5',
                        isActive
                          ? 'bg-[#A3DBC8] text-[#091D15] shadow-xs'
                          : 'text-[#8A9691] hover:text-white hover:bg-[#14271F]'
                      )}
                    >
                      <span
                        className={cn(
                          'w-7 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0',
                          isActive
                            ? 'bg-[#091D15]/10 text-[#091D15]'
                            : 'bg-[#14271F] text-[#8A9691]'
                        )}
                      >
                        {MenuIcon ? <MenuIcon className="w-3.5 h-3.5" /> : item.kodeTampil}
                      </span>
                      {visuallyExpanded && <span className="truncate">{item.namaMenu}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className={cn('border-t border-[#14271F]', visuallyExpanded ? 'p-4' : 'p-2')}>
          {visuallyExpanded ? (
            <div className="p-3.5 rounded-2xl bg-[#14271F] border border-[#21382E] text-xs space-y-1.5">
              <span className="text-[10px] font-bold text-[#8A9691] uppercase tracking-wider block">
                PERIODE AKTIF
              </span>
              <div className="flex items-center justify-between gap-2">
                <span className="font-extrabold text-white text-sm truncate">Juli 2026</span>
                <span className="px-2.5 py-0.5 text-[10px] font-black rounded-full bg-[#E6F7EE] text-[#0B9D6D] border border-[#A3DBC8] shrink-0">
                  Terbuka
                </span>
              </div>
            </div>
          ) : (
            <div
              className="mx-auto w-10 h-10 rounded-xl bg-[#14271F] border border-[#21382E] flex items-center justify-center"
              title="Periode Aktif: Juli 2026 (Terbuka)"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#0B9D6D]" />
            </div>
          )}
        </div>

        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            title={collapsed ? 'Perluas sidebar (pin)' : 'Ciutkan sidebar'}
            className="absolute top-20 -right-3 z-40 w-6 h-6 rounded-full bg-white dark:bg-[#14271F] border border-[#D4DBD6] dark:border-[#21382E] text-[#091D15] dark:text-[#A3DBC8] shadow-md flex items-center justify-center hover:bg-[#E6F7EE] dark:hover:bg-[#0B9D6D]/30 transition-colors cursor-pointer"
          >
            {collapsed ? <ChevronsRight className="w-3.5 h-3.5" /> : <ChevronsLeft className="w-3.5 h-3.5" />}
          </button>
        )}
      </aside>
    </div>
  );
};
