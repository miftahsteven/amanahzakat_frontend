import { formatRP } from './utils';

export type BszRecord = {
  id: string;
  noKwitansi: string;
  noSbmz?: string | null;
  tanggal: string;
  muzakkiNama: string;
  muzakkiTipe?: string;
  jenisZis: string;
  nominal: number;
  kanal: string;
  status?: string;
  catatan?: string | null;
  /** Signed public verify URL from backend (QR payload). */
  verifyUrl?: string | null;
};

export function formatBszDate(tanggal: string): string {
  if (!tanggal) return '-';
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(tanggal)) return tanggal;
  if (/^\d{4}-\d{2}-\d{2}/.test(tanggal)) {
    const [y, m, d] = tanggal.slice(0, 10).split('-');
    return `${d}/${m}/${y}`;
  }
  const parsed = new Date(tanggal);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
  return tanggal;
}

export function getAkunGlPenerimaan(jenisZis: string): string {
  if (jenisZis.includes('Maal')) return '4011000030 - Penerimaan Zakat Maal';
  if (jenisZis.includes('Profesi')) return '4011000031 - Penerimaan Zakat Profesi';
  if (jenisZis.includes('Fitrah')) return '4011000032 - Penerimaan Zakat Fitrah';
  if (jenisZis === 'Infak' || jenisZis.includes('Infak')) return '4021000010 - Penerimaan Infak';
  if (jenisZis === 'Shodaqoh' || jenisZis.includes('Shodaqoh')) return '4021000020 - Penerimaan Shodaqoh';
  if (jenisZis.includes('Wakaf')) return '4031000010 - Penerimaan Wakaf Uang';
  return '4011000030 - Penerimaan ZIS';
}

export function buildSbmzNumber(row: Pick<BszRecord, 'noKwitansi' | 'noSbmz' | 'tanggal'>): string {
  if (row.noSbmz) return row.noSbmz;
  const tgl = formatBszDate(row.tanggal);
  const parts = tgl.split('/');
  const yy = parts[2]?.slice(2) || '26';
  const mm = parts[1] || '01';
  const dd = parts[0] || '01';
  const code = (row.noKwitansi || '').replace(/[^0-9A-Za-z]/g, '').slice(-9) || `${yy}${mm}${dd}001`;
  return `SBMZ/20${yy}/${mm}/${code}`;
}

/** Display host/path without scheme for compact UI under QR. */
export function displayVerifyUrl(verifyUrl: string): string {
  return verifyUrl.replace(/^https?:\/\//i, '');
}

export function jenisDanaBadgeClass(jenis: string): string {
  const j = jenis.toLowerCase();
  if (j.includes('wakaf')) {
    return 'bg-violet-50 text-violet-700 border-violet-200';
  }
  if (j.includes('infak') || j.includes('shodaqoh') || j.includes('infaq')) {
    return 'bg-amber-50 text-amber-800 border-amber-200';
  }
  if (j.includes('zakat')) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }
  return 'bg-slate-100 text-slate-700 border-slate-200';
}

export function qrImageUrl(payload: string, size = 120): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(payload)}`;
}

export function toBszPrintFilename(noBukti: string): string {
  return `Bukti-Setor-${noBukti.replace(/\//g, '-')}.pdf`;
}

export function formatBszNominal(nominal: number): string {
  return formatRP(nominal);
}
