import React, { useState, useEffect } from 'react';
import {
  FileBarChart,
  Plus,
  Search,
  Edit3,
  Trash2,
  ExternalLink,
  MapPin,
  Calendar,
  Users,
  Building2,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { cmsApi } from '../../lib/api';
import { webPublicPageUrl } from '../../lib/media-url';

export interface DistributionItem {
  id: number;
  slug: string;
  judul: string;
  program: string;
  kampanye: string;
  lokasi: string;
  tgl: string;
  nominal: number;
  penerima: number;
  asnaf: string;
  mitra: string;
  status: string;
  ringkas: string;
  isi: string;
  imageUrl: string;
}

export const DistributionsManagementPage: React.FC = () => {
  const [items, setItems] = useState<DistributionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<DistributionItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState({
    judul: '',
    program: 'Wakaf Sumur',
    kampanye: 'Sumur Kehidupan Sumba Timur',
    lokasi: 'Sumba Timur, NTT',
    tgl: '24 Juli 2026',
    nominal: 50000000,
    penerima: 250,
    asnaf: 'Miskin',
    mitra: 'Relawan Air Amanah',
    status: 'Terbit',
    ringkas: '',
    isi: '',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f8?auto=format&fit=crop&w=1000&q=80',
  });

  const loadDistributions = async () => {
    setLoading(true);
    try {
      const res = await cmsApi.getDistributions();
      setItems(res || []);
    } catch (error: any) {
      toast.error(`Gagal memuat kabar penyaluran: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDistributions();
  }, []);

  const openCreateModal = () => {
    setSelectedItem(null);
    setFormData({
      judul: '',
      program: 'Wakaf Sumur',
      kampanye: 'Sumur Kehidupan Sumba Timur',
      lokasi: 'Sumba Timur, NTT',
      tgl: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      nominal: 50000000,
      penerima: 250,
      asnaf: 'Miskin',
      mitra: 'Relawan Air Amanah',
      status: 'Terbit',
      ringkas: '',
      isi: '',
      imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f8?auto=format&fit=crop&w=1000&q=80',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: DistributionItem) => {
    setSelectedItem(item);
    setFormData({
      judul: item.judul,
      program: item.program,
      kampanye: item.kampanye,
      lokasi: item.lokasi,
      tgl: item.tgl,
      nominal: item.nominal,
      penerima: item.penerima,
      asnaf: item.asnaf,
      mitra: item.mitra,
      status: item.status,
      ringkas: item.ringkas,
      isi: item.isi,
      imageUrl: item.imageUrl,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.judul || !formData.nominal) {
      toast.error('Judul artikel dan nominal penyaluran wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (selectedItem) {
        await cmsApi.updateDistribution(selectedItem.id, formData);
        toast.success('Kabar penyaluran berhasil diperbarui!');
      } else {
        await cmsApi.createDistribution(formData);
        toast.success('Kabar penyaluran baru berhasil diterbitkan!');
      }
      setIsModalOpen(false);
      loadDistributions();
    } catch (error: any) {
      toast.error(`Gagal menyimpan artikel: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    setIsSubmitting(true);
    try {
      await cmsApi.deleteDistribution(selectedItem.id);
      toast.success('Kabar penyaluran berhasil dihapus.');
      setIsDeleteModalOpen(false);
      loadDistributions();
    } catch (error: any) {
      toast.error(`Gagal menghapus: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = items.filter(
    (i) =>
      i.judul.toLowerCase().includes(search.toLowerCase()) ||
      i.program.toLowerCase().includes(search.toLowerCase()) ||
      i.lokasi.toLowerCase().includes(search.toLowerCase()) ||
      i.asnaf.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white  p-6 rounded-2xl border border-slate-100  shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-[#0F9D6E] flex items-center justify-center text-xl shadow-xs">
            <FileBarChart className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              Kabar & Berita Penyaluran Lapangan
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Publikasikan laporan aksi nyata distribusi bantuan, rincian biaya, asnaf, dan mitra pelaksana.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={loadDistributions}
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
            Tulis Kabar Penyaluran
          </Button>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex items-center gap-3 bg-white  p-4 rounded-2xl border border-slate-100 ">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kabar penyaluran berdasarkan judul, lokasi, atau asnaf..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200  bg-slate-50 dark:bg-[#0D241B] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F9D6E]"
          />
        </div>
        <span className="text-xs font-bold text-slate-500">
          Total: {filtered.length} Berita
        </span>
      </div>

      {/* Grid of news */}
      {loading ? (
        <div className="p-12 text-center text-xs font-bold text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0F9D6E]" />
          Memuat kabar penyaluran...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white  rounded-2xl border border-slate-100 ">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Belum ada artikel penyaluran.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="flex flex-col rounded-2xl bg-white  border border-slate-100  overflow-hidden shadow-xs hover:shadow-md transition-all"
            >
              <div className="relative h-44 bg-slate-800">
                <img
                  src={item.imageUrl}
                  alt={item.judul}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-[#0F9D6E] text-white">
                    Asnaf: {item.asnaf}
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-white">
                    {item.tgl}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[10px] font-bold text-slate-300 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {item.lokasi}
                  </span>
                  <h3 className="text-sm font-black line-clamp-1">{item.judul}</h3>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {item.ringkas}
                </p>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0D241B] space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Nominal Penyaluran:</span>
                    <span className="font-extrabold text-[#0F9D6E]">
                      Rp {item.nominal.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Penerima Manfaat:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-400" />
                      {item.penerima.toLocaleString('id-ID')} Jiwa
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Mitra Pelaksana:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 truncate max-w-[150px]">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      {item.mitra}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100  flex items-center justify-between gap-2">
                  <a
                    href={webPublicPageUrl(`/kabar-penyaluran/${item.slug}`)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-[#0F9D6E] hover:underline flex items-center gap-1"
                  >
                    <span>Baca di Web</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(item)}
                      className="p-2 h-8 w-8 text-slate-700 dark:text-slate-300"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedItem(item);
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
          ))}
        </div>
      )}

      {/* Modal Create/Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedItem ? 'Edit Kabar Penyaluran' : 'Tulis Kabar Penyaluran Baru'}
        subtitle="Form publikasi laporan penyaluran dana zakat & infak ke publik"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Judul Artikel Penyaluran *
            </label>
            <input
              type="text"
              required
              value={formData.judul}
              onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
              placeholder="Contoh: Sumur ke-9 Mengalir di Kampung Praiwitu"
              className="w-full p-2.5 rounded-xl border border-slate-200  bg-white dark:bg-[#0D241B] text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Pilar Program
              </label>
              <input
                type="text"
                value={formData.program}
                onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                placeholder="Contoh: Wakaf Sumur / Kemanusiaan"
                className="w-full p-2.5 rounded-xl border border-slate-200  bg-white dark:bg-[#0D241B] text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Terkait Kampanye
              </label>
              <input
                type="text"
                value={formData.kampanye}
                onChange={(e) => setFormData({ ...formData, kampanye: e.target.value })}
                placeholder="Contoh: Sumur Kehidupan Sumba Timur"
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
                Nominal Tersalur (Rp) *
              </label>
              <input
                type="number"
                required
                value={formData.nominal}
                onChange={(e) => setFormData({ ...formData, nominal: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-200  bg-white dark:bg-[#0D241B] text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Jumlah Penerima (Jiwa)
              </label>
              <input
                type="number"
                value={formData.penerima}
                onChange={(e) => setFormData({ ...formData, penerima: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-200  bg-white dark:bg-[#0D241B] text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Golongan Asnaf
              </label>
              <select
                value={formData.asnaf}
                onChange={(e) => setFormData({ ...formData, asnaf: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200  bg-white dark:bg-[#0D241B] text-slate-900 dark:text-white"
              >
                <option value="Fakir">Fakir</option>
                <option value="Miskin">Miskin</option>
                <option value="Fisabilillah">Fisabilillah</option>
                <option value="Ibnu Sabil">Ibnu Sabil</option>
                <option value="Gharimin">Gharimin</option>
                <option value="Mualaf">Mualaf</option>
                <option value="Riqab">Riqab</option>
                <option value="Amil">Amil</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Mitra Lapangan
              </label>
              <input
                type="text"
                value={formData.mitra}
                onChange={(e) => setFormData({ ...formData, mitra: e.target.value })}
                placeholder="Contoh: Yayasan Hijau Lestari"
                className="w-full p-2.5 rounded-xl border border-slate-200  bg-white dark:bg-[#0D241B] text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Penyaluran
              </label>
              <input
                type="text"
                value={formData.tgl}
                onChange={(e) => setFormData({ ...formData, tgl: e.target.value })}
                placeholder="Contoh: 24 Juli 2026"
                className="w-full p-2.5 rounded-xl border border-slate-200  bg-white dark:bg-[#0D241B] text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              URL / Foto Dokumentasi Penyaluran
            </label>
            <input
              type="text"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://..."
              className="w-full p-2.5 rounded-xl border border-slate-200  bg-white dark:bg-[#0D241B] text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Ringkasan Singkat (Lead Berita)
            </label>
            <textarea
              rows={2}
              value={formData.ringkas}
              onChange={(e) => setFormData({ ...formData, ringkas: e.target.value })}
              placeholder="Ringkasan poin utama penyaluran..."
              className="w-full p-2.5 rounded-xl border border-slate-200  bg-white dark:bg-[#0D241B] text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Isi Lengkap Berita Liputan
            </label>
            <textarea
              rows={4}
              value={formData.isi}
              onChange={(e) => setFormData({ ...formData, isi: e.target.value })}
              placeholder="Tuliskan jalannya penyaluran, kutipan mustahik, suasana lapangan..."
              className="w-full p-2.5 rounded-xl border border-slate-200  bg-white dark:bg-[#0D241B] text-slate-900 dark:text-white"
            />
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
              {isSubmitting ? 'Menyimpan...' : selectedItem ? 'Simpan Perubahan' : 'Terbitkan Berita'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Hapus Kabar Penyaluran"
        subtitle="Apakah Anda yakin ingin menghapus kabar ini?"
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 dark:text-slate-300">
            Kabar "<strong>{selectedItem?.judul}</strong>" akan dihapus dari publikasi web.
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
