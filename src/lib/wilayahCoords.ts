/** Koordinat pusat wilayah (lat, lng) — selaras dengan deteksi backend */
export const WILAYAH_COORDS: Record<string, { lat: number; lng: number; label: string }> = {
  dki: { lat: -6.2088, lng: 106.8456, label: 'DKI Jakarta' },
  jabar: { lat: -6.9175, lng: 107.6191, label: 'Jawa Barat' },
  banten: { lat: -6.4058, lng: 106.064, label: 'Banten' },
  ntb: { lat: -8.5833, lng: 116.1167, label: 'NTB' },
  lainnya: { lat: -2.5489, lng: 118.0149, label: 'Wilayah Lainnya' },
};

const NAMA_KEYWORDS: { id: string; keywords: string[] }[] = [
  { id: 'dki', keywords: ['jakarta', 'dki'] },
  { id: 'jabar', keywords: ['jawa barat', 'bandung', 'bekasi', 'bogor', 'depok', 'cileunyi', 'bojongsoang', 'arcamanik'] },
  { id: 'banten', keywords: ['banten', 'tangerang', 'serang', 'cikupa', 'lebak'] },
  { id: 'ntb', keywords: ['ntb', 'ntt', 'lombok', 'sumbawa', 'mataram', 'dompu'] },
];

export function isValidIndonesiaCoord(lat: number, lng: number): boolean {
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -11 && lat <= 6 && lng >= 95 && lng <= 141;
}

export function detectWilayahIdFromNama(nama: string): string {
  const lower = nama.toLowerCase();
  for (const rule of NAMA_KEYWORDS) {
    if (rule.keywords.some((k) => lower.includes(k))) return rule.id;
  }
  return 'lainnya';
}

export function resolveWilayahCoords(w: {
  id?: string;
  nama: string;
  lat?: number | null;
  lng?: number | null;
}): { lat: number; lng: number } {
  const lat = w.lat != null ? Number(w.lat) : NaN;
  const lng = w.lng != null ? Number(w.lng) : NaN;

  if (isValidIndonesiaCoord(lat, lng)) {
    return { lat, lng };
  }

  const id = w.id && WILAYAH_COORDS[w.id] ? w.id : detectWilayahIdFromNama(w.nama);
  const fallback = WILAYAH_COORDS[id] ?? WILAYAH_COORDS.lainnya;
  return { lat: fallback.lat, lng: fallback.lng };
}
