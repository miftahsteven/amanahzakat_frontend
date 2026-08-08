export interface AccountCoA {
  kode: string;
  nama: string;
  tipe: 'Aset' | 'Kewajiban' | 'Dana Zakat' | 'Dana Infak' | 'Dana Amil' | 'Penerimaan' | 'Penyaluran' | 'Beban Amil';
  grup: 'AKTIFA' | 'PASIVA' | 'PENDIRIAN' | 'PENERIMAAN' | 'PENYALURAN' | 'BEBAN';
  saldo: number;
}

export interface JurnalEntry {
  id: string;
  noJurnal: string;
  tanggal: string;
  keterangan: string;
  debitKode: string;
  debitNama: string;
  kreditKode: string;
  kreditNama: string;
  nominal: number;
  referensi?: string;
  status: 'Posted' | 'Draft';
}

export interface MutasiBank {
  id: string;
  tanggal: string;
  keterangan: string;
  nominal: number;
  tipe: 'CR' | 'DB';
  statusRekonsiliasi: 'Teridentifikasi' | 'Belum Teridentifikasi';
  matchedTrxId?: string;
}

export interface LaporanPsak109 {
  periode: string;
  penerimaanZakat: number;
  penyaluranZakat: number;
  saldoDanaZakat: number;
  penerimaanInfak: number;
  penyaluranInfak: number;
  saldoDanaInfak: number;
  penerimaanAmil: number;
  penggunaanAmil: number;
  saldoDanaAmil: number;
  totalAsetKelolaan: number;
}

export interface TutupBukuPeriode {
  periode: string;
  status: 'Terbuka' | 'Terkunci';
  tglDikunci?: string;
  oleh?: string;
  langkah: {
    rekon: boolean;
    jurnal: boolean;
    saldo: boolean;
    laporan: boolean;
  };
}

export interface FormSimba {
  id: string;
  kodeForm: 'FORM_1' | 'FORM_2' | 'FORM_3' | 'FORM_4' | 'FORM_5';
  namaForm: string;
  status: 'Siap Kirim' | 'Draft' | 'Terkirim';
  itemCount: number;
  totalNilai: number;
}
