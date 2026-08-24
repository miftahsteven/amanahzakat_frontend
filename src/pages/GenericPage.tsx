import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { DataTable } from '../components/shared/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import {
  FolderKanban,
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
  CheckCircle2,
} from 'lucide-react';
import {
  INITIAL_KAMPANYE,
  INITIAL_AMIL,
  INITIAL_COA,
} from '../mock/mockData';
import { formatRP } from '../lib/utils';
import { toast } from 'sonner';

export interface GenericPageProps {
  screenId: string;
  onNavigate: (screen: string) => void;
}

export const GenericPage: React.FC<GenericPageProps> = ({ screenId, onNavigate }) => {
  // Render Kampanye Page
  if (screenId === 'kampanye') {
    const cols: ColumnDef<any, any>[] = [
      { accessorKey: 'judul', header: 'Judul Kampanye', cell: ({ row }: any) => <span className="font-bold text-[#16211D]">{row.getValue('judul')}</span> },
      { accessorKey: 'pilar', header: 'Pilar', cell: ({ row }: any) => <Badge variant="emerald">{row.getValue('pilar')}</Badge> },
      { accessorKey: 'targetDana', header: 'Target', cell: ({ row }: any) => <span>{formatRP(row.getValue('targetDana'))}</span> },
      { accessorKey: 'terkumpulDana', header: 'Terkumpul', cell: ({ row }: any) => <span className="font-bold text-[#0F9D6E]">{formatRP(row.getValue('terkumpulDana'))}</span> },
      { accessorKey: 'donaturCount', header: 'Donatur', cell: ({ row }: any) => <span>{row.getValue('donaturCount')} Donatur</span> },
      { accessorKey: 'status', header: 'Status', cell: ({ row }: any) => <Badge statusText={row.getValue('status')} /> },
    ];
    return (
      <div className="space-y-6 font-sans">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[25px] font-extrabold text-[#16211D] flex items-center gap-2">
              <Megaphone className="w-6 h-6 text-[#0F9D6E]" /> Galang Dana Online & Kampanye Crowdfunding
            </h1>
            <p className="text-[13px] text-[#7D938A] mt-0.5">Kampanye digital ZIS interaktif dengan QRIS & Payment Gateway</p>
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
      { accessorKey: 'nip', header: 'NIP Amil', cell: ({ row }: any) => <span className="font-mono font-bold text-[#16211D]">{row.getValue('nip')}</span> },
      { accessorKey: 'nama', header: 'Nama Amil / Staf', cell: ({ row }: any) => <span className="font-bold text-[#16211D]">{row.getValue('nama')}</span> },
      { accessorKey: 'jabatan', header: 'Jabatan', cell: ({ row }: any) => <span>{row.getValue('jabatan')}</span> },
      { accessorKey: 'divisi', header: 'Divisi', cell: ({ row }: any) => <Badge variant="blue">{row.getValue('divisi')}</Badge> },
      { accessorKey: 'gajiPokok', header: 'Gaji Pokok', cell: ({ row }: any) => <span className="font-semibold">{formatRP(row.getValue('gajiPokok'))}</span> },
      { accessorKey: 'tunjanganAmil', header: 'Hak Amil / Tunjangan', cell: ({ row }: any) => <span className="font-bold text-[#0F9D6E]">{formatRP(row.getValue('tunjanganAmil'))}</span> },
    ];
    return (
      <div className="space-y-6 font-sans">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[25px] font-extrabold text-[#16211D] flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-[#0F9D6E]" /> SDM Amil & Payroll Hak Amil (12.5%)
            </h1>
            <p className="text-[13px] text-[#7D938A] mt-0.5">Pengelolaan alokasi 1/8 Asnaf Hak Amil & Penggajian Karyawan LAZNAS</p>
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
      { accessorKey: 'kode', header: 'Kode Akun', cell: ({ row }: any) => <span className="font-mono font-bold text-[#0F9D6E]">{row.getValue('kode')}</span> },
      { accessorKey: 'nama', header: 'Nama Akun G/L', cell: ({ row }: any) => <span className="font-bold text-[#16211D]">{row.getValue('nama')}</span> },
      { accessorKey: 'tipe', header: 'Tipe Akun', cell: ({ row }: any) => <Badge variant="emerald">{row.getValue('tipe')}</Badge> },
      { accessorKey: 'grup', header: 'Grup', cell: ({ row }: any) => <span className="font-semibold text-[#7D938A]">{row.getValue('grup')}</span> },
      { accessorKey: 'saldo', header: 'Saldo Saat Ini', cell: ({ row }: any) => <span className="font-extrabold">{formatRP(row.getValue('saldo'))}</span> },
    ];
    return (
      <div className="space-y-6 font-sans">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[25px] font-extrabold text-[#16211D] flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-[#0F9D6E]" /> Master Chart of Accounts (CoA)
            </h1>
            <p className="text-[13px] text-[#7D938A] mt-0.5">Daftar Bagan Akun Standar Akuntansi Syariah PSAK 109</p>
          </div>
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => toast.success('Akun G/L Baru Ditambahkan')}>Tambah Akun G/L</Button>
        </div>
        <DataTable columns={cols} data={INITIAL_COA} searchPlaceholder="Cari kode atau nama akun..." />
      </div>
    );
  }

  // Generic View for other screens
  const screenTitles: Record<string, { title: string; desc: string; icon: React.ReactNode }> = {
    proposal: { title: 'Proposal Bantuan Mustahik', desc: 'Daftar pengajuan permohonan bantuan dari individu & lembaga', icon: <FileSpreadsheet className="w-6 h-6 text-[#0F9D6E]" /> },
    rekap: { title: 'Rekap Tahunan Setoran ZIS (SPT Pajak)', desc: 'Surat Keterangan Setoran Zakat sebagai pengurang pajak tahunan', icon: <FileSpreadsheet className="w-6 h-6 text-[#0F9D6E]" /> },
    bank: { title: 'Rekonsiliasi Bank Penampung ZIS', desc: 'Pencocokan mutasi koran BSI dengan transaksi tercatat di ERP', icon: <Landmark className="w-6 h-6 text-[#0F9D6E]" /> },
    petty: { title: 'Kas Kecil (Petty Cash) Operasional Amil', desc: 'Pengeluaran operasional kecil kantor & survei lapangan', icon: <Wallet className="w-6 h-6 text-[#0F9D6E]" /> },
    pagu: { title: 'Kebijakan Pagu Anggaran & Aturan Syariah', desc: 'Batas plafon alokasi per pilar program & rekomendasi dewan pengawas', icon: <Target className="w-6 h-6 text-[#0F9D6E]" /> },
    distribusi: { title: 'Laporan Distribusi Logistik & Qurban', desc: 'Penyaluran paket pangan sembako, hewan qurban, dan bantuan bencana', icon: <Truck className="w-6 h-6 text-[#0F9D6E]" /> },
    dampak: { title: 'Beneficiary Impact Measurement', desc: 'Laporan evaluasi dampak sosial & tingkat kemandirian ekonomi mustahik', icon: <TrendingUp className="w-6 h-6 text-[#0F9D6E]" /> },
    audit: { title: 'Audit Trail & Catatan Audit Syariah', desc: 'Log jejak aktivitas sistem & pengawasan opini syariah BAZNAS RI', icon: <ShieldAlert className="w-6 h-6 text-[#0F9D6E]" /> },
    akses: { title: 'Kontrol Akses (ACL) & Role User', desc: 'Pengaturan hak akses Super Admin, Verifikator, Amil, Kasir, Auditor', icon: <Key className="w-6 h-6 text-[#0F9D6E]" /> },
    setting: { title: 'Tampilan, Branding & Logo Lembaga', desc: 'Kustomisasi warna tema, logo LAZNAS, dan skala antarmuka', icon: <Sliders className="w-6 h-6 text-[#0F9D6E]" /> },
    arsip: { title: 'Retensi Dokumen & E-Filing Arsip', desc: 'Penyimpanan bukti kwitansi, SBMZ, LPJ mitra, dan berkas audit', icon: <Archive className="w-6 h-6 text-[#0F9D6E]" /> },
    faktur: { title: 'Faktur Vendor & Tagihan Operasional', desc: 'Verifikasi faktur tagihan supplier & pengadaan fasilitas kantor', icon: <CreditCard className="w-6 h-6 text-[#0F9D6E]" /> },
    bukti: { title: 'E-Filing Bukti Setor BSZ & SBMZ', desc: 'Arsip penomoran kwitansi BSZ sah dengan QR Code verifikasi', icon: <FileSpreadsheet className="w-6 h-6 text-[#0F9D6E]" /> },
    portalUpz: { title: 'Portal UPZ Self-Service Korporat', desc: 'Dashboard khusus mitra UPZ perusahaan untuk input payroll zakat karyawan', icon: <Building className="w-6 h-6 text-[#0F9D6E]" /> },
    approval: { title: 'Approval Berjenjang Penyaluran', desc: 'Verifikasi bertingkat Manajer Program -> Direktur untuk pencairan di atas Rp 25 juta', icon: <CheckCircle2 className="w-6 h-6 text-[#0F9D6E]" /> },
  };

  const curr = screenTitles[screenId] || {
    title: `Modul ERP: ${screenId}`,
    desc: 'Fitur pengelolaan sistem ERP Amanah Zakat aktif dalam Mode Super Admin',
    icon: <FolderKanban className="w-6 h-6 text-[#0F9D6E]" />,
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[25px] font-extrabold text-[#16211D] flex items-center gap-2">
            {curr.icon} {curr.title}
          </h1>
          <p className="text-[13px] text-[#7D938A] mt-0.5">{curr.desc}</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-[#E6F6EF] text-[#0B7C56] text-xs font-bold border border-[#BFE4D4]">
          Super Admin Mode
        </span>
      </div>

      <Card className="p-8 text-center space-y-4 bg-white border border-[#E3E8E4] rounded-2xl">
        <div className="w-16 h-16 rounded-full bg-[#E6F6EF] text-[#0F9D6E] flex items-center justify-center mx-auto shadow-xs">
          {curr.icon}
        </div>
        <h2 className="text-lg font-bold text-[#16211D]">{curr.title} Siap Digunakan</h2>
        <p className="text-xs text-[#7D938A] max-w-md mx-auto leading-relaxed">
          Modul ini telah terkonfigurasi lengkap dalam arsitektur Frontend Amanah Zakat ERP dan siap dihubungkan ke API Service Node.js / Prisma.
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
