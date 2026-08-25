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
import { LaporanDistribusiPage } from './pages/LaporanDistribusiPage';
import { LaporanKeuanganPage } from './pages/LaporanKeuanganPage';
import { PenerimaanDetailPage } from './pages/details/PenerimaanDetailPage';
import { PenyaluranDetailPage } from './pages/details/PenyaluranDetailPage';
import { MuzakkiDetailPage } from './pages/details/MuzakkiDetailPage';
import { MustahikDetailPage } from './pages/details/MustahikDetailPage';
import { ProgramDetailPage } from './pages/details/ProgramDetailPage';
import { MitraDetailPage } from './pages/details/MitraDetailPage';
import { UpzDetailPage } from './pages/details/UpzDetailPage';
import { DampakPublikPage } from './pages/DampakPublikPage';
import { JurnalGLPage } from './pages/JurnalGLPage';
import { ClosingPage } from './pages/ClosingPage';
import { SimbaPage } from './pages/SimbaPage';
import { KalkulatorPage, type QuickZisOptions } from './pages/KalkulatorPage';
import { PetaSebaranPage } from './pages/PetaSebaranPage';
import { PortalUpzPage } from './pages/PortalUpzPage';
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
import { BuktiSetorPage } from './pages/BuktiSetorPage';
import { Modal } from './components/ui/Modal';


import { Button } from './components/ui/Button';
import { authApi, isSessionValid, getStoredUser, removeStoredToken, penerimaanApi } from './lib/api';
import type { AuthUser, NavModul } from './types/acl';
import { menuCodesFromUser } from './types/acl';
import { hasPermission } from './lib/permissions';
import { IdNumberInput } from './components/ui/IdNumberInput';

type DetailModule = 'penerimaan' | 'penyaluran' | 'muzakki' | 'mustahik' | 'program' | 'mitra' | 'upz';

