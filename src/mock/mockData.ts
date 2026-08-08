import { TransaksiPenerimaan, TransaksiPenyaluran, Muzakki, Mustahik } from '../types/zis';
import { AccountCoA, JurnalEntry, MutasiBank, FormSimba } from '../types/finance';
import { ProgramZis, ProposalMustahik, MitraPenyalur, UpzCabang, KampanyeZis, AmilKaryawan, NotifikasiItem } from '../types/system';

export const INITIAL_MUZAKKI: Muzakki[] = [
  { id: '1', nomor: 'MZK-2026-00001', nama: 'PT Telkom Indonesia (CSR)', tipe: 'Korporat', nikAtauNpwp: '01.000.012.4-041.000', hp: '081299887766', email: 'csr@telkom.co.id', alamat: 'Jl. Japati No. 1, Bandung', totalSetoran: 350000000, transaksiCount: 4, tanggalBergabung: '2024-01-15' },
  { id: '2', nomor: 'MZK-2026-00002', nama: 'H. Ahmad Fauzi, S.E.', tipe: 'Perorangan', nikAtauNpwp: '3273011204800001', hp: '081122334455', email: 'ahmad.fauzi@gmail.com', alamat: 'Kebayoran Baru, Jakarta Selatan', totalSetoran: 85000000, transaksiCount: 6, tanggalBergabung: '2023-05-20' },
  { id: '3', nomor: 'MZK-2026-00003', nama: 'UPZ PT Paragon Technology', tipe: 'UPZ', nikAtauNpwp: '02.441.982.1-013.000', hp: '081388776655', email: 'upz@paragon.co.id', alamat: 'Kawasan Industri Jatake, Tangerang', totalSetoran: 142000000, transaksiCount: 5, tanggalBergabung: '2025-02-10' },
  { id: '4', nomor: 'MZK-2026-00004', nama: 'Hj. Siti Rahmawati', tipe: 'Perorangan', nikAtauNpwp: '3171055209750003', hp: '081877665544', email: 'siti.rahma@yahoo.com', alamat: 'Menteng, Jakarta Pusat', totalSetoran: 45000000, transaksiCount: 3, tanggalBergabung: '2024-11-01' },
  { id: '5', nomor: 'MZK-2026-00005', nama: 'Bpk. Hendra Wijaya', tipe: 'Perorangan', nikAtauNpwp: '3204121908820005', hp: '085711223344', email: 'hendra.w@gmail.com', alamat: 'Bintaro Jaya Sektor 7, Tangerang Selatan', totalSetoran: 27500000, transaksiCount: 4, tanggalBergabung: '2025-01-08' },
];

export const INITIAL_MUSTAHIK: Mustahik[] = [
  { id: '1', nik: '3273101508700002', nama: 'Ustadz Ahmad Suhendar', kategoriAsnaf: 'Fisabilillah', hp: '081311223344', alamat: 'Desa Bojongsoang, Kab. Bandung', pekerjaan: 'Guru Ngaji & Da\'i', jumlahTanggungan: 4, penghasilanBulanan: 1800000, rekeningBank: 'BSI 7123456789', statusSurvei: 'Terverifikasi', skorKelayakan: 92, totalBantuanDiterima: 15000000 },
  { id: '2', nik: '3175024503850001', nama: 'Ibu Maryam Binti Usman', kategoriAsnaf: 'Fakir', hp: '085811224455', alamat: 'Kampung Melayu, Jatinegara, Jakarta Timur', pekerjaan: 'Janda / Buruh Cuci', jumlahTanggungan: 3, penghasilanBulanan: 900000, rekeningBank: 'BSI 7234567890', statusSurvei: 'Terverifikasi', skorKelayakan: 96, totalBantuanDiterima: 12500000 },
  { id: '3', nik: '3204051010920004', nama: 'M. Rizky Ramadhan', kategoriAsnaf: 'Miskin', hp: '082133445566', alamat: 'Cileunyi, Kab. Bandung', pekerjaan: 'Mahasiswa Beasiswa ZIS', jumlahTanggungan: 1, penghasilanBulanan: 1200000, rekeningBank: 'BSI 7345678901', statusSurvei: 'Terverifikasi', skorKelayakan: 88, totalBantuanDiterima: 18000000 },
  { id: '4', nik: '3671012005780003', nama: 'Bpk. Herman (Mualaf)', kategoriAsnaf: 'Mualaf', hp: '087899001122', alamat: 'Cikupa, Tangerang', pekerjaan: 'Pedagang Kaki Lima', jumlahTanggungan: 2, penghasilanBulanan: 2100000, rekeningBank: 'BSI 7456789012', statusSurvei: 'Terverifikasi', skorKelayakan: 85, totalBantuanDiterima: 8500000 },
  { id: '5', nik: '3174090807810006', nama: 'Bpk. Slamet (Beban Hutang)', kategoriAsnaf: 'Gharim', hp: '081277889900', alamat: 'Kebayoran Lama, Jakarta Selatan', pekerjaan: 'Korban Musibah Kebakaran', jumlahTanggungan: 5, penghasilanBulanan: 1500000, rekeningBank: 'BSI 7567890123', statusSurvei: 'Terverifikasi', skorKelayakan: 90, totalBantuanDiterima: 25000000 },
];

