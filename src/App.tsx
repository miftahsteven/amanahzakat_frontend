import React, { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Toaster, toast } from 'sonner';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { PenerimaanPage } from './pages/PenerimaanPage';
import { PenyaluranPage } from './pages/PenyaluranPage';
import { MuzakkiPage } from './pages/MuzakkiPage';
import { MustahikPage } from './pages/MustahikPage';
import { ProgramPage } from './pages/ProgramPage';
import { MitraPage } from './pages/MitraPage';
import { UpzPage } from './pages/UpzPage';
import { PayrollPage } from './pages/PayrollPage';
import { LaporanKeuanganPage } from './pages/LaporanKeuanganPage';
import { JurnalGLPage } from './pages/JurnalGLPage';
import { ClosingPage } from './pages/ClosingPage';
import { SimbaPage } from './pages/SimbaPage';
import { KalkulatorPage } from './pages/KalkulatorPage';
import { PetaSebaranPage } from './pages/PetaSebaranPage';
import { PortalPublicPage } from './pages/PortalPublicPage';
import { InboxPage } from './pages/InboxPage';
import { GenericPage } from './pages/GenericPage';
import { LoginPage } from './pages/LoginPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { AclManagementPage } from './pages/AclManagementPage';
import { ModuleManagementPage } from './pages/ModuleManagementPage';
import { PermissionManagementPage } from './pages/PermissionManagementPage';
import { HeroSliderPage } from './pages/cms/HeroSliderPage';
import { CampaignsManagementPage } from './pages/cms/CampaignsManagementPage';
import { DistributionsManagementPage } from './pages/cms/DistributionsManagementPage';
import { TestimonialsManagementPage } from './pages/cms/TestimonialsManagementPage';
import { FaqManagementPage } from './pages/cms/FaqManagementPage';
import { ImpactManagementPage } from './pages/cms/ImpactManagementPage';
import { AssistanceManagementPage } from './pages/cms/AssistanceManagementPage';
import { WebSettingsPage } from './pages/cms/WebSettingsPage';
import { ApprovalPage } from './pages/ApprovalPage';
import { Modal } from './components/ui/Modal';


import { Button } from './components/ui/Button';
import { authApi, isSessionValid, getStoredUser, removeStoredToken } from './lib/api';
import type { AuthUser, NavModul } from './types/acl';
import { menuCodesFromUser } from './types/acl';


