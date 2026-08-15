import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import type { AuthUser, NavModul } from '../../types/acl';

const SIDEBAR_COLLAPSED_KEY = 'amanahzakat_sidebar_collapsed';

export interface AppLayoutProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  onOpenQuickZis: () => void;
  onLogout?: () => void;
  navigation?: NavModul[];
  currentUser?: AuthUser | null;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentScreen,
  onNavigate,
  onOpenQuickZis,
  onLogout,
  navigation = [],
  currentUser,
  children,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1';
    } catch {
      return false;
    }
  });

  const handleToggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? '1' : '0');
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  return (
    <div className="flex min-h-screen bg-[#F3F6F4] dark:bg-slate-950 text-[#14271F] dark:text-slate-200 font-sans transition-colors">
      <Sidebar
        currentScreen={currentScreen}
        onNavigate={onNavigate}
        navigation={navigation}
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentScreen={currentScreen}
          onNavigate={onNavigate}
          onOpenQuickZis={onOpenQuickZis}
          onLogout={onLogout}
          navigation={navigation}
          currentUser={currentUser}
          onToggleSidebar={handleToggleSidebar}
          sidebarCollapsed={sidebarCollapsed}
        />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};