export const INITIAL_PENERIMAAN: TransaksiPenerimaan[] = [
  { id: '1', noKwitansi: 'KWT/2026/08/001', tanggal: '2026-08-01', muzakkiId: '1', muzakkiNama: 'PT Telkom Indonesia (CSR)', muzakkiTipe: 'Korporat', jenisZis: 'Zakat Maal', nominal: 150000000, kanal: 'Transfer Bank BSI', rekeningTujuan: 'BSI 7001234567 (Zakat Maal)', status: 'Terverifikasi', catatan: 'Zakat perusahaan Triwulan III' },
  { id: '2', noKwitansi: 'KWT/2026/08/002', tanggal: '2026-08-02', muzakkiId: '2', muzakkiNama: 'H. Ahmad Fauzi, S.E.', muzakkiTipe: 'Perorangan', jenisZis: 'Zakat Profesi', nominal: 12500000, kanal: 'QRIS', rekeningTujuan: 'BSI 7001234567 (Zakat Profesi)', status: 'Terverifikasi', catatan: 'Setoran zakat penghasilan bulan Agustus' },
  { id: '3', noKwitansi: 'KWT/2026/08/003', tanggal: '2026-08-03', muzakkiId: '3', muzakkiNama: 'UPZ PT Paragon Technology', muzakkiTipe: 'UPZ', jenisZis: 'Infak', nominal: 35000000, kanal: 'Payroll UPZ', rekeningTujuan: 'BSI 7002345678 (Infak Shodaqoh)', status: 'Terverifikasi', catatan: 'Infak terikat program beasiswa' },
  { id: '4', noKwitansi: 'KWT/2026/08/004', tanggal: '2026-08-05', muzakkiId: '4', muzakkiNama: 'Hj. Siti Rahmawati', muzakkiTipe: 'Perorangan', jenisZis: 'Shodaqoh', nominal: 10000000, kanal: 'Cash / Konter', rekeningTujuan: 'Kasir Konter Utama', status: 'Terverifikasi', catatan: 'Shodaqoh pembangunan sumur bersih' },
  { id: '5', noKwitansi: 'KWT/2026/08/006', tanggal: '2026-08-07', muzakkiId: '5', muzakkiNama: 'Bpk. Hendra Wijaya', muzakkiTipe: 'Perorangan', jenisZis: 'Zakat Fitrah', nominal: 2250000, kanal: 'QRIS', rekeningTujuan: 'BSI 7003456789 (Zakat Fitrah)', status: 'Menunggu Verifikasi', catatan: 'Zakat fitrah 50 jiwa karyawan' },
];

