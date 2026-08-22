import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  Plus,
  Search,
  Edit3,
  Trash2,
  ExternalLink,
  Users,
  Target,
  Sparkles,
  RefreshCw,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { cmsApi } from '../../lib/api';

export interface CampaignItem {
  id: number;
  slug: string;
  nama: string;
  program: string;
  lokasi: string;
  target: number;
  terkumpul: number;
  donaturCount: number;
  tenggat: string;
  ringkas: string;
  cerita: string;
  imageUrl: string;
  status: string;
  isFeatured: boolean;
}

export const CampaignsManagementPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedProgramFilter, setSelectedProgramFilter] = useState<string>('ALL');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState({
    nama: '',
    program: 'Wakaf Sumur',
    lokasi: 'Indonesia',
    target: 500000000,
    terkumpul: 0,
    tenggat: '31 Desember 2026',
    ringkas: '',
    cerita: '',
    imageUrl: '/images/campaigns/sumur-sumba.jpg',
    status: 'Berjalan',
    isFeatured: true,
  });

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const res = await cmsApi.getCampaigns();
      setCampaigns(res || []);
    } catch (error: any) {
      toast.error(`Gagal memuat kampanye: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const openCreateModal = () => {
    setSelectedCampaign(null);
    setFormData({
      nama: '',
      program: 'Wakaf Sumur',
      lokasi: 'Indonesia',
      target: 500000000,
      terkumpul: 0,
      tenggat: '31 Desember 2026',
      ringkas: '',
      cerita: '',
      imageUrl: '/images/campaigns/sumur-sumba.jpg',
      status: 'Berjalan',
      isFeatured: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (campaign: CampaignItem) => {
    setSelectedCampaign(campaign);
    setFormData({
      nama: campaign.nama,
      program: campaign.program,
      lokasi: campaign.lokasi,
      target: campaign.target,
      terkumpul: campaign.terkumpul,
      tenggat: campaign.tenggat,
      ringkas: campaign.ringkas,
      cerita: campaign.cerita,
      imageUrl: campaign.imageUrl,
      status: campaign.status,
      isFeatured: campaign.isFeatured,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.target) {
      toast.error('Nama kampanye dan target dana wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (selectedCampaign) {
        await cmsApi.updateCampaign(selectedCampaign.id, formData);
        toast.success('Program kampanye berhasil diperbarui!');
      } else {
        await cmsApi.createCampaign(formData);
        toast.success('Program kampanye baru berhasil dibuat!');
      }
      setIsModalOpen(false);
      loadCampaigns();
    } catch (error: any) {
      toast.error(`Gagal menyimpan kampanye: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCampaign) return;
    setIsSubmitting(true);
    try {
      await cmsApi.deleteCampaign(selectedCampaign.id);
      toast.success('Program kampanye berhasil dihapus.');
      setIsDeleteModalOpen(false);
      loadCampaigns();
    } catch (error: any) {
      toast.error(`Gagal menghapus: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = campaigns.filter((c) => {
    const matchesSearch =
      c.nama.toLowerCase().includes(search.toLowerCase()) ||
      c.program.toLowerCase().includes(search.toLowerCase()) ||
      c.lokasi.toLowerCase().includes(search.toLowerCase());
    const matchesProgram =
      selectedProgramFilter === 'ALL' || c.program === selectedProgramFilter;
    return matchesSearch && matchesProgram;
  });

  const categories = Array.from(new Set(campaigns.map((c) => c.program)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white  p-6 rounded-2xl border border-slate-100  shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-[#0F9D6E] flex items-center justify-center text-xl shadow-xs">
            <FolderKanban className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              Kelola Program & Kampanye ZIS
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Atur katalog kampanye publik, target dana kebaikan, tenggat waktu, dan cerita mustahik.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={loadCampaigns}
            className="flex items-center gap-2 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={openCreateModal}
            className="flex items-center gap-2 text-xs bg-[#0F9D6E] hover:bg-[#09825A] text-white"
          >
            <Plus className="w-4 h-4" />
            Buat Kampanye Baru
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
            placeholder="Cari kampanye berdasarkan judul, kategori, atau lokasi..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200  bg-slate-50 dark:bg-[#0D241B] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F9D6E]"
          />
        </div>
        <select
          value={selectedProgramFilter}
          onChange={(e) => setSelectedProgramFilter(e.target.value)}
          className="w-full md:w-56 p-2 text-xs rounded-xl border border-slate-200  bg-slate-50 dark:bg-[#0D241B] text-slate-900 dark:text-white"
        >
          <option value="ALL">Semua Pilar Program</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Campaigns Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs font-bold text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0F9D6E]" />
          Memuat data kampanye...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white  rounded-2xl border border-slate-100 ">
          <FolderKanban className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Tidak ada kampanye yang cocok.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((camp) => {
            const pct = Math.min(100, Math.round((camp.terkumpul / camp.target) * 100));
            return (
              <div
                key={camp.id}
                className="flex flex-col rounded-2xl bg-white  border border-slate-100  overflow-hidden shadow-xs hover:shadow-md transition-all"
              >
                {/* Image header */}
                <div className="relative h-44 bg-slate-800">
                  <img
                    src={camp.imageUrl}
                    alt={camp.nama}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/campaigns/sumur-sumba.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-[#0F9D6E] text-white">
                      {camp.program}
                    </span>
                    {camp.isFeatured && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-amber-950 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        Unggulan
                      </span>
                    )}
                  </div>

                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                        camp.status === 'Berjalan'
                          ? 'bg-emerald-500/90 text-white'
                          : 'bg-blue-600/90 text-white'
                      }`}
                    >
                      {camp.status}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[10px] font-bold text-slate-300 block">{camp.lokasi}</span>
                    <h3 className="text-sm font-black line-clamp-1">{camp.nama}</h3>
                  </div>
                </div>

                {/* Progress & details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {camp.ringkas}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        Rp {camp.terkumpul.toLocaleString('id-ID')}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">
                        {pct}% dari Rp {(camp.target / 1000000).toLocaleString('id-ID')} Jt
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-[#16211D] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#0F9D6E]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {camp.donaturCount.toLocaleString('id-ID')} Donatur
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        s.d. {camp.tenggat}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100  flex items-center justify-between gap-2">
                    <a
                      href={`http://localhost:3001/kampanye/${camp.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-bold text-[#0F9D6E] hover:underline flex items-center gap-1"
                    >
                      <span>Lihat di Web</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(camp)}
                        className="p-2 h-8 w-8 text-slate-700 dark:text-slate-300"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCampaign(camp);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-2 h-8 w-8 text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-900"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Create/Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedCampaign ? 'Edit Program Kampanye' : 'Buat Program Kampanye Baru'}
        subtitle="Form entri data program penggalangan dana ZIS publik"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nama Kampanye *
              </label>
              <input
                type="text"
                required
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                placeholder="Contoh: Sumur Kehidupan Sumba Timur"
                className="w-full p-2.5 rounded-xl border border-slate-200  bg-white dark:bg-[#0D241B] text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Pilar / Jenis Program *
              </label>
              <input
                type="text"
                required
                value={formData.program}
                onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                placeholder="Contoh: Wakaf Sumur / Beasiswa / Kesehatan"
                className="w-full p-2.5 rounded-xl border border-slate-200  bg-white dark:bg-[#0D241B] text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Lokasi Penyaluran
              </label>
              <input
                type="text"
                value={formData.lokasi}
                onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                placeholder="Contoh: Sumba Timur, NTT"
                className="w-full p-2.5 rounded-xl border border-slate-200  bg-white dark:bg-[#0D241B] text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Dana (Rp) *
              </label>
              <input
                type="number"
                required
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-200  bg-white dark:bg-[#0D241B] text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tenggat Waktu
              </label>
              <input
                type="text"
                value={formData.tenggat}
                onChange={(e) => setFormData({ ...formData, tenggat: e.target.value })}
                placeholder="Contoh: 31 Agustus 2026"
                className="w-full p-2.5 rounded-xl border border-slate-200  bg-white dark:bg-[#0D241B] text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              URL / Path Gambar Utama
            </label>
            <input
              type="text"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="Contoh: /images/campaigns/sumur-sumba.jpg"
              className="w-full p-2.5 rounded-xl border border-slate-200  bg-white dark:bg-[#0D241B] text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Ringkasan Singkat (Tampil di Card)
            </label>
            <textarea
              rows={2}
              value={formData.ringkas}
              onChange={(e) => setFormData({ ...formData, ringkas: e.target.value })}
              placeholder="Membangun 12 titik sumur bor untuk 9 kampung..."
              className="w-full p-2.5 rounded-xl border border-slate-200  bg-white dark:bg-[#0D241B] text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Cerita Lengkap & Urgensi Program
            </label>
            <textarea
              rows={4}
              value={formData.cerita}
              onChange={(e) => setFormData({ ...formData, cerita: e.target.value })}
              placeholder="Tuliskan latar belakang masalah, urgensi mustahik..."
              className="w-full p-2.5 rounded-xl border border-slate-200  bg-white dark:bg-[#0D241B] text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Status Kampanye
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200  bg-white dark:bg-[#0D241B] text-slate-900 dark:text-white"
              >
                <option value="Berjalan">Berjalan (Sedang Menghimpun)</option>
                <option value="Tercapai">Tercapai (Target Terpenuhi)</option>
                <option value="Selesai">Selesai (Sudah Disalurkan)</option>
              </select>
            </div>
            <div className="flex items-center pt-5">
              <input
                type="checkbox"
                id="isFeaturedCheck"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4 text-[#0F9D6E] rounded-sm focus:ring-[#0F9D6E] mr-2"
              />
              <label htmlFor="isFeaturedCheck" className="font-bold text-slate-700 dark:text-slate-300">
                Tampilkan di Kampanye Pilihan Beranda
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 ">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
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
              {isSubmitting ? 'Menyimpan...' : selectedCampaign ? 'Simpan Perubahan' : 'Terbitkan Kampanye'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Hapus Program Kampanye"
        subtitle="Apakah Anda yakin ingin menghapus program ini?"
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 dark:text-slate-300">
            Program "<strong>{selectedCampaign?.nama}</strong>" akan dihapus dari sistem.
          </p>
          <div className="flex items-center justify-end gap-3 pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {isSubmitting ? 'Menghapus...' : 'Ya, Hapus'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