export function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [allowedMenuIds, setAllowedMenuIds] = useState<string[]>([]);
  const [navigation, setNavigation] = useState<NavModul[]>([]);
  const [currentScreen, setCurrentScreen] = useState<string>('dashboard');
  const [detailRoute, setDetailRoute] = useState<{ module: DetailModule; id: string } | null>(null);
  const [isQuickZisModalOpen, setIsQuickZisModalOpen] = useState<boolean>(false);
  const [isCheckingSession, setIsCheckingSession] = useState<boolean>(true);

  // Quick ZIS Form State
  const [quickNominal, setQuickNominal] = useState<number>(1000000);
  const [quickJenis, setQuickJenis] = useState<string>('Zakat Maal');
  const [quickMuzakkiId, setQuickMuzakkiId] = useState<string>('');
  const [quickKanal, setQuickKanal] = useState<string>('Cash / Konter');
  const [quickMuzakkiList, setQuickMuzakkiList] = useState<Array<{ id: string; nama: string; nomor: string }>>([]);
  const [quickSubmitting, setQuickSubmitting] = useState(false);
  const [quickLoadingMuzakki, setQuickLoadingMuzakki] = useState(false);

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

  React.useEffect(() => {
    if (!isQuickZisModalOpen) return;

    setQuickLoadingMuzakki(true);
    penerimaanApi
      .listMuzakki()
      .then((rows) => {
        setQuickMuzakkiList(rows);
        if (rows.length > 0 && !quickMuzakkiId) {
          setQuickMuzakkiId(rows[0].id);
        }
      })
      .catch((err: Error) => {
        toast.error(err.message || 'Gagal memuat daftar muzakki');
      })
      .finally(() => setQuickLoadingMuzakki(false));
  }, [isQuickZisModalOpen]);

  const handleQuickZisSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickMuzakkiId) {
      toast.error('Pilih muzakki terlebih dahulu');
      return;
    }
    if (!quickNominal || quickNominal < 10000) {
      toast.error('Nominal minimal Rp 10.000');
      return;
    }

    setQuickSubmitting(true);
    try {
      const created = await penerimaanApi.create({
        muzakkiId: quickMuzakkiId,
        jenisZis: quickJenis,
        nominal: quickNominal,
        kanal: quickKanal,
      });
      toast.success(
        `Penerimaan ${quickJenis} Rp ${quickNominal.toLocaleString('id-ID')} tercatat — Kwitansi ${created.noKwitansi}`
      );
      setIsQuickZisModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Gagal mencatat penerimaan');
    } finally {
      setQuickSubmitting(false);
    }
  };

  const openQuickZis = (opts?: QuickZisOptions) => {
    if (opts?.nominal && opts.nominal > 0) setQuickNominal(opts.nominal);
    if (opts?.jenis) setQuickJenis(opts.jenis);
    setIsQuickZisModalOpen(true);
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

    if (detailRoute) {
      switch (detailRoute.module) {
        case 'penerimaan':
          return <PenerimaanDetailPage id={detailRoute.id} onBack={() => setDetailRoute(null)} />;
        case 'penyaluran':
          return <PenyaluranDetailPage id={detailRoute.id} onBack={() => setDetailRoute(null)} />;
        case 'muzakki':
          return <MuzakkiDetailPage id={detailRoute.id} onBack={() => setDetailRoute(null)} />;
        case 'mustahik':
          return <MustahikDetailPage id={detailRoute.id} onBack={() => setDetailRoute(null)} />;
        case 'program':
          return <ProgramDetailPage id={detailRoute.id} onBack={() => setDetailRoute(null)} />;
        case 'mitra':
          return <MitraDetailPage id={detailRoute.id} onBack={() => setDetailRoute(null)} />;
        case 'upz':
          return <UpzDetailPage id={detailRoute.id} onBack={() => setDetailRoute(null)} />;
      }
    }

    switch (currentScreen) {
      case 'dashboard':
        return (
          <DashboardPage
            onNavigate={(screen) => setCurrentScreen(screen)}
            onOpenQuickZis={() => openQuickZis()}
          />
        );
      case 'penerimaan':
        return (
          <PenerimaanPage
            onNavigate={(screen) => setCurrentScreen(screen)}
            onOpenDetail={(id) => setDetailRoute({ module: 'penerimaan', id })}
            canCreate={hasPermission(currentUser, 'penerimaan.create')}
            canUpdate={hasPermission(currentUser, 'penerimaan.update')}
            canDelete={hasPermission(currentUser, 'penerimaan.delete')}
            canVerify={hasPermission(currentUser, 'penerimaan.verify')}
          />
        );
      case 'penyaluran':
        return (
          <PenyaluranPage
            onNavigate={(screen) => setCurrentScreen(screen)}
            onOpenDetail={(id) => setDetailRoute({ module: 'penyaluran', id })}
            canCreate={hasPermission(currentUser, 'penyaluran.create')}
            canUpdate={hasPermission(currentUser, 'penyaluran.update')}
            canDelete={hasPermission(currentUser, 'penyaluran.delete')}
            canVerify={hasPermission(currentUser, 'penyaluran.verify')}
          />
        );
      case 'muzakki':
        return (
          <MuzakkiPage
            onNavigate={(screen) => setCurrentScreen(screen)}
            onOpenDetail={(id) => setDetailRoute({ module: 'muzakki', id })}
            canCreate={hasPermission(currentUser, 'muzakki.create')}
            canUpdate={hasPermission(currentUser, 'muzakki.update')}
            canDelete={hasPermission(currentUser, 'muzakki.delete')}
          />
        );
      case 'mustahik':
        return (
          <MustahikPage
            onNavigate={(screen) => setCurrentScreen(screen)}
            onOpenDetail={(id) => setDetailRoute({ module: 'mustahik', id })}
            canCreate={hasPermission(currentUser, 'mustahik.create')}
            canUpdate={hasPermission(currentUser, 'mustahik.update')}
            canDelete={hasPermission(currentUser, 'mustahik.delete')}
          />
        );
      case 'program':
        return (
          <ProgramPage
            onNavigate={(screen) => setCurrentScreen(screen)}
            onOpenDetail={(id) => setDetailRoute({ module: 'program', id })}
            canUpdate={hasPermission(currentUser, 'program.update')}
            canDelete={hasPermission(currentUser, 'program.delete')}
          />
        );
      case 'mitra':
        return (
          <MitraPage
            onNavigate={(screen) => setCurrentScreen(screen)}
            onOpenDetail={(id) => setDetailRoute({ module: 'mitra', id })}
            canCreate={hasPermission(currentUser, 'mitra.create')}
            canUpdate={hasPermission(currentUser, 'mitra.update')}
          />
        );
      case 'upz':
        return (
          <UpzPage
            onNavigate={(screen) => setCurrentScreen(screen)}
            onOpenDetail={(id) => setDetailRoute({ module: 'upz', id })}
            canUpdate={hasPermission(currentUser, 'upz.update')}
          />
        );
      case 'payroll':
        return <PayrollPage onNavigate={(screen) => setCurrentScreen(screen)} canUpdate={hasPermission(currentUser, 'payroll.update')} />;
      case 'laporan':
        return <LaporanDistribusiPage onNavigate={(screen) => setCurrentScreen(screen)} />;
      case 'laporan-keuangan':
        return <LaporanKeuanganPage onNavigate={(screen) => setCurrentScreen(screen)} />;
      case 'jurnal':
        return <JurnalGLPage onNavigate={(screen) => setCurrentScreen(screen)} canCreate={hasPermission(currentUser, 'jurnal.create')} />;
      case 'closing':
        return <ClosingPage canExecute={hasPermission(currentUser, 'closing.execute')} />;
      case 'simba':
        return <SimbaPage canExport={hasPermission(currentUser, 'simba.export')} />;
      case 'kalkulator':
        return (
          <KalkulatorPage
            onOpenQuickZis={openQuickZis}
            canUpdate={hasPermission(currentUser, 'kalkulator.update')}
          />
        );
      case 'peta':
        return <PetaSebaranPage />;
      case 'dampak':
        return <DampakPublikPage />;
      case 'portalUpz':
        return <PortalUpzPage />;
      case 'portal':
        return <PortalPublicPage onNavigate={(screen) => setCurrentScreen(screen)} />;
      case 'inbox':
        return <InboxPage onNavigate={(screen) => setCurrentScreen(screen)} />;
      case 'cms-hero':
        return (
          <HeroSliderPage
            canCreate={hasPermission(currentUser, 'cms-hero.create')}
            canUpdate={hasPermission(currentUser, 'cms-hero.update')}
            canDelete={hasPermission(currentUser, 'cms-hero.delete')}
          />
        );
      case 'cms-campaigns':
        return (
          <CampaignsManagementPage
            canCreate={hasPermission(currentUser, 'cms-campaigns.create')}
            canUpdate={hasPermission(currentUser, 'cms-campaigns.update')}
            canDelete={hasPermission(currentUser, 'cms-campaigns.delete')}
          />
        );
      case 'cms-distributions':
        return (
          <DistributionsManagementPage
            canCreate={hasPermission(currentUser, 'cms-distributions.create')}
            canUpdate={hasPermission(currentUser, 'cms-distributions.update')}
            canDelete={hasPermission(currentUser, 'cms-distributions.delete')}
          />
        );
      case 'cms-testimonials':
        return (
          <TestimonialsManagementPage
            canCreate={hasPermission(currentUser, 'cms-testimonials.create')}
            canUpdate={hasPermission(currentUser, 'cms-testimonials.update')}
            canDelete={hasPermission(currentUser, 'cms-testimonials.delete')}
          />
        );
      case 'cms-faqs':
        return (
          <FaqManagementPage
            canCreate={hasPermission(currentUser, 'cms-faqs.create')}
            canUpdate={hasPermission(currentUser, 'cms-faqs.update')}
            canDelete={hasPermission(currentUser, 'cms-faqs.delete')}
          />
        );
      case 'cms-impact':
        return <ImpactManagementPage canUpdate={hasPermission(currentUser, 'cms-impact.update')} />;
      case 'cms-assistance':
        return <AssistanceManagementPage canVerify={hasPermission(currentUser, 'cms-assistance.verify')} />;
      case 'cms-settings':
        return <WebSettingsPage canUpdate={hasPermission(currentUser, 'cms-settings.update')} />;
      case 'user-management':
        return <UserManagementPage canManage={hasPermission(currentUser, 'user-management.manage')} />;
      case 'module-management':
        return <ModuleManagementPage canManage={hasPermission(currentUser, 'module-management.manage')} />;
      case 'permission-management':
        return <PermissionManagementPage canManage={hasPermission(currentUser, 'permission-management.manage')} />;
      case 'acl-management':
        return <AclManagementPage canManage={hasPermission(currentUser, 'acl-management.manage')} />;
      case 'approval':
        return (
          <ApprovalPage
            canApprove={hasPermission(currentUser, 'approval.approve')}
            canReject={hasPermission(currentUser, 'approval.reject')}
            onOpenPenyaluran={(id) => setDetailRoute({ module: 'penyaluran', id })}
          />
        );
      case 'bukti':
        return <BuktiSetorPage />;
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
        onNavigate={(screen) => {
          setDetailRoute(null);
          setCurrentScreen(screen);
        }}
        onOpenQuickZis={openQuickZis}
        onSearchSelect={(screen, id) => {
          setCurrentScreen(screen);
          const detailModules: DetailModule[] = [
            'penerimaan',
            'penyaluran',
            'muzakki',
            'mustahik',
            'program',
            'mitra',
            'upz',
          ];
          if (id && detailModules.includes(screen as DetailModule)) {
            setDetailRoute({ module: screen as DetailModule, id });
          } else {
            setDetailRoute(null);
          }
        }}
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
        maximizable
      >
        <form onSubmit={handleQuickZisSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Muzakki *</label>
            <select
              value={quickMuzakkiId}
              onChange={(e) => setQuickMuzakkiId(e.target.value)}
              disabled={quickLoadingMuzakki}
              className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl"
            >
              {quickLoadingMuzakki && <option value="">Memuat muzakki…</option>}
              {!quickLoadingMuzakki && quickMuzakkiList.length === 0 && (
                <option value="">Belum ada muzakki terdaftar</option>
              )}
              {quickMuzakkiList.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nomor} — {m.nama}
                </option>
              ))}
            </select>
          </div>

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
            <IdNumberInput
              value={quickNominal}
              onValueChange={setQuickNominal}
              placeholder="Contoh: 1.000.000"
              className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kanal Pembayaran *</label>
            <select
              value={quickKanal}
              onChange={(e) => setQuickKanal(e.target.value)}
              className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl"
            >
              <option value="Cash / Konter">Cash / Konter</option>
              <option value="Transfer Bank BSI">Transfer Bank BSI</option>
              <option value="QRIS">QRIS</option>
              <option value="Payroll UPZ">Payroll UPZ</option>
              <option value="Marketplace">Marketplace</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t">
            <Button type="button" variant="outline" onClick={() => setIsQuickZisModalOpen(false)} disabled={quickSubmitting}>
              Batal
            </Button>
            <Button type="submit" variant="primary" disabled={quickSubmitting || quickLoadingMuzakki}>
              {quickSubmitting ? 'Menyimpan…' : 'Simpan & Cetak Kwitansi'}
            </Button>
          </div>
        </form>
      </Modal>
    </QueryClientProvider>
  );
}

export default App;