export const INITIAL_PENYALURAN: TransaksiPenyaluran[] = [
  { id: '1', noPenyaluran: 'SLR/2026/08/001', tanggal: '2026-08-02', mustahikId: '1', mustahikNama: 'Ustadz Ahmad Suhendar', asnaf: 'Fisabilillah', programId: '1', programNama: 'Bantuan Biaya Operasional Da\'i Pelosok', nominal: 5000000, status: 'Sudah Tersalurkan', metodePembayaran: 'Transfer BSI', rekeningTujuan: 'BSI 7123456789', keterangan: 'Honorarium & operasional dakwah bulan Agustus', potonganAmil: 375000, danaMustahik: 4625000 },
  { id: '2', noPenyaluran: 'SLR/2026/08/002', tanggal: '2026-08-03', mustahikId: '2', mustahikNama: 'Ibu Maryam Binti Usman', asnaf: 'Fakir', programId: '2', programNama: 'Paket Pangan Sembako Fakir Miskin', nominal: 3500000, status: 'Sudah Tersalurkan', metodePembayaran: 'Tunai', keterangan: 'Paket sembako & santunan tunai janda lansia', potonganAmil: 262500, danaMustahik: 3237500 },
  { id: '3', noPenyaluran: 'SLR/2026/08/003', tanggal: '2026-08-04', mustahikId: '3', mustahikNama: 'M. Rizky Ramadhan', asnaf: 'Miskin', programId: '3', programNama: 'Beasiswa Pendidikan Amanah Zakat', nominal: 4500000, status: 'Sudah Tersalurkan', metodePembayaran: 'Transfer BSI', rekeningTujuan: 'BSI 7345678901', keterangan: 'UKT semester V & uang saku mahasiswa', potonganAmil: 337500, danaMustahik: 4162500 },
  { id: '4', noPenyaluran: 'SLR/2026/08/004', tanggal: '2026-08-06', mustahikId: '5', mustahikNama: 'Bpk. Slamet (Beban Hutang)', asnaf: 'Gharim', programId: '4', programNama: 'Bantuan Pelunasan Hutang Darurat', nominal: 15000000, status: 'Siap Bayar', metodePembayaran: 'Transfer BSI', rekeningTujuan: 'BSI 7567890123', keterangan: 'Bantuan darurat pelunasan medis rumah sakit', potonganAmil: 1125000, danaMustahik: 13875000 },
];

export const INITIAL_PROGRAM: ProgramZis[] = [
  { id: '1', nama: 'Amanah Pendidikan (Beasiswa & Sekolah)', pilar: 'Pendidikan', paguAnggaran: 250000000, terpakai: 145000000, targetPenerima: 150, realisasiPenerima: 98, status: 'Berjalan', penanggungJawab: 'Drs. H. M. Ridwan' },
  { id: '2', nama: 'Amanah Kesehatan (Layanan Medis Gratis)', pilar: 'Kesehatan', paguAnggaran: 180000000, terpakai: 110000000, targetPenerima: 300, realisasiPenerima: 220, status: 'Berjalan', penanggungJawab: 'dr. Farida Hanum' },
  { id: '3', nama: 'Amanah Ekonomi (Modal Usaha Mikro)', pilar: 'Ekonomi', paguAnggaran: 300000000, terpakai: 195000000, targetPenerima: 80, realisasiPenerima: 52, status: 'Berjalan', penanggungJawab: 'Ir. Ahmad Syarif' },
  { id: '4', nama: 'Amanah Dakwah (Kesejahteraan Da\'i & Masjid)', pilar: 'Dakwah', paguAnggaran: 150000000, terpakai: 98000000, targetPenerima: 60, realisasiPenerima: 45, status: 'Berjalan', penanggungJawab: 'Ust. Nur Hidayat, M.Ag' },
  { id: '5', nama: 'Amanah Kemanusiaan (Tanggap Bencana)', pilar: 'Kemanusiaan', paguAnggaran: 200000000, terpakai: 160000000, targetPenerima: 500, realisasiPenerima: 480, status: 'Berjalan', penanggungJawab: 'Bambang Sugipto, S.Sos' },
];

