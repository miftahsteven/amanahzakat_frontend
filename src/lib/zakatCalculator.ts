export interface ZakatConfigParams {
  hargaEmasPerGram: number;
  hargaBerasPerKg: number;
  nisabEmasGram: number;
  nisabBerasKg: number;
  nisabPertanianKg: number;
  zakatRate: number;
  fitrahKgPerJiwa: number;
}

export interface ZakatConfigView extends ZakatConfigParams {
  id: string;
  nisabEmasNominal: number;
  nisabProfesiBulanan: number;
  fitrahNominalPerJiwa: number;
  updatedAt: string;
  updatedById?: string | null;
}

export const DEFAULT_ZAKAT_CONFIG: ZakatConfigParams = {
  hargaEmasPerGram: 1_450_000,
  hargaBerasPerKg: 15_000,
  nisabEmasGram: 85,
  nisabBerasKg: 522,
  nisabPertanianKg: 653,
  zakatRate: 0.025,
  fitrahKgPerJiwa: 2.5,
};

export function buildZakatConfigView(raw: ZakatConfigParams & Partial<{ id: string; updatedAt: string }>): ZakatConfigView {
  const nisabEmasNominal = Math.round(raw.nisabEmasGram * raw.hargaEmasPerGram);
  const nisabProfesiBulanan = Math.round((raw.nisabBerasKg * raw.hargaBerasPerKg) / 12);
  const fitrahNominalPerJiwa = Math.round(raw.fitrahKgPerJiwa * raw.hargaBerasPerKg);

  return {
    ...raw,
    id: raw.id ?? 'default-zakat-config',
    nisabEmasNominal,
    nisabProfesiBulanan,
    fitrahNominalPerJiwa,
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
  };
}

export interface ZakatProfesiResult {
  pendapatanBulanan: number;
  bonus: number;
  totalPendapatan: number;
  nisabBulanan: number;
  wajibZakat: boolean;
  zakatHarusDibayar: number;
}

export function hitungZakatProfesi(
  config: ZakatConfigParams,
  pendapatanBulanan: number,
  bonus: number = 0,
  kebutuhanPokok: number = 0
): ZakatProfesiResult {
  const bruto = pendapatanBulanan + bonus;
  const totalPendapatan = kebutuhanPokok > 0 ? Math.max(0, bruto - kebutuhanPokok) : bruto;
  const nisabBulanan = Math.round((config.nisabBerasKg * config.hargaBerasPerKg) / 12);
  const wajibZakat = totalPendapatan >= nisabBulanan;
  const zakatHarusDibayar = wajibZakat ? Math.round(totalPendapatan * config.zakatRate) : 0;

  return {
    pendapatanBulanan,
    bonus,
    totalPendapatan,
    nisabBulanan,
    wajibZakat,
    zakatHarusDibayar,
  };
}

export interface ZakatMaalResult {
  tabungan: number;
  investasi: number;
  emas: number;
  piutangLancar: number;
  hutangJatuhTempo: number;
  totalHartaBersih: number;
  nisabNominal: number;
  wajibZakat: boolean;
  zakatHarusDibayar: number;
}

export function hitungZakatMaal(
  config: ZakatConfigParams,
  tabungan: number,
  investasi: number,
  emasGram: number,
  piutangLancar: number,
  hutangJatuhTempo: number
): ZakatMaalResult {
  const nilaiEmas = emasGram * config.hargaEmasPerGram;
  const totalHarta = tabungan + investasi + nilaiEmas + piutangLancar;
  const totalHartaBersih = Math.max(0, totalHarta - hutangJatuhTempo);
  const nisabNominal = Math.round(config.nisabEmasGram * config.hargaEmasPerGram);
  const wajibZakat = totalHartaBersih >= nisabNominal;
  const zakatHarusDibayar = wajibZakat ? Math.round(totalHartaBersih * config.zakatRate) : 0;

  return {
    tabungan,
    investasi,
    emas: emasGram,
    piutangLancar,
    hutangJatuhTempo,
    totalHartaBersih,
    nisabNominal,
    wajibZakat,
    zakatHarusDibayar,
  };
}

export interface ZakatPertanianResult {
  hasilPanenKg: number;
  hargaKg: number;
  irigasiBerbayar: boolean;
  totalNilai: number;
  nisabKg: number;
  wajibZakat: boolean;
  zakatBerasKg: number;
  zakatNominal: number;
}

export function hitungZakatPertanian(
  config: ZakatConfigParams,
  hasilPanenKg: number,
  hargaKg?: number,
  irigasiBerbayar: boolean = true
): ZakatPertanianResult {
  const harga = hargaKg ?? config.hargaBerasPerKg;
  const totalNilai = hasilPanenKg * harga;
  const wajibZakat = hasilPanenKg >= config.nisabPertanianKg;
  const pct = irigasiBerbayar ? 0.05 : 0.1;
  const zakatBerasKg = wajibZakat ? hasilPanenKg * pct : 0;
  const zakatNominal = wajibZakat ? Math.round(totalNilai * pct) : 0;

  return {
    hasilPanenKg,
    hargaKg: harga,
    irigasiBerbayar,
    totalNilai,
    nisabKg: config.nisabPertanianKg,
    wajibZakat,
    zakatBerasKg,
    zakatNominal,
  };
}

export function hitungZakatFitrah(config: ZakatConfigParams, jumlahJiwa: number, hargaBerasKg?: number) {
  const harga = hargaBerasKg ?? config.hargaBerasPerKg;
  const totalKg = jumlahJiwa * config.fitrahKgPerJiwa;
  const totalNominal = Math.round(totalKg * harga);

  return {
    jumlahJiwa,
    kgPerJiwa: config.fitrahKgPerJiwa,
    totalKg,
    hargaBerasKg: harga,
    totalNominal,
  };
}

export type ZakatTab = 'profesi' | 'maal' | 'pertanian' | 'fitrah';

export const JENIS_ZIS_LABEL: Record<ZakatTab, string> = {
  profesi: 'Zakat Profesi',
  maal: 'Zakat Maal',
  pertanian: 'Zakat Pertanian',
  fitrah: 'Zakat Fitrah',
};
