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
      return 'bg-[#E6F7EE] text-[#0B9D6D] border-[#A3DBC8]';
    case 'Menunggu Verifikasi':
    case 'Sedang Diproses':
    case 'Siap Bayar':
    case 'Perlu Survei':
    case 'Survei Lapangan':
    case 'Disetujui Verifikator':
    case 'Terbuka':
    case 'Draft':
    case 'Perlu Audit':
      return 'bg-[#F7F0E0] text-[#C8933B] border-[#F7F0E0]';
    case 'Ditolak':
    case 'Indikasi Ganda':
    case 'Tertunda':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-[#EBEFEB] text-[#8A9691] border-[#D4DBD6]';
  }
}