export const INITIAL_PROPOSAL: ProposalMustahik[] = [
  { id: '1', noProposal: 'PROP/2026/08/001', tanggal: '2026-08-01', pemohonNama: 'Yayasan Nurul Ilmi Bandung', pemohonTipe: 'Lembaga / Yayasan', kategoriAsnaf: 'Fisabilillah', programTujuanId: '1', programTujuanNama: 'Amanah Pendidikan', judulProposal: 'Permohonan Renovasi Ruang Kelas MI Bojongsoang', nominalDiajukan: 45000000, nominalDisetujui: 35000000, status: 'Disetujui Verifikator', catatanSurvei: 'Kondisi bangunan kayu sudah lapuk, layak dibantu.' },
  { id: '2', noProposal: 'PROP/2026/08/002', tanggal: '2026-08-02', pemohonNama: 'Keluarga Ibu Rohmah', pemohonTipe: 'Perorangan', kategoriAsnaf: 'Miskin', programTujuanId: '2', programTujuanNama: 'Amanah Kesehatan', judulProposal: 'Bantuan Biaya Operasi Katarak Lansia', nominalDiajukan: 8500000, nominalDisetujui: 8500000, status: 'Siap Bayar', catatanSurvei: 'Verifikasi berkas RS lengkap, siap dicairkan.' },
  { id: '3', noProposal: 'PROP/2026/08/004', tanggal: '2026-08-04', pemohonNama: 'Bpk. Wahyudi (Kelompok Tani)', pemohonTipe: 'Perorangan', kategoriAsnaf: 'Fakir', programTujuanId: '3', programTujuanNama: 'Amanah Ekonomi', judulProposal: 'Bantuan Bibit & Pupuk Tanaman Padi', nominalDiajukan: 12000000, status: 'Survei Lapangan', catatanSurvei: 'Tim survei sedang memvalidasi luas lahan tani.' },
];

export const INITIAL_MITRA: MitraPenyalur[] = [
  { id: '1', nama: 'Yayasan Kita Sehat Indonesia', bentukLembaga: 'Yayasan', noMou: 'MOU/AZ/2025/001', masaKerjasama: '01 Jan 2025 - 31 Des 2026', picKontak: 'Drs. Hendri', hpPic: '081233445566', totalPenyaluran: 120000000, statusLaporanLpj: 'Terverifikasi' },
  { id: '2', nama: 'LKM Syariah Amanah Ummah', bentukLembaga: 'LKM Syariah', noMou: 'MOU/AZ/2025/004', masaKerjasama: '15 Mar 2025 - 15 Mar 2027', picKontak: 'Siti Aminah, M.Si', hpPic: '081344556677', totalPenyaluran: 250000000, statusLaporanLpj: 'Menunggu LPJ' },
  { id: '3', nama: 'Komunitas Pemuda Relawan Bencana', bentukLembaga: 'Komunitas', noMou: 'MOU/AZ/2026/002', masaKerjasama: '01 Jan 2026 - 31 Des 2026', picKontak: 'Fajar Nugraha', hpPic: '081555667788', totalPenyaluran: 85000000, statusLaporanLpj: 'Terverifikasi' },
];

export const INITIAL_UPZ: UpzCabang[] = [
  { id: '1', kodeUpz: 'UPZ-01', nama: 'UPZ Masjid Agung Al-Azhar', kategori: 'Masjid', totalPenghimpunan: 185000000, totalPenyaluran: 160000000, hakPengelolaanPct: 10, statusKepatuhan: 'Patuh' },
  { id: '2', kodeUpz: 'UPZ-02', nama: 'UPZ Kementerian Pertanian RI', kategori: 'Instansi Pemerintah', totalPenghimpunan: 420000000, totalPenyaluran: 380000000, hakPengelolaanPct: 12.5, statusKepatuhan: 'Patuh' },
  { id: '3', kodeUpz: 'UPZ-03', nama: 'UPZ PT Bio Farma (Persero)', kategori: 'BUMN / Korporat', totalPenghimpunan: 290000000, totalPenyaluran: 250000000, hakPengelolaanPct: 10, statusKepatuhan: 'Perlu Audit' },
];

