import React from 'react';
import { cn } from '../../lib/utils';

export interface SidebarProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  allowedMenuIds?: string[];
}

interface NavItem {
  id: string;
  code: string;
  label: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ currentScreen, onNavigate, allowedMenuIds }) => {
  const allSections: NavSection[] = [
    {
      title: 'IKHTISAR',
      items: [
        { id: 'dashboard', code: 'DB', label: 'Dashboard' },
        { id: 'laporan', code: 'LD', label: 'Laporan Distribusi' },
        { id: 'peta', code: 'PT', label: 'Peta Sebaran' },
        { id: 'dampak', code: 'DP', label: 'Dampak Publik' },
      ],
    },
    {
      title: 'OPERASIONAL ZIS',
      items: [
        { id: 'penerimaan', code: 'PN', label: 'Penerimaan ZIS' },
        { id: 'penyaluran', code: 'PY', label: 'Penyaluran' },
        { id: 'muzakki', code: 'MZ', label: 'Data Muzakki' },
        { id: 'program', code: 'PR', label: 'Program & Anggaran' },
        { id: 'mitra', code: 'MT', label: 'Dashboard Mitra' },
        { id: 'portalUpz', code: 'PU', label: 'Portal UPZ Korporat' },
        { id: 'upz', code: 'UP', label: 'Dashboard UPZ' },
        { id: 'payroll', code: 'PL', label: 'Payroll UPZ' },
        { id: 'mustahik', code: 'MS', label: 'Data Mustahik' },
      ],
    },
    {
      title: 'KEUANGAN & AKUNTANSI',
      items: [
        { id: 'jurnal', code: 'JR', label: 'Jurnal & G/L' },
        { id: 'closing', code: 'CL', label: 'Closing Periode' },
        { id: 'simba', code: 'SB', label: 'Export SIMBA' },
      ],
    },
    {
      title: 'PERALATAN',
      items: [
        { id: 'kalkulator', code: 'KL', label: 'Kalkulator ZIS' },
        { id: 'portal', code: 'PO', label: 'Portal Publik' },
      ],
    },
    {
      title: 'PENGATURAN SISTEM',
      items: [
        { id: 'user-management', code: 'UM', label: 'Manajemen Pengguna' },
        { id: 'acl-management', code: 'AM', label: 'ACL & Role Menu' },
      ],
    },
  ];

  // Filter items by allowedMenuIds if specified
  const filteredSections = allSections
    .map((section) => ({
      ...section,
      items: allowedMenuIds
        ? section.items.filter((item) => allowedMenuIds.includes(item.id))
        : section.items,
    }))
    .filter((section) => section.items.length > 0);

  return (
    <aside className="w-64 bg-[#091D15] text-[#8A9691] flex flex-col h-screen sticky top-0 shrink-0 select-none overflow-hidden font-sans border-r border-[#14271F]">
      {/* Brand Header */}
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

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6 text-xs scrollbar-thin">
        {filteredSections.map((section, idx) => (
          <div key={idx} className="space-y-1.5">
            <h2 className="px-2 text-[10px] font-black text-[#8A9691] tracking-widest uppercase mb-2">
              {section.title}
            </h2>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = currentScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
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
                      {item.code}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Active Period Bottom Box */}
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
