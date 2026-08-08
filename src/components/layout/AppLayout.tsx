import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export interface AppLayoutProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  onOpenQuickZis: () => void;
  onLogout?: () => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentScreen,
  onNavigate,
  onOpenQuickZis,
  onLogout,
  children,
}) => {
  return (
    <div className="flex min-h-screen bg-[#F3F6F4] dark:bg-slate-950 text-[#14271F] dark:text-slate-200 font-sans transition-colors">
      {/* Sidebar */}
      <Sidebar currentScreen={currentScreen} onNavigate={onNavigate} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header currentScreen={currentScreen} onNavigate={onNavigate} onOpenQuickZis={onOpenQuickZis} onLogout={onLogout} />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};
