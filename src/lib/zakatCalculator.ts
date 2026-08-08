export const HARGA_EMAS = 1450000; // Rp / gram
export const NISAB_EMAS_GRAM = 85;
export const NISAB_EMAS_NOMINAL = NISAB_EMAS_GRAM * HARGA_EMAS; // Rp 123,250,000

export const HARGA_BERAS = 15000; // Rp / kg
export const NISAB_BERAS_KG = 522;
export const NISAB_PROFESI_BULANAN = NISAB_BERAS_KG * HARGA_BERAS; // Rp 7,830,000 / bulan

export interface ZakatProfesiResult {
  pendapatanBulanan: number;
  bonus: number;
  totalPendapatan: number;
  nisabBulanan: number;
  wajibZakat: boolean;
  zakatHarusDibayar: number;
}

export function hitungZakatProfesi(pendapatanBulanan: number, bonus: number = 0): ZakatProfesiResult {
  const totalPendapatan = pendapatanBulanan + bonus;
  const wajibZakat = totalPendapatan >= NISAB_PROFESI_BULANAN;
  const zakatHarusDibayar = wajibZakat ? Math.round(totalPendapatan * 0.025) : 0;

  return {
    pendapatanBulanan,
    bonus,
    totalPendapatan,
    nisabBulanan: NISAB_PROFESI_BULANAN,
    wajibZakat,
    zakatHarusDibayar,
  };
}

export interface ZakatMaalResult {
  tabungan: number;
  investasi: number;
  emas: number; // gram
  piutangLancar: number;
  hutangJatuhTempo: number;
  totalHartaBersih: number;
  nisabNominal: number;
  wajibZakat: boolean;
  zakatHarusDibayar: number;
}

export function hitungZakatMaal(
  tabungan: number,
  investasi: number,
  emasGram: number,
  piutangLancar: number,
  hutangJatuhTempo: number
): ZakatMaalResult {
  const nilaiEmas = emasGram * HARGA_EMAS;
  const totalHarta = tabungan + investasi + nilaiEmas + piutangLancar;
  const totalHartaBersih = Math.max(0, totalHarta - hutangJatuhTempo);

  const wajibZakat = totalHartaBersih >= NISAB_EMAS_NOMINAL;
  const zakatHarusDibayar = wajibZakat ? Math.round(totalHartaBersih * 0.025) : 0;

  return {
    tabungan,
    investasi,
    emas: emasGram,
    piutangLancar,
    hutangJatuhTempo,
    totalHartaBersih,
    nisabNominal: NISAB_EMAS_NOMINAL,
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
  hasilPanenKg: number,
  hargaKg: number = HARGA_BERAS,
  irigasiBerbayar: boolean = true
): ZakatPertanianResult {
  const nisabKg = 653; // kg gabah/beras
  const totalNilai = hasilPanenKg * hargaKg;
  const wajibZakat = hasilPanenKg >= nisabKg;
  const pct = irigasiBerbayar ? 0.05 : 0.1; // 5% jika irigasi berbayar, 10% jika hujan
  const zakatBerasKg = wajibZakat ? hasilPanenKg * pct : 0;
  const zakatNominal = wajibZakat ? Math.round(totalNilai * pct) : 0;

  return {
    hasilPanenKg,
    hargaKg,
    irigasiBerbayar,
    totalNilai,
    nisabKg,
    wajibZakat,
    zakatBerasKg,
    zakatNominal,
  };
}

export function hitungZakatFitrah(jumlahJiwa: number, hargaBerasKg: number = HARGA_BERAS) {
  const kgPerJiwa = 2.5;
  const totalKg = jumlahJiwa * kgPerJiwa;
  const totalNominal = totalKg * hargaBerasKg;

  return {
    jumlahJiwa,
    kgPerJiwa,
    totalKg,
    hargaBerasKg,
    totalNominal,
  };
}
