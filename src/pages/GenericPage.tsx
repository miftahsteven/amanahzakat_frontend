import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { DataTable } from '../components/shared/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import {
  FolderKanban,
  Building2,
  Building,
  Megaphone,
  CreditCard,
  Target,
  FileSpreadsheet,
  Truck,
  TrendingUp,
  ShieldAlert,
  Key,
  Sliders,
  Archive,
  Landmark,
  Wallet,
  BookOpen,
  Plus,
  Printer,
  Download,
  CheckCircle2,
} from 'lucide-react';
import {
  INITIAL_PROGRAM,
  INITIAL_MITRA,
  INITIAL_UPZ,
  INITIAL_KAMPANYE,
  INITIAL_AMIL,
  INITIAL_PROPOSAL,
  INITIAL_COA,
} from '../mock/mockData';
import { formatRP } from '../lib/utils';
import { toast } from 'sonner';

export interface GenericPageProps {
  screenId: string;
  onNavigate: (screen: string) => void;
}

export const GenericPage: React.FC<GenericPageProps> = ({ screenId, onNavigate }) => {
  // Render Program Page
  if (screenId === 'program') {
    const cols: ColumnDef<any, any>[] = [
      { accessorKey: 'nama', header: 'Nama Program', cell: ({ row }: any) => <span className="font-bold text-slate-800 dark:text-slate-200">{row.getValue('nama')}</span> },
      { accessorKey: 'pilar', header: 'Pilar ZIS', cell: ({ row }: any) => <Badge variant="emerald">{row.getValue('pilar')}</Badge> },
      { accessorKey: 'paguAnggaran', header: 'Pagu Anggaran', cell: ({ row }: any) => <span className="font-semibold">{formatRP(row.getValue('paguAnggaran'))}</span> },
      { accessorKey: 'terpakai', header: 'Realisasi Terpakai', cell: ({ row }: any) => <span className="font-extrabold text-[#0f9d6e]">{formatRP(row.getValue('terpakai'))}</span> },
      { accessorKey: 'realisasiPenerima', header: 'Target vs Realisasi', cell: ({ row }: any) => <span>{row.original.realisasiPenerima} / {row.original.targetPenerima} Mustahik</span> },
      { accessorKey: 'status', header: 'Status', cell: ({ row }: any) => <Badge statusText={row.getValue('status')} /> },
    ];
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FolderKanban className="w-6 h-6 text-[#0f9d6e]" /> Program 5 Pilar ZIS
            </h1>
            <p className="text-xs text-slate-500">Pendidikan, Kesehatan, Ekonomi, Dakwah, dan Kemanusiaan</p>
          </div>
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => toast.success('Program ZIS Baru Ditambahkan')}>Buat Program Baru</Button>
        </div>
        <DataTable columns={cols} data={INITIAL_PROGRAM} searchPlaceholder="Cari program pilar..." />
      </div>
    );
  }

  // Render Mitra Page
  if (screenId === 'mitra') {
    const cols: ColumnDef<any, any>[] = [
      { accessorKey: 'nama', header: 'Nama Lembaga Mitra', cell: ({ row }: any) => <span className="font-bold">{row.getValue('nama')}</span> },
      { accessorKey: 'bentukLembaga', header: 'Bentuk Lembaga', cell: ({ row }: any) => <Badge variant="blue">{row.getValue('bentukLembaga')}</Badge> },
      { accessorKey: 'noMou', header: 'No. MoU', cell: ({ row }: any) => <span className="font-mono">{row.getValue('noMou')}</span> },
      { accessorKey: 'totalPenyaluran', header: 'Dana Dikelola', cell: ({ row }: any) => <span className="font-bold text-[#0f9d6e]">{formatRP(row.getValue('totalPenyaluran'))}</span> },
      { accessorKey: 'statusLaporanLpj', header: 'Status LPJ', cell: ({ row }: any) => <Badge statusText={row.getValue('statusLaporanLpj')} /> },
    ];
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-[#0f9d6e]" /> Dashboard Mitra Penyalur (Partner)
            </h1>
            <p className="text-xs text-slate-500">Lembaga executing partner & audit Laporan Pertanggungjawaban (LPJ)</p>
          </div>
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => toast.success('Mitra Penyalur Baru Terdaftar')}>Tambah Mitra Baru</Button>
        </div>
        <DataTable columns={cols} data={INITIAL_MITRA} searchPlaceholder="Cari nama mitra atau MoU..." />
      </div>
    );
  }

  // Render UPZ Page
  if (screenId === 'upz') {
    const cols: ColumnDef<any, any>[] = [
      { accessorKey: 'kodeUpz', header: 'Kode UPZ', cell: ({ row }: any) => <span className="font-mono font-bold">{row.getValue('kodeUpz')}</span> },
      { accessorKey: 'nama', header: 'Nama Unit UPZ', cell: ({ row }: any) => <span className="font-bold">{row.getValue('nama')}</span> },
      { accessorKey: 'kategori', header: 'Kategori UPZ', cell: ({ row }: any) => <Badge variant="emerald">{row.getValue('kategori')}</Badge> },
      { accessorKey: 'totalPenghimpunan', header: 'Total Penghimpunan', cell: ({ row }: any) => <span className="font-extrabold text-[#0f9d6e]">{formatRP(row.getValue('totalPenghimpunan'))}</span> },
      { accessorKey: 'hakPengelolaanPct', header: 'Hak Operasional', cell: ({ row }: any) => <span className="font-bold text-amber-600">{row.getValue('hakPengelolaanPct')}%</span> },
      { accessorKey: 'statusKepatuhan', header: 'Status Audit', cell: ({ row }: any) => <Badge statusText={row.getValue('statusKepatuhan')} /> },
    ];
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Building className="w-6 h-6 text-[#0f9d6e]" /> UPZ (Unit Pengumpul Zakat) Cabang
            </h1>
            <p className="text-xs text-slate-500">Manajemen UPZ Masjid, Instansi Pemerintah, BUMN, dan Kampus</p>
          </div>
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => toast.success('UPZ Cabang Baru Terdaftar')}>Registrasi UPZ</Button>
        </div>
        <DataTable columns={cols} data={INITIAL_UPZ} searchPlaceholder="Cari UPZ..." />
      </div>
    );
  }

  // Render Kampanye Page
  if (screenId === 'kampanye') {
    const cols: ColumnDef<any, any>[] = [
      { accessorKey: 'judul', header: 'Judul Kampanye', cell: ({ row }: any) => <span className="font-bold">{row.getValue('judul')}</span> },
      { accessorKey: 'pilar', header: 'Pilar', cell: ({ row }: any) => <Badge variant="emerald">{row.getValue('pilar')}</Badge> },
      { accessorKey: 'targetDana', header: 'Target', cell: ({ row }: any) => <span>{formatRP(row.getValue('targetDana'))}</span> },
      { accessorKey: 'terkumpulDana', header: 'Terkumpul', cell: ({ row }: any) => <span className="font-bold text-[#0f9d6e]">{formatRP(row.getValue('terkumpulDana'))}</span> },
      { accessorKey: 'donaturCount', header: 'Donatur', cell: ({ row }: any) => <span>{row.getValue('donaturCount')} Donatur</span> },
      { accessorKey: 'status', header: 'Status', cell: ({ row }: any) => <Badge statusText={row.getValue('status')} /> },
    ];
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Megaphone className="w-6 h-6 text-[#0f9d6e]" /> Galang Dana Online & Kampanye Crowdfunding
            </h1>
            <p className="text-xs text-slate-500">Kampanye digital ZIS interaktif dengan QRIS & Payment Gateway</p>
          </div>
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => toast.success('Kampanye Baru Diluncurkan')}>Buat Kampanye Baru</Button>
        </div>
        <DataTable columns={cols} data={INITIAL_KAMPANYE} searchPlaceholder="Cari kampanye..." />
      </div>
    );
  }

  // Render Amil & Payroll Page
  if (screenId === 'amil' || screenId === 'payroll') {
    const cols: ColumnDef<any, any>[] = [
      { accessorKey: 'nip', header: 'NIP Amil', cell: ({ row }: any) => <span className="font-mono font-bold">{row.getValue('nip')}</span> },
      { accessorKey: 'nama', header: 'Nama Amil / Staf', cell: ({ row }: any) => <span className="font-bold">{row.getValue('nama')}</span> },
      { accessorKey: 'jabatan', header: 'Jabatan', cell: ({ row }: any) => <span>{row.getValue('jabatan')}</span> },
      { accessorKey: 'divisi', header: 'Divisi', cell: ({ row }: any) => <Badge variant="blue">{row.getValue('divisi')}</Badge> },
      { accessorKey: 'gajiPokok', header: 'Gaji Pokok', cell: ({ row }: any) => <span className="font-semibold">{formatRP(row.getValue('gajiPokok'))}</span> },
      { accessorKey: 'tunjanganAmil', header: 'Hak Amil / Tunjangan', cell: ({ row }: any) => <span className="font-extrabold text-[#0f9d6e]">{formatRP(row.getValue('tunjanganAmil'))}</span> },
    ];
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-[#0f9d6e]" /> SDM Amil & Payroll Hak Amil (12.5%)
            </h1>
            <p className="text-xs text-slate-500">Pengelolaan alokasi 1/8 Asnaf Hak Amil & Penggajian Karyawan LAZNAS</p>
          </div>
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => toast.success('Slip Gaji Amil Agustus 2026 Diproses!')}>Proses Payroll Gaji</Button>
        </div>
        <DataTable columns={cols} data={INITIAL_AMIL} searchPlaceholder="Cari NIP atau nama amil..." />
      </div>
    );
  }

  // Render Master CoA Page
  if (screenId === 'master') {
    const cols: ColumnDef<any, any>[] = [
      { accessorKey: 'kode', header: 'Kode Akun', cell: ({ row }: any) => <span className="font-mono font-bold text-[#0f9d6e]">{row.getValue('kode')}</span> },
      { accessorKey: 'nama', header: 'Nama Akun G/L', cell: ({ row }: any) => <span className="font-bold">{row.getValue('nama')}</span> },
      { accessorKey: 'tipe', header: 'Tipe Akun', cell: ({ row }: any) => <Badge variant="emerald">{row.getValue('tipe')}</Badge> },
      { accessorKey: 'grup', header: 'Grup', cell: ({ row }: any) => <span className="font-semibold text-slate-500">{row.getValue('grup')}</span> },
      { accessorKey: 'saldo', header: 'Saldo Saat Ini', cell: ({ row }: any) => <span className="font-extrabold">{formatRP(row.getValue('saldo'))}</span> },
    ];
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-[#0f9d6e]" /> Master Chart of Accounts (CoA)
            </h1>
            <p className="text-xs text-slate-500">Daftar Bagan Akun Standar Akuntansi Syariah PSAK 109</p>
          </div>
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => toast.success('Akun G/L Baru Ditambahkan')}>Tambah Akun G/L</Button>
        </div>
        <DataTable columns={cols} data={INITIAL_COA} searchPlaceholder="Cari kode atau nama akun..." />
      </div>
    );
  }

  // Generic View for other screens
  const screenTitles: Record<string, { title: string; desc: string; icon: React.ReactNode }> = {
    proposal: { title: 'Proposal Bantuan Mustahik', desc: 'Daftar pengajuan permohonan bantuan dari individu & lembaga', icon: <FileSpreadsheet className="w-6 h-6 text-[#0f9d6e]" /> },
    rekap: { title: 'Rekap Tahunan Setoran ZIS (SPT Pajak)', desc: 'Surat Keterangan Setoran Zakat sebagai pengurang pajak tahunan', icon: <FileSpreadsheet className="w-6 h-6 text-[#0f9d6e]" /> },
    bank: { title: 'Rekonsiliasi Bank Penampung ZIS', desc: 'Pencocokan mutasi koran BSI dengan transaksi tercatat di ERP', icon: <Landmark className="w-6 h-6 text-[#0f9d6e]" /> },
    petty: { title: 'Kas Kecil (Petty Cash) Operasional Amil', desc: 'Pengeluaran operasional kecil kantor & survei lapangan', icon: <Wallet className="w-6 h-6 text-[#0f9d6e]" /> },
    pagu: { title: 'Kebijakan Pagu Anggaran & Aturan Syariah', desc: 'Batas plafon alokasi per pilar program & rekomendasi dewan pengawas', icon: <Target className="w-6 h-6 text-[#0f9d6e]" /> },
    distribusi: { title: 'Laporan Distribusi Logistik & Qurban', desc: 'Penyaluran paket pangan sembako, hewan qurban, dan bantuan bencana', icon: <Truck className="w-6 h-6 text-[#0f9d6e]" /> },
    dampak: { title: 'Beneficiary Impact Measurement', desc: 'Laporan evaluasi dampak sosial & tingkat kemandirian ekonomi mustahik', icon: <TrendingUp className="w-6 h-6 text-[#0f9d6e]" /> },
    audit: { title: 'Audit Trail & Catatan Audit Syariah', desc: 'Log jejak aktivitas sistem & pengawasan opini syariah BAZNAS RI', icon: <ShieldAlert className="w-6 h-6 text-[#0f9d6e]" /> },
    akses: { title: 'Kontrol Akses (ACL) & Role User', desc: 'Pengaturan hak akses Super Admin, Verifikator, Amil, Kasir, Auditor', icon: <Key className="w-6 h-6 text-[#0f9d6e]" /> },
    setting: { title: 'Tampilan, Branding & Logo Lembaga', desc: 'Kustomisasi warna tema, logo LAZNAS, dan skala antarmuka', icon: <Sliders className="w-6 h-6 text-[#0f9d6e]" /> },
    arsip: { title: 'Retensi Dokumen & E-Filing Arsip', desc: 'Penyimpanan bukti kwitansi, SBMZ, LPJ mitra, dan berkas audit', icon: <Archive className="w-6 h-6 text-[#0f9d6e]" /> },
    faktur: { title: 'Faktur Vendor & Tagihan Operasional', desc: 'Verifikasi faktur tagihan supplier & pengadaan fasilitas kantor', icon: <CreditCard className="w-6 h-6 text-[#0f9d6e]" /> },
    bukti: { title: 'E-Filing Bukti Setor BSZ & SBMZ', desc: 'Arsip penomoran kwitansi BSZ sah dengan QR Code verifikasi', icon: <FileSpreadsheet className="w-6 h-6 text-[#0f9d6e]" /> },
    portalUpz: { title: 'Portal UPZ Self-Service Korporat', desc: 'Dashboard khusus mitra UPZ perusahaan untuk input payroll zakat karyawan', icon: <Building className="w-6 h-6 text-[#0f9d6e]" /> },
    approval: { title: 'Approval Berjenjang Penyaluran', desc: 'Verifikasi bertingkat Manajer Program -> Direktur untuk pencairan di atas Rp 25 juta', icon: <CheckCircle2 className="w-6 h-6 text-[#0f9d6e]" /> },
  };

  const curr = screenTitles[screenId] || {
    title: `Modul ERP: ${screenId}`,
    desc: 'Fitur pengelolaan sistem ERP Amanah Zakat aktif dalam Mode Super Admin',
    icon: <FolderKanban className="w-6 h-6 text-[#0f9d6e]" />,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            {curr.icon} {curr.title}
          </h1>
          <p className="text-xs text-slate-500">{curr.desc}</p>
        </div>
        <Badge variant="emerald">Super Admin Mode</Badge>
      </div>

      <Card className="p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950 text-[#0f9d6e] flex items-center justify-center mx-auto shadow-inner">
          {curr.icon}
        </div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">{curr.title} Siap Digunakan</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Modul ini telah terkonfigurasi lengkap dalam arsitektur Frontend Amanah Zakat ERP dan siap dihubungkan ke API Service Node.js / Prisma pada Step 2.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Button variant="outline" size="sm" onClick={() => onNavigate('dashboard')}>
            Kembali ke Dashboard
          </Button>
          <Button variant="primary" size="sm" onClick={() => toast.success(`Simulasi aksi pada modul ${curr.title} berhasil!`)}>
            Simulasi Aksi Modul
          </Button>
        </div>
      </Card>
    </div>
  );
};
