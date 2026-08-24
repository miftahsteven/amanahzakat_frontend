export interface ProgramZis {
  id: string;
  nama: string;
  pilar: 'Pendidikan' | 'Kesehatan' | 'Ekonomi' | 'Dakwah' | 'Kemanusiaan';
  paguAnggaran: number;
  terpakai: number;
  targetPenerima: number;
  realisasiPenerima: number;
  status: 'Berjalan' | 'Selesai' | 'Perencanaan';
  penanggungJawab: string;
}

export interface ProgramDetail extends ProgramZis {
  tahun: number;
  sisaPagu: number;
  pct: number;
  statusLabel: string;
  asnafRows: Array<{ label: string; nominal: number; pct: number }>;
  salurRows: Array<{
    id: string;
    tanggal: string;
    noPenyaluran: string;
    mustahikNama: string;
    asnaf: string;
    nominal: number;
    status: string;
  }>;
  mitraRows: Array<{
    id: string;
    nama: string;
    bentukLembaga: string;
    pic: string;
    dana: number;
    laporan: string;
  }>;
}

export interface ProposalMustahik {
  id: string;
  noProposal: string;
  tanggal: string;
  pemohonNama: string;
  pemohonTipe: 'Perorangan' | 'Lembaga / Yayasan';
  kategoriAsnaf: string;
  programTujuanId: string;
  programTujuanNama: string;
  judulProposal: string;
  nominalDiajukan: number;
  nominalDisetujui?: number;
  status: 'Draft' | 'Diterima' | 'Survei Lapangan' | 'Disetujui Verifikator' | 'Siap Bayar' | 'Ditolak';
  catatanSurvei?: string;
}

export interface MitraPenyalur {
  id: string;
  nama: string;
  bentukLembaga: 'Yayasan' | 'Komunitas' | 'LKM Syariah' | 'Pesantren';
  noMou: string;
  masaKerjasama: string;
  picKontak: string;
  hpPic: string;
  totalPenyaluran: number;
  statusLaporanLpj: 'Terverifikasi' | 'Menunggu LPJ' | 'Tertunda';
}

export interface MitraDetail extends MitraPenyalur {
  inisial: string;
  profil: Array<{ label: string; value: string }>;
  programTerkait: Array<{
    id: string;
    nama: string;
    pj: string;
    pagu: number;
    terpakai: number;
  }>;
  transaksi: Array<{
    id: string;
    tanggal: string;
    penerima: string;
    program: string;
    asnaf: string;
    nominal: number;
    status: string;
  }>;
  dokumen: Array<{ nama: string; status: string }>;
}

export interface UpzCabang {
  id: string;
  kodeUpz: string;
  nama: string;
  kategori: 'Masjid' | 'Instansi Pemerintah' | 'BUMN / Korporat' | 'Sekolah / Kampus';
  totalPenghimpunan: number;
  totalPenyaluran: number;
  hakPengelolaanPct: number; // e.g. 10%
  statusKepatuhan: 'Patuh' | 'Perlu Audit' | 'Baru';
}

export interface UpzDetail extends UpzCabang {
  inisial: string;
  pctSalur: number;
  danaBelumTersalur: number;
  sharing: Array<{ label: string; pct: number; value: number }>;
  programRows: Array<{
    id: string;
    nama: string;
    pj: string;
    pagu: number;
    terpakai: number;
    pct: number;
  }>;
  muzakkiUpz: Array<{
    id: string;
    nomor: string;
    nama: string;
    totalSetoran: number;
    transaksiCount: number;
  }>;
  recentPayroll: Array<{
    id: string;
    tanggal: string;
    muzakki: string;
    jenisZis: string;
    nominal: number;
    noKwitansi: string;
  }>;
}

export interface KampanyeZis {
  id: string;
  kodeKampanye: string;
  judul: string;
  pilar: string;
  targetDana: number;
  terkumpulDana: number;
  donaturCount: number;
  batasWaktu: string;
  status: 'Berjalan' | 'Selesai' | 'Draf';
}

export interface AmilKaryawan {
  id: string;
  nip: string;
  nama: string;
  jabatan: string;
  divisi: 'Penghimpunan' | 'Penyaluran & Program' | 'Keuangan & Akuntansi' | 'SDM & Umum';
  gajiPokok: number;
  tunjanganAmil: number;
  potonganZakat: number;
  keikutsertaanPayroll: boolean;
  statusKerja: 'Tetap' | 'Kontrak' | 'Relawan';
}

export interface NotifikasiItem {
  id: string;
  waktu: string;
  judul: string;
  pesan: string;
  kategori: 'Penerimaan' | 'Penyaluran' | 'System' | 'Approval' | 'Closing';
  dibaca: boolean;
  linkScreen?: string;
}