export const INITIAL_KAMPANYE: KampanyeZis[] = [
  { id: '1', kodeKampanye: 'KMP-001', judul: 'Beasiswa 1000 Anak Yatim & Dhuafa 2026', pilar: 'Pendidikan', targetDana: 500000000, terkumpulDana: 342000000, donaturCount: 1240, batasWaktu: '2026-12-31', status: 'Berjalan' },
  { id: '2', kodeKampanye: 'KMP-002', judul: 'Sumur Bersih & Sanitasi Pelosok Nusa Tenggara', pilar: 'Kesehatan', targetDana: 150000000, terkumpulDana: 128500000, donaturCount: 480, batasWaktu: '2026-09-30', status: 'Berjalan' },
  { id: '3', kodeKampanye: 'KMP-003', judul: 'Modal Usaha 50 Ibu Tangguh Pelaku UMKM', pilar: 'Ekonomi', targetDana: 200000000, terkumpulDana: 198000000, donaturCount: 620, batasWaktu: '2026-08-31', status: 'Berjalan' },
];

export const INITIAL_AMIL: AmilKaryawan[] = [
  { id: '1', nip: 'AML-001', nama: 'Ahmad Syarif, S.E.I', jabatan: 'Direktur Eksekutif', divisi: 'SDM & Umum', gajiPokok: 15000000, tunjanganAmil: 3500000, potonganZakat: 462500, keikutsertaanPayroll: true, statusKerja: 'Tetap' },
  { id: '2', nip: 'AML-002', nama: 'Rina Permata, S.Ak', jabatan: 'Kepala Divisi Keuangan & Akuntansi', divisi: 'Keuangan & Akuntansi', gajiPokok: 10500000, tunjanganAmil: 2200000, potonganZakat: 317500, keikutsertaanPayroll: true, statusKerja: 'Tetap' },
  { id: '3', nip: 'AML-003', nama: 'Ust. Nur Hidayat, M.Ag', jabatan: 'Kepala Divisi Program & Penyaluran', divisi: 'Penyaluran & Program', gajiPokok: 11000000, tunjanganAmil: 2500000, potonganZakat: 337500, keikutsertaanPayroll: true, statusKerja: 'Tetap' },
  { id: '4', nip: 'AML-004', nama: 'Dedi Kurniawan', jabatan: 'Staf Penghimpunan & Fundraising', divisi: 'Penghimpunan', gajiPokok: 6500000, tunjanganAmil: 1200000, potonganZakat: 192500, keikutsertaanPayroll: true, statusKerja: 'Tetap' },
];

export const INITIAL_COA: AccountCoA[] = [
  { kode: '101100', nama: 'Kas Kecil Amil', tipe: 'Aset', grup: 'AKTIFA', saldo: 15000000 },
  { kode: '101201', nama: 'Bank BSI Penampung Zakat', tipe: 'Aset', grup: 'AKTIFA', saldo: 450000000 },
  { kode: '101202', nama: 'Bank BSI Penampung Infak', tipe: 'Aset', grup: 'AKTIFA', saldo: 185000000 },
  { kode: '301100', nama: 'Dana Zakat (Saldo Kelolaan)', tipe: 'Dana Zakat', grup: 'PENDIRIAN', saldo: 450000000 },
  { kode: '302100', nama: 'Dana Infak / Sedekah', tipe: 'Dana Infak', grup: 'PENDIRIAN', saldo: 185000000 },
  { kode: '303100', nama: 'Dana Hak Amil (12.5%)', tipe: 'Dana Amil', grup: 'PENDIRIAN', saldo: 65000000 },
  { kode: '401100', nama: 'Penerimaan Zakat Maal', tipe: 'Penerimaan', grup: 'PENERIMAAN', saldo: 850000000 },
  { kode: '401200', nama: 'Penerimaan Zakat Profesi', tipe: 'Penerimaan', grup: 'PENERIMAAN', saldo: 420000000 },
  { kode: '501100', nama: 'Penyaluran Zakat Fakir Miskin', tipe: 'Penyaluran', grup: 'PENYALURAN', saldo: 520000000 },
  { kode: '501200', nama: 'Penyaluran Zakat Fisabilillah', tipe: 'Penyaluran', grup: 'PENYALURAN', saldo: 210000000 },
  { kode: '601100', nama: 'Beban Operasional Gaji Amil', tipe: 'Beban Amil', grup: 'BEBAN', saldo: 145000000 },
];

