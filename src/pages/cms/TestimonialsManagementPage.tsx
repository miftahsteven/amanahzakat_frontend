import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  Plus,
  Search,
  Edit3,
  Trash2,
  Star,
  Quote,
  MapPin,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { ImageUrlField } from '../../components/ui/ImageUrlField';
import { cmsApi } from '../../lib/api';

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  location: string;
  program: string;
  quote: string;
  avatarUrl?: string;
  rating: number;
  isPublished: boolean;
  order: number;
}

export interface TestimonialsManagementPageProps {
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export const TestimonialsManagementPage: React.FC<TestimonialsManagementPageProps> = ({
  canCreate = false,
  canUpdate = false,
  canDelete = false,
}) => {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedTesti, setSelectedTesti] = useState<TestimonialItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    role: 'Muzakki Prioritas',
    location: 'Jakarta',
    program: 'Zakat Maal',
    quote: '',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    isPublished: true,
    order: 1,
  });

  const loadTestimonials = async () => {
    setLoading(true);
    try {
      const res = await cmsApi.getTestimonials();
      setTestimonials(res || []);
    } catch (error: any) {
      toast.error(`Gagal memuat testimoni: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTestimonials();
  }, []);

  const openCreateModal = () => {
    setSelectedTesti(null);
    setFormData({
      name: '',
      role: 'Muzakki Prioritas',
      location: 'Jakarta',
      program: 'Zakat Maal',
      quote: '',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      rating: 5,
      isPublished: true,
      order: testimonials.length + 1,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (testi: TestimonialItem) => {
    setSelectedTesti(testi);
    setFormData({
      name: testi.name,
      role: testi.role,
      location: testi.location,
      program: testi.program,
      quote: testi.quote,
      avatarUrl: testi.avatarUrl || '',
      rating: testi.rating,
      isPublished: testi.isPublished,
      order: testi.order,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.quote) {
      toast.error('Nama dan kutipan testimoni wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (selectedTesti) {
        await cmsApi.updateTestimonial(selectedTesti.id, formData);
        toast.success('Testimoni berhasil diperbarui!');
      } else {
        await cmsApi.createTestimonial(formData);
        toast.success('Testimoni baru berhasil ditambahkan!');
      }
      setIsModalOpen(false);
      loadTestimonials();
    } catch (error: any) {
      toast.error(`Gagal menyimpan testimoni: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTesti) return;
    setIsSubmitting(true);
    try {
      await cmsApi.deleteTestimonial(selectedTesti.id);
      toast.success('Testimoni berhasil dihapus.');
      setIsDeleteModalOpen(false);
      loadTestimonials();
    } catch (error: any) {
      toast.error(`Gagal menghapus: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (testi: TestimonialItem) => {
    try {
      await cmsApi.updateTestimonial(testi.id, { isPublished: !testi.isPublished });
      toast.success(`Testimoni ${!testi.isPublished ? 'ditayangkan' : 'disembunyikan'}.`);
      loadTestimonials();
    } catch (error: any) {
      toast.error(`Gagal mengubah status: ${error.message}`);
    }
  };

  const filtered = testimonials.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.role.toLowerCase().includes(search.toLowerCase()) ||
      t.program.toLowerCase().includes(search.toLowerCase()) ||
      t.quote.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white  p-6 rounded-2xl border border-slate-100  shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-[#0F9D6E] flex items-center justify-center text-xl shadow-xs">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              Testimoni & Kisah Inspirasi
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kelola testimoni muzakki, mustahik binaan, dan kisah nyata dampak kebaikan publik.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={loadTestimonials}
            className="flex items-center gap-2 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {canCreate && (
            <Button
              type="button"
              variant="primary"
              onClick={openCreateModal}
              className="flex items-center gap-2 text-xs bg-[#0F9D6E] hover:bg-[#09825A] text-white"
            >
              <Plus className="w-4 h-4" />
              Tambah Testimoni Baru
            </Button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 bg-white  p-4 rounded-2xl border border-slate-100 ">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari testimoni berdasarkan nama, peran, program, atau kutipan..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200  bg-slate-50 dark:bg-[#0D241B] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F9D6E]"
          />
        </div>
        <span className="text-xs font-bold text-slate-500">
          Total: {filtered.length} Testimoni
        </span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs font-bold text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0F9D6E]" />
          Memuat testimoni...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white  rounded-2xl border border-slate-100 ">
          <Quote className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Belum ada testimoni.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((t) => (
            <div
              key={t.id}
              className={`flex flex-col justify-between p-5 rounded-2xl bg-white  border transition-all ${
                t.isPublished
                  ? 'border-slate-100 '
                  : 'border-rose-200 dark:border-rose-950/60 opacity-70'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400">#{t.order}</span>
                    <button
                      type="button"
                      onClick={() => toggleStatus(t)}
                      title={t.isPublished ? 'Sembunyikan' : 'Tayangkan'}
                      className={`p-1 rounded-md text-xs ${
                        t.isPublished
                          ? 'bg-emerald-50 text-[#0F9D6E] dark:bg-emerald-950'
                          : 'bg-rose-50 text-rose-600 dark:bg-rose-950'
                      }`}
                    >
                      {t.isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-200 italic leading-relaxed">
                  "{t.quote}"
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100  flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <img
                    src={t.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'}
                    alt={t.name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200 "
                  />
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white leading-snug">
                      {t.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 block">
                      {t.role} • {t.location}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {canUpdate && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(t)}
                      className="p-1.5 h-7 w-7 text-slate-700 dark:text-slate-300"
                    >
                      <Edit3 className="w-3 h-3" />
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTesti(t);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-1.5 h-7 w-7 text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-900"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedTesti ? 'Edit Testimoni' : 'Tambah Testimoni Baru'}
        subtitle="Form publikasi testimoni muzakki dan kisah binaan mustahik"
        maxWidth="md"
        maximizable
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nama Lengkap Tokoh / Muzakki / Mustahik *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: H. Ahmad Dahlan, S.E."
              className="w-full p-2.5 rounded-xl border border-slate-200  bg-white dark:bg-[#0D241B] text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Peran / Status Tokoh
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="Contoh: Muzakki Prioritas / Mustahik Binaan"
                className="w-full p-2.5 rounded-xl border border-slate-200  bg-white dark:bg-[#0D241B] text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kota / Wilayah
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Contoh: Jakarta Pusat"
                className="w-full p-2.5 rounded-xl border border-slate-200  bg-white dark:bg-[#0D241B] text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Program Terkait
              </label>
              <input
                type="text"
                value={formData.program}
                onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                placeholder="Contoh: Zakat Maal & Wakaf"
                className="w-full p-2.5 rounded-xl border border-slate-200  bg-white dark:bg-[#0D241B] text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Rating Bintang (1-5)
              </label>
              <select
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-200  bg-white dark:bg-[#0D241B] text-slate-900 dark:text-white"
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5 Bintang)</option>
                <option value={4}>⭐⭐⭐⭐ (4 Bintang)</option>
                <option value={3}>⭐⭐⭐ (3 Bintang)</option>
              </select>
            </div>
          </div>

          <ImageUrlField
            label="URL / Foto Profil Avatar"
            value={formData.avatarUrl ?? ''}
            onChange={(avatarUrl) => setFormData({ ...formData, avatarUrl })}
            pasteEnabled={isModalOpen}
          />

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Kutipan Testimoni / Kisah *
            </label>
            <textarea
              required
              rows={3}
              value={formData.quote}
              onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
              placeholder="Tuliskan pengalaman muzakki atau dampak bantuan pada mustahik..."
              className="w-full p-2.5 rounded-xl border border-slate-200  bg-white dark:bg-[#0D241B] text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isPublishedCheck"
              checked={formData.isPublished}
              onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
              className="w-4 h-4 text-[#0F9D6E] rounded-sm focus:ring-[#0F9D6E]"
            />
            <label htmlFor="isPublishedCheck" className="font-bold text-slate-700 dark:text-slate-300">
              Tayangkan di bagian Testimoni web publik
            </label>
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
              {isSubmitting ? 'Menyimpan...' : selectedTesti ? 'Simpan Perubahan' : 'Simpan Testimoni'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Hapus Testimoni"
        subtitle="Apakah Anda yakin ingin menghapus testimoni ini?"
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 dark:text-slate-300">
            Testimoni dari "<strong>{selectedTesti?.name}</strong>" akan dihapus permanen.
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
