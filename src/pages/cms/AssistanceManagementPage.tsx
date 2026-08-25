import React, { useState, useEffect } from 'react';
import {
  UserRoundSearch,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Phone,
  FileText,
  RefreshCw,
  Eye,
  Edit3,
} from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { cmsApi } from '../../lib/api';

export interface AssistanceItem {
  id: string;
  submissionNumber: string;
  nik: string;
  namaLengkap: string;
  asnafCategory: string;
  telepon: string;
  email?: string;
  alamatLengkap: string;
  provinsi: string;
  kotaKabupaten: string;
  pekerjaan: string;
  penghasilanBulanan: number;
  jumlahTanggungan: number;
  kondisiTempatTinggal: string;
  programBantuanDimohon: string;
  estimasiBiayaDibutuhkan: number;
  status: string;
  surveiNotes?: string;
  tahapanProses: any;
  createdAt: string;
}

export interface AssistanceManagementPageProps {
  canVerify?: boolean;
}

export const AssistanceManagementPage: React.FC<AssistanceManagementPageProps> = ({
  canVerify = false,
}) => {
  const [submissions, setSubmissions] = useState<AssistanceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState<boolean>(false);
  const [selectedSub, setSelectedSub] = useState<AssistanceItem | null>(null);
  const [newStatus, setNewStatus] = useState<string>('Sedang Disurvei');
  const [surveiNotes, setSurveiNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const res = await cmsApi.getAssistanceSubmissions();
      setSubmissions(res || []);
    } catch (error: any) {
      toast.error(`Gagal memuat permohonan bantuan: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const openStatusModal = (sub: AssistanceItem) => {
    setSelectedSub(sub);
    setNewStatus(sub.status);
    setSurveiNotes(sub.surveiNotes || '');
    setIsStatusModalOpen(true);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;

    setIsSubmitting(true);
    try {
      await cmsApi.updateAssistanceStatus(selectedSub.id, {
        status: newStatus,
        surveiNotes,
      });
      toast.success(`Status permohonan #${selectedSub.submissionNumber} berhasil diubah ke '${newStatus}'!`);
      setIsStatusModalOpen(false);
      loadSubmissions();
    } catch (error: any) {
      toast.error(`Gagal memperbarui status: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = submissions.filter((s) => {
    const matchesSearch =
      s.submissionNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.namaLengkap.toLowerCase().includes(search.toLowerCase()) ||
      s.nik.includes(search) ||
      s.kotaKabupaten.toLowerCase().includes(search.toLowerCase()) ||
      s.programBantuanDimohon.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white  p-6 rounded-2xl border border-slate-100  shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-[#0F9D6E] flex items-center justify-center text-xl shadow-xs">
            <UserRoundSearch className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              Verifikasi Pengajuan Bantuan Mustahik
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pantau formulir permohonan bantuan mustahik dari web publik, input catatan survei lapangan amil, dan update disposisi.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={loadSubmissions}
            className="flex items-center gap-2 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3 bg-white  p-4 rounded-2xl border border-slate-100 ">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari permohonan berdasarkan No. PB, NIK, nama mustahik, kota, atau jenis bantuan..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200  bg-slate-50 dark:bg-[#0D241B] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F9D6E]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full md:w-56 p-2 text-xs rounded-xl border border-slate-200  bg-slate-50 dark:bg-[#0D241B] text-slate-900 dark:text-white"
        >
          <option value="ALL">Semua Status Permohonan</option>
          <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
          <option value="Sedang Disurvei">Sedang Disurvei</option>
          <option value="Disetujui">Disetujui</option>
          <option value="Ditolak">Ditolak</option>
          <option value="Sudah Disalurkan">Sudah Disalurkan</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white  rounded-2xl border border-slate-100  overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-xs font-bold text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0F9D6E]" />
            Memuat data pengajuan mustahik...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Tidak ada permohonan bantuan yang cocok dengan kriteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#0D241B] border-b border-slate-100  text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                  <th className="p-4">No. Pengajuan</th>
                  <th className="p-4">Mustahik & NIK</th>
                  <th className="p-4">Asnaf & Bantuan</th>
                  <th className="p-4">Kebutuhan Biaya</th>
                  <th className="p-4">Wilayah & Telepon</th>
                  <th className="p-4">Status Survei</th>
                  <th className="p-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#16211D]">
                {filtered.map((sub) => (
                  <tr
                    key={sub.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-[#0D241B]/70 transition-colors"
                  >
                    <td className="p-4 font-black text-[#0F9D6E]">
                      {sub.submissionNumber}
                      <span className="block text-[10px] font-normal text-slate-400">
                        {new Date(sub.createdAt).toLocaleDateString('id-ID')}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {sub.namaLengkap}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        NIK: {sub.nik}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 inline-block mb-1">
                        Asnaf: {sub.asnafCategory}
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                        {sub.programBantuanDimohon}
                      </span>
                    </td>
                    <td className="p-4 font-extrabold text-slate-900 dark:text-white">
                      Rp {sub.estimasiBiayaDibutuhkan.toLocaleString('id-ID')}
                      <span className="block text-[10px] font-normal text-slate-400">
                        Tanggungan: {sub.jumlahTanggungan} orang
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {sub.kotaKabupaten}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                        <Phone className="w-3 h-3" />
                        {sub.telepon}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black inline-flex items-center gap-1 ${
                          sub.status === 'Disetujui' || sub.status === 'Sudah Disalurkan'
                            ? 'bg-emerald-50 text-[#0F9D6E] dark:bg-emerald-950/60'
                            : sub.status === 'Sedang Disurvei'
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60'
                            : sub.status === 'Ditolak'
                            ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60'
                            : 'bg-amber-50 text-amber-600 dark:bg-amber-950/60'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        {sub.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedSub(sub);
                            setIsDetailModalOpen(true);
                          }}
                          className="p-1.5 h-7 w-7 text-slate-700 dark:text-slate-300"
                          title="Lihat Detail Permohonan"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        {canVerify && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => openStatusModal(sub)}
                            className="p-1.5 h-7 w-7 text-[#0F9D6E] border-emerald-200 hover:bg-emerald-50 dark:border-emerald-900"
                            title="Update Status / Disposisi Survei"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Detail */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Detail Permohonan #${selectedSub?.submissionNumber}`}
        subtitle="Rincian lengkap berkas permohonan mustahik"
        maxWidth="lg"
        maximizable
      >
        {selectedSub && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-[#0D241B]">
              <div>
                <span className="text-slate-400 font-bold block">Nama Lengkap:</span>
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {selectedSub.namaLengkap}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block">Nomor Induk Kependudukan (NIK):</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {selectedSub.nik}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block">Kategori Asnaf:</span>
                <span className="font-bold text-[#0F9D6E]">{selectedSub.asnafCategory}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block">Nomor Telepon / WhatsApp:</span>
                <span className="font-bold">{selectedSub.telepon}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block">Pekerjaan:</span>
                <span>{selectedSub.pekerjaan}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block">Penghasilan Bulanan:</span>
                <span className="font-extrabold text-slate-900 dark:text-white">
                  Rp {selectedSub.penghasilanBulanan.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 font-bold block">Alamat Lengkap:</span>
                <span>{selectedSub.alamatLengkap}, {selectedSub.kotaKabupaten}, {selectedSub.provinsi}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block">Kondisi Tempat Tinggal:</span>
                <span>{selectedSub.kondisiTempatTinggal}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block">Biaya Dibutuhkan:</span>
                <span className="font-black text-[#0F9D6E] text-sm">
                  Rp {selectedSub.estimasiBiayaDibutuhkan.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {selectedSub.surveiNotes && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
                <span className="text-[10px] font-black uppercase text-[#0F9D6E] block mb-1">
                  Catatan Survei Amil:
                </span>
                <p className="text-slate-700 dark:text-slate-200">{selectedSub.surveiNotes}</p>
              </div>
            )}

            <div className="space-y-2">
              <span className="font-bold text-slate-700 dark:text-slate-300 block">
                Riwayat Tahapan Verifikasi & Survei:
              </span>
              <div className="space-y-1.5 border-l-2 border-[#0F9D6E] pl-3 ml-1">
                {Array.isArray(selectedSub.tahapanProses) &&
                  selectedSub.tahapanProses.map((t: any, idx: number) => (
                    <div key={idx} className="text-[11px]">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{t.tahap}</span>
                      <span className="text-slate-400 ml-2">({t.tanggal})</span>
                      {t.catatan && <p className="text-slate-500 italic mt-0.5">{t.catatan}</p>}
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              {canVerify && (
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => {
                    if (selectedSub) {
                      setIsDetailModalOpen(false);
                      openStatusModal(selectedSub);
                    }
                  }}
                  className="bg-[#0F9D6E] hover:bg-[#09825A] text-white"
                >
                  Update Status
                </Button>
              )}
              <Button type="button" variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                Tutup
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Status Update */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Update Status Permohonan & Catatan Survei"
        subtitle={`Pengajuan: #${selectedSub?.submissionNumber} a.n. ${selectedSub?.namaLengkap}`}
        maxWidth="md"
        maximizable
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Status Permohonan *
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200  bg-white dark:bg-[#0D241B] text-slate-900 dark:text-white font-bold"
            >
              <option value="Menunggu Verifikasi">Menunggu Verifikasi Berkas</option>
              <option value="Sedang Disurvei">Sedang Disurvei Lapangan Amil</option>
              <option value="Disetujui">Disetujui (Layak Menerima ZIS)</option>
              <option value="Ditolak">Ditolak (Tidak Memenuhi Syarat)</option>
              <option value="Sudah Disalurkan">Sudah Disalurkan Dana Bantuan</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Catatan Hasil Survei / Alasan Disposisi
            </label>
            <textarea
              rows={3}
              value={surveiNotes}
              onChange={(e) => setSurveiNotes(e.target.value)}
              placeholder="Tuliskan temuan survei amil di tempat tinggal mustahik..."
              className="w-full p-2.5 rounded-xl border border-slate-200  bg-white dark:bg-[#0D241B] text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsStatusModalOpen(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="bg-[#0F9D6E] hover:bg-[#09825A] text-white"
            >
              {isSubmitting ? 'Memproses...' : 'Simpan Status Baru'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