export const INITIAL_JURNAL: JurnalEntry[] = [
  { id: '1', noJurnal: 'JRN/2026/08/001', tanggal: '2026-08-01', keterangan: 'Penerimaan Zakat Maal PT Telkom Indonesia', debitKode: '101201', debitNama: 'Bank BSI Penampung Zakat', kreditKode: '401100', kreditNama: 'Penerimaan Zakat Maal', nominal: 150000000, status: 'Posted' },
  { id: '2', noJurnal: 'JRN/2026/08/002', tanggal: '2026-08-02', keterangan: 'Penyaluran Zakat Fisabilillah Ustadz Ahmad', debitKode: '501200', debitNama: 'Penyaluran Zakat Fisabilillah', kreditKode: '101201', kreditNama: 'Bank BSI Penampung Zakat', nominal: 5000000, status: 'Posted' },
  { id: '3', noJurnal: 'JRN/2026/08/003', tanggal: '2026-08-03', keterangan: 'Alokasi Hak Amil 12.5% dari Zakat Maal', debitKode: '401100', debitNama: 'Penerimaan Zakat Maal', kreditKode: '303100', kreditNama: 'Dana Hak Amil (12.5%)', nominal: 18750000, status: 'Posted' },
];

export const INITIAL_SIMBA: FormSimba[] = [
  { id: '1', kodeForm: 'FORM_1', namaForm: 'Form 1: Pengumpulan Zakat, Infak, Sedekah per Rekening', status: 'Siap Kirim', itemCount: 124, totalNilai: 850000000 },
  { id: '2', kodeForm: 'FORM_2', namaForm: 'Form 2: Penyaluran Dana ZIS per 8 Asnaf', status: 'Siap Kirim', itemCount: 95, totalNilai: 620000000 },
  { id: '3', kodeForm: 'FORM_3', namaForm: 'Form 3: Data Muzakki & NPWP Terdaftar', status: 'Siap Kirim', itemCount: 48, totalNilai: 850000000 },
  { id: '4', kodeForm: 'FORM_4', namaForm: 'Form 4: Data Mustahik By Name By Address (NIK)', status: 'Siap Kirim', itemCount: 150, totalNilai: 620000000 },
  { id: '5', kodeForm: 'FORM_5', namaForm: 'Form 5: Neraca & Laporan Keuangan PSAK 109', status: 'Draft', itemCount: 12, totalNilai: 1470000000 },
];

export const INITIAL_NOTIFIKASI: NotifikasiItem[] = [
  { id: '1', waktu: '10 menit lalu', judul: 'Pengajuan Penyaluran Baru', pesan: 'Proposal pelunasan hutang darurat Bpk. Slamet memerlukan approval.', kategori: 'Approval', dibaca: false, linkScreen: 'proposal' },
  { id: '2', waktu: '1 jam lalu', judul: 'Penerimaan QRIS Terverifikasi', pesan: 'Setoran zakat profesi Rp 12.500.000 H. Ahmad Fauzi telah diverifikasi.', kategori: 'Penerimaan', dibaca: false, linkScreen: 'penerimaan' },
  { id: '3', waktu: '3 jam lalu', judul: 'LPJ Mitra Terunggah', pesan: 'Yayasan Kita Sehat Indonesia mengunggah LPJ penyaluran kesehatan.', kategori: 'System', dibaca: true, linkScreen: 'mitra' },
  { id: '4', waktu: '1 hari lalu', judul: 'Pengingat Tutup Buku', pesan: 'Periode Juli 2026 siap dikunci setelah verifikasi 4 langkah.', kategori: 'Closing', dibaca: true, linkScreen: 'closing' },
];
