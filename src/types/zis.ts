export type JenisZis = 'Zakat Maal' | 'Zakat Profesi' | 'Zakat Pertanian' | 'Zakat Pertambangan' | 'Zakat Fitrah' | 'Infak' | 'Shodaqoh' | 'Wakaf Uang';

export type Asnaf = 'Fakir' | 'Miskin' | 'Amil' | 'Mualaf' | 'Riqab' | 'Gharim' | 'Fisabilillah' | 'Ibnus Sabil';

export type StatusPenerimaan = 'Terverifikasi' | 'Menunggu Verifikasi' | 'Ditolak';

export type StatusPenyaluran = 'Disetujui' | 'Sedang Diproses' | 'Siap Bayar' | 'Sudah Tersalurkan' | 'Ditolak';

export interface TransaksiPenerimaan {
  id: string;
  noKwitansi: string;
  noSbmz?: string;
  tanggal: string;
  muzakkiId: string;
  muzakkiNama: string;
  muzakkiTipe: 'Perorangan' | 'Korporat' | 'UPZ';
  jenisZis: JenisZis;
  programNama?: string;
  nominal: number;
  kanal: 'Transfer Bank BSI' | 'QRIS' | 'Cash / Konter' | 'Payroll UPZ' | 'Marketplace';
  rekeningTujuan: string;
  status: StatusPenerimaan;
  catatan?: string;
  buktiUrl?: string;
}

export interface PenerimaanDetail extends TransaksiPenerimaan {
  noTransaksi: string;
  muzakkiNomor: string;
  muzakkiNikNpwp: string;
  muzakkiTotalSetoran: number;
  hakAmilPct: number;
  hakAmil: number;
  danaMustahik: number;
  danaMustahikPct: number;
  referensiBank: string;
  jurnalGl: Array<{ akun: string; debit: number; kredit: number }>;
  riwayat: Array<{ title: string; desc: string; waktu?: string; done: boolean }>;
}

export interface TransaksiPenyaluran {
  id: string;
  noPenyaluran: string;
  tanggal: string;
  mustahikId: string;
  mustahikNama: string;
  asnaf: Asnaf;
  programId: string;
  programNama: string;
  nominal: number;
  status: StatusPenyaluran;
  metodePembayaran: string;
  rekeningTujuan?: string;
  keterangan: string;
  potonganAmil: number;
  danaMustahik: number;
}

export interface Muzakki {
  id: string;
  nomor: string;
  nama: string;
  tipe: 'Perorangan' | 'Korporat' | 'UPZ';
  nikAtauNpwp: string;
  hp: string;
  email: string;
  alamat: string;
  totalSetoran: number;
  transaksiCount: number;
  tanggalBergabung: string;
}

export interface Mustahik {
  id: string;
  nik: string;
  nama: string;
  kategoriAsnaf: Asnaf;
  hp: string;
  alamat: string;
  pekerjaan: string;
  jumlahTanggungan: number;
  penghasilanBulanan: number;
  rekeningBank: string;
  statusSurvei: 'Terverifikasi' | 'Perlu Survei' | 'Indikasi Ganda';
  skorKelayakan: number; // 0 - 100
  totalBantuanDiterima: number;
  lat?: number;
  lng?: number;
}