export function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [allowedMenuIds, setAllowedMenuIds] = useState<string[]>([]);
  const [navigation, setNavigation] = useState<NavModul[]>([]);
  const [currentScreen, setCurrentScreen] = useState<string>('dashboard');
  const [selectedTrxId, setSelectedTrxId] = useState<string | null>(null);
  const [isQuickZisModalOpen, setIsQuickZisModalOpen] = useState<boolean>(false);
  const [isCheckingSession, setIsCheckingSession] = useState<boolean>(true);

  // Quick ZIS Form State
  const [quickNominal, setQuickNominal] = useState<number>(1000000);
  const [quickJenis, setQuickJenis] = useState<string>('Zakat Maal');

  const applySession = (user: AuthUser) => {
    const menus = menuCodesFromUser(user);
    setCurrentUser(user);
    setAllowedMenuIds(menus);
    setNavigation(user.navigation || []);
    const initialScreen = menus.includes('dashboard') ? 'dashboard' : menus[0] || 'dashboard';
    setCurrentScreen(initialScreen);
  };

  React.useEffect(() => {
    const checkSession = async () => {
      if (!isSessionValid()) {
        setIsLoggedIn(false);
        setIsCheckingSession(false);
        return;
      }

      try {
        const userRes = await authApi.me();
        localStorage.setItem('amanahzakat_user', JSON.stringify(userRes));
        setIsLoggedIn(true);
        applySession(userRes);
      } catch {
        const storedUser = getStoredUser();
        if (storedUser?.navigation || storedUser?.menus) {
          setIsLoggedIn(true);
          applySession(storedUser);
        } else {
          removeStoredToken();
          setIsLoggedIn(false);
        }
      }
      setIsCheckingSession(false);
    };

    checkSession();
  }, []);

  const handleQuickZisSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Penerimaan ZIS baru ${quickJenis} sebesar Rp ${quickNominal.toLocaleString('id-ID')} berhasil dicatat!`);
    setIsQuickZisModalOpen(false);
  };

  const handleLoginSuccess = (user: AuthUser) => {
    setIsLoggedIn(true);
    applySession(user);
  };

  const handleLogout = () => {
    authApi.logout();
    setIsLoggedIn(false);
    setCurrentUser(null);
    setAllowedMenuIds([]);
    setNavigation([]);
    setCurrentScreen('login');
    toast.info('Sesi login telah berakhir. Anda telah keluar dari sistem.');
  };

  const renderScreen = () => {
    // ACL Guard: if currentScreen is not in allowedMenuIds (and not login), block or fallback
    if (currentScreen !== 'login' && !allowedMenuIds.includes(currentScreen)) {
      return (
        <div className="p-12 text-center bg-white  rounded-2xl border border-rose-200 dark:border-rose-900 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 font-bold mx-auto flex items-center justify-center text-2xl">
            🚫
          </div>
          <h2 className="text-2xl font-black text-[#16211D] dark:text-white">Akses Ditolak (403 Forbidden)</h2>
          <p className="text-xs text-[#7D938A] max-w-md mx-auto">
            Peran akun Anda (<strong>{currentUser?.username}</strong>) tidak memiliki perizinan ACL untuk membuka modul <code>{currentScreen}</code>.
          </p>
          <Button onClick={() => setCurrentScreen(allowedMenuIds[0] || 'dashboard')} variant="primary" className="text-xs">
            Kembali ke Dashboard
          </Button>
        </div>
      );
    }

    switch (currentScreen) {
      case 'dashboard':
        return (
          <DashboardPage
            onNavigate={(screen) => setCurrentScreen(screen)}
            onOpenQuickZis={() => setIsQuickZisModalOpen(true)}
          />
        );
      case 'penerimaan':
        return (
          <PenerimaanPage
            onNavigate={(screen) => setCurrentScreen(screen)}
            onSelectTrx={(id) => {
              setSelectedTrxId(id);
              toast.info(`Membuka Detail Transaksi Penerimaan #${id}`);
            }}
          />
        );
      case 'penyaluran':
        return (
          <PenyaluranPage
            onNavigate={(screen) => setCurrentScreen(screen)}
            onSelectSalur={(id) => {
              toast.info(`Membuka Detail Penyaluran #${id}`);
            }}
          />
        );
      case 'muzakki':
        return (
          <MuzakkiPage
            onNavigate={(screen) => setCurrentScreen(screen)}
            onSelectMuzakki={(id) => toast.info(`Membuka Profil Muzakki #${id}`)}
          />
        );
      case 'mustahik':
        return (
          <MustahikPage
            onNavigate={(screen) => setCurrentScreen(screen)}
            onSelectMustahik={(id) => toast.info(`Membuka Profil Mustahik #${id}`)}
          />
        );
      case 'program':
        return <ProgramPage onNavigate={(screen) => setCurrentScreen(screen)} />;
      case 'mitra':
        return <MitraPage onNavigate={(screen) => setCurrentScreen(screen)} />;
      case 'upz':
        return <UpzPage onNavigate={(screen) => setCurrentScreen(screen)} />;
      case 'payroll':
        return <PayrollPage onNavigate={(screen) => setCurrentScreen(screen)} />;
      case 'laporan':
        return <LaporanKeuanganPage onNavigate={(screen) => setCurrentScreen(screen)} />;
      case 'jurnal':
        return <JurnalGLPage onNavigate={(screen) => setCurrentScreen(screen)} />;
      case 'closing':
        return <ClosingPage />;
      case 'simba':
        return <SimbaPage />;
      case 'kalkulator':
        return <KalkulatorPage onOpenQuickZis={() => setIsQuickZisModalOpen(true)} />;
      case 'peta':
        return <PetaSebaranPage />;
      case 'portal':
        return <PortalPublicPage />;
      case 'inbox':
        return <InboxPage onNavigate={(screen) => setCurrentScreen(screen)} />;
      case 'cms-hero':
        return <HeroSliderPage />;
      case 'cms-campaigns':
        return <CampaignsManagementPage />;
      case 'cms-distributions':
        return <DistributionsManagementPage />;
      case 'cms-testimonials':
        return <TestimonialsManagementPage />;
      case 'cms-faqs':
        return <FaqManagementPage />;
      case 'cms-impact':
        return <ImpactManagementPage />;
      case 'cms-assistance':
        return <AssistanceManagementPage />;
      case 'cms-settings':
        return <WebSettingsPage />;
      case 'user-management':
        return <UserManagementPage />;
      case 'module-management':
        return <ModuleManagementPage />;
      case 'permission-management':
        return <PermissionManagementPage />;
      case 'acl-management':
        return <AclManagementPage />;
      case 'approval':
        return <ApprovalPage />;
      case 'login':
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;
      default:
        return <GenericPage screenId={currentScreen} onNavigate={(screen) => setCurrentScreen(screen)} />;

    }
  };


  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-[#0D1714] flex flex-col items-center justify-center text-white space-y-4 font-sans">
        <div className="w-12 h-12 border-4 border-[#0F9D6E] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-extrabold text-[#A5E4CB] uppercase tracking-wider">
          Memeriksa Sesi Autentikasi 24 Jam...
        </p>
      </div>
    );
  }

  if (!isLoggedIn || currentScreen === 'login') {
    return (
      <QueryClientProvider client={queryClient}>
        <LoginPage onLoginSuccess={handleLoginSuccess} />
        <Toaster position="top-right" richColors closeButton />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AppLayout
        currentScreen={currentScreen}
        onNavigate={(screen) => setCurrentScreen(screen)}
        onOpenQuickZis={() => setIsQuickZisModalOpen(true)}
        onLogout={handleLogout}
        navigation={navigation}
        currentUser={currentUser}
      >
        {renderScreen()}
      </AppLayout>

      {/* Toast Notifications */}
      <Toaster position="top-right" richColors closeButton />

      {/* Quick ZIS Transaction Modal */}
      <Modal
        isOpen={isQuickZisModalOpen}
        onClose={() => setIsQuickZisModalOpen(false)}
        title="Catat Penerimaan ZIS Kilat"
        subtitle="Entri cepat transaksi setoran zakat di konter atau via transfer bank"
        maxWidth="md"
      >
        <form onSubmit={handleQuickZisSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Jenis ZIS *</label>
            <select
              value={quickJenis}
              onChange={(e) => setQuickJenis(e.target.value)}
              className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl"
            >
              <option value="Zakat Maal">Zakat Maal</option>
              <option value="Zakat Profesi">Zakat Profesi</option>
              <option value="Zakat Fitrah">Zakat Fitrah</option>
              <option value="Infak">Infak</option>
              <option value="Shodaqoh">Shodaqoh</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nominal Setoran (Rp) *</label>
            <input
              type="number"
              value={quickNominal}
              onChange={(e) => setQuickNominal(Number(e.target.value))}
              placeholder="Contoh: 1000000"
              className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t">
            <Button type="button" variant="outline" onClick={() => setIsQuickZisModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary">
              Simpan & Cetak Kwitansi
            </Button>
          </div>
        </form>
      </Modal>
    </QueryClientProvider>
  );
}

export default App;
