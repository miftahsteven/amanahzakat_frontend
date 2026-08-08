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
import { Modal } from './components/ui/Modal';
import { Button } from './components/ui/Button';

export function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentScreen, setCurrentScreen] = useState<string>('dashboard');
  const [selectedTrxId, setSelectedTrxId] = useState<string | null>(null);
  const [isQuickZisModalOpen, setIsQuickZisModalOpen] = useState<boolean>(false);

  // Quick ZIS Form State
  const [quickNominal, setQuickNominal] = useState<number>(1000000);
  const [quickJenis, setQuickJenis] = useState<string>('Zakat Maal');

  const handleQuickZisSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Penerimaan ZIS baru ${quickJenis} sebesar Rp ${quickNominal.toLocaleString('id-ID')} berhasil dicatat!`);
    setIsQuickZisModalOpen(false);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentScreen('login');
    toast.info('Anda telah keluar dari sistem ERP AmanahZakat');
  };

  const renderScreen = () => {
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
      case 'login':
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;
      default:
        return <GenericPage screenId={currentScreen} onNavigate={(screen) => setCurrentScreen(screen)} />;
    }
  };

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
