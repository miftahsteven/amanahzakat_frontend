import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRP(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val)) return 'Rp 0';
  return 'Rp ' + Math.round(val).toLocaleString('id-ID');
}

export function formatJT(val: number | undefined | null): string {
  if (!val) return '0 Jt';
  if (val >= 1_000_000_000) {
    return (val / 1_000_000_000).toFixed(2) + ' M';
  }
  if (val >= 1_000_000) {
    return (val / 1_000_000).toFixed(1) + ' Jt';
  }
  return formatRP(val);
}

export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'Terverifikasi':
    case 'Disetujui':
    case 'Sudah Tersalurkan':
    case 'Posted':
    case 'Terkunci':
    case 'Siap Kirim':
    case 'Terbit':
    case 'Patuh':
    case 'Berjalan':
    case 'Selesai':
    case 'Sukses':
    case 'Aktif':
      return 'bg-[#E6F6EF] text-[#0B7C56] border-[#BFE4D4]';
    case 'Menunggu Verifikasi':
    case 'Sedang Diproses':
    case 'Sedang diproses':
    case 'Siap Bayar':
    case 'Perlu Survei':
    case 'Survei Lapangan':
    case 'Disetujui Verifikator':
    case 'Terbuka':
    case 'Draft':
    case 'Draf':
    case 'Perlu Audit':
    case 'Menunggu':
      return 'bg-[#FDF5EA] text-[#9C6C1A] border-[#F0DFBE]';
    case 'Ditolak':
    case 'Indikasi Ganda':
    case 'Tertunda':
    case 'Batal':
    case 'Nonaktif':
      return 'bg-[#FBEeed] text-[#B83D32] border-[#F2D1CE]';
    default:
      return 'bg-[#F1F4F1] text-[#7D938A] border-[#E3E8E4]';
  }
}

