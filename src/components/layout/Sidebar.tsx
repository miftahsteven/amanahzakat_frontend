import React from 'react';
import { cn } from '../../lib/utils';
import type { NavModul } from '../../types/acl';

export interface SidebarProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  navigation?: NavModul[];
}

export const Sidebar: React.FC<SidebarProps> = ({ currentScreen, onNavigate, navigation = [] }) => {
  const filteredSections = navigation
    .map((section) => ({
      title: section.namaModul,
      items: section.menus.filter((item) => item.tampilDiSidebar),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <aside className="w-64 bg-[#091D15] text-[#8A9691] flex flex-col h-screen sticky top-0 shrink-0 select-none overflow-hidden font-sans border-r border-[#14271F]">
      <div className="p-5 flex items-center gap-3 border-b border-[#14271F]">
        <div className="w-10 h-10 rounded-xl bg-[#0B9D6D] text-white flex items-center justify-center font-black text-xl shadow-md">
          A
        </div>
        <div>
          <h1 className="text-sm font-extrabold text-white tracking-wide">AmanahZakat</h1>
          <span className="text-[10px] font-bold text-[#8A9691] block uppercase tracking-wider">
            LEMBAGA AMIL ZAKAT
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-6 text-xs scrollbar-thin">
        {filteredSections.map((section) => (
          <div key={section.title} className="space-y-1.5">
            <h2 className="px-2 text-[10px] font-black text-[#8A9691] tracking-widest uppercase mb-2">
              {section.title}
            </h2>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = currentScreen === item.kodeMenu;
                return (
                  <button
                    key={item.kodeMenu}
                    onClick={() => onNavigate(item.kodeMenu)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all cursor-pointer text-left',
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
                      {item.kodeTampil}
                    </span>
                    <span className="truncate">{item.namaMenu}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 bg-[#091D15] border-t border-[#14271F]">
        <div className="p-3.5 rounded-2xl bg-[#14271F] border border-[#21382E] text-xs space-y-1.5">
          <span className="text-[10px] font-bold text-[#8A9691] uppercase tracking-wider block">
            PERIODE AKTIF
          </span>
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-white text-sm">Juli 2026</span>
            <span className="px-2.5 py-0.5 text-[10px] font-black rounded-full bg-[#E6F7EE] text-[#0B9D6D] border border-[#A3DBC8]">
              Terbuka
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
