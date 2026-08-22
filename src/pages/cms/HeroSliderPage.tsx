import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Plus,
  Search,
  Edit3,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  Sparkles,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { cmsApi } from '../../lib/api';

export interface HeroSliderItem {
  id: number;
  title: string;
  subtitle: string;
  tag: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  imageUrl: string;
  badge?: string;
  badgeColor?: string;
  isActive: boolean;
  order: number;
}

export const HeroSliderPage: React.FC = () => {
  const [sliders, setSliders] = useState<HeroSliderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedSlider, setSelectedSlider] = useState<HeroSliderItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    tag: 'PROGRAM UTAMA',
    ctaText: 'Tunaikan Zakat',
    ctaLink: '/donasi',
    secondaryCtaText: 'Lihat Program',
    secondaryCtaLink: '/kampanye',
    imageUrl: '',
    badge: 'Program Unggulan',
    badgeColor: '#0F9D6E',
    isActive: true,
    order: 1,
  });

  const loadSliders = async () => {
    setLoading(true);
    try {
      const res = await cmsApi.getHeroSliders();
      setSliders(res || []);
    } catch (error: any) {
      toast.error(`Gagal memuat slider: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSliders();
  }, []);

  const openCreateModal = () => {
    setSelectedSlider(null);
    setFormData({
      title: '',
      subtitle: '',
      tag: 'PROGRAM UTAMA',
      ctaText: 'Tunaikan Zakat',
      ctaLink: '/donasi',
      secondaryCtaText: 'Lihat Program',
      secondaryCtaLink: '/kampanye',
      imageUrl: '/images/hero_slide_green_zakat.jpg',
      badge: 'Program Baru',
      badgeColor: '#0F9D6E',
      isActive: true,
      order: sliders.length + 1,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (slider: HeroSliderItem) => {
    setSelectedSlider(slider);
    setFormData({
      title: slider.title,
      subtitle: slider.subtitle,
      tag: slider.tag || 'PROGRAM UTAMA',
      ctaText: slider.ctaText || 'Tunaikan Zakat',
      ctaLink: slider.ctaLink || '/donasi',
      secondaryCtaText: slider.secondaryCtaText || '',
      secondaryCtaLink: slider.secondaryCtaLink || '',
      imageUrl: slider.imageUrl,
      badge: slider.badge || '',
      badgeColor: slider.badgeColor || '#0F9D6E',
      isActive: slider.isActive,
      order: slider.order,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.subtitle || !formData.imageUrl) {
      toast.error('Judul, deskripsi singkat, dan URL gambar wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (selectedSlider) {
        await cmsApi.updateHeroSlider(selectedSlider.id, formData);
        toast.success('Hero Slider berhasil diperbarui!');
      } else {
        await cmsApi.createHeroSlider(formData);
        toast.success('Hero Slider baru berhasil ditambahkan!');
      }
      setIsModalOpen(false);
      loadSliders();
    } catch (error: any) {
      toast.error(`Gagal menyimpan slider: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSlider) return;
    setIsSubmitting(true);
    try {
      await cmsApi.deleteHeroSlider(selectedSlider.id);
      toast.success('Hero Slider berhasil dihapus.');
      setIsDeleteModalOpen(false);
      loadSliders();
    } catch (error: any) {
      toast.error(`Gagal menghapus: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (slider: HeroSliderItem) => {
    try {
      await cmsApi.updateHeroSlider(slider.id, { isActive: !slider.isActive });
      toast.success(`Banner ${!slider.isActive ? 'diaktifkan' : 'dinonaktifkan'}.`);
      loadSliders();
    } catch (error: any) {
      toast.error(`Gagal mengubah status: ${error.message}`);
    }
  };

  const filteredSliders = sliders.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.subtitle.toLowerCase().includes(search.toLowerCase()) ||
      s.tag.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white  p-6 rounded-2xl border border-slate-100  shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-[#0F9D6E] flex items-center justify-center text-xl shadow-xs">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              Hero Slider & Banner Beranda
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kelola carousel banner utama beranda web publik, teks CTA donasi, dan urutan tayang.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={loadSliders}
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
            Tambah Banner Baru
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex items-center gap-3 bg-white  p-4 rounded-2xl border border-slate-100 ">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari banner berdasarkan judul, tag, atau deskripsi..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200  bg-slate-50 dark:bg-[#0D241B] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F9D6E]"
          />
        </div>
        <span className="text-xs font-bold text-slate-500">
          Total: {filteredSliders.length} Banner
        </span>
      </div>

      {/* Slider Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs font-bold text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0F9D6E]" />
          Memuat data hero slider...
        </div>
      ) : filteredSliders.length === 0 ? (
        <div className="p-12 text-center bg-white  rounded-2xl border border-slate-100 ">
          <ImageIcon className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Belum ada banner slider.</p>
          <p className="text-xs text-slate-400 mt-1">Klik tombol 'Tambah Banner Baru' di atas untuk membuat.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSliders.map((slider) => (
            <div
              key={slider.id}
              className={`group flex flex-col rounded-2xl bg-white  border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md ${
                slider.isActive
                  ? 'border-slate-100 '
                  : 'border-rose-200 dark:border-rose-950/60 opacity-75'
              }`}
            >
              {/* Banner Image Preview */}
              <div className="relative h-44 bg-slate-800 overflow-hidden">
                <img
                  src={slider.imageUrl}
                  alt={slider.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/hero_slide_green_zakat.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/20">
                    Urutan #{slider.order}
                  </span>
                  {slider.badge && (
                    <span
                      className="px-2.5 py-1 rounded-full text-[10px] font-black text-white shadow-xs"
                      style={{ backgroundColor: slider.badgeColor || '#0F9D6E' }}
                    >
                      {slider.badge}
                    </span>
                  )}
                </div>

                <div className="absolute top-3 right-3">
                  <button
                    type="button"
                    onClick={() => toggleStatus(slider)}
                    title={slider.isActive ? 'Nonaktifkan Banner' : 'Aktifkan Banner'}
                    className={`p-1.5 rounded-full backdrop-blur-md transition-colors ${
                      slider.isActive
                        ? 'bg-emerald-500/80 text-white hover:bg-emerald-600'
                        : 'bg-rose-500/80 text-white hover:bg-rose-600'
                    }`}
                  >
                    {slider.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#A5E4CB] flex items-center gap-1 mb-1">
                    <Sparkles className="w-3 h-3" />
                    {slider.tag}
                  </span>
                  <h3 className="text-sm font-black line-clamp-1 leading-snug">{slider.title}</h3>
                </div>
              </div>

              {/* Banner Details */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {slider.subtitle}
                </p>

                <div className="pt-3 border-t border-slate-100  flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#0F9D6E]">
                    <span>CTA: {slider.ctaText}</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(slider)}
                      className="p-2 h-8 w-8 text-slate-700 dark:text-slate-300"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedSlider(slider);
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

      {/* Modal Form Create/Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedSlider ? 'Edit Hero Slider' : 'Tambah Hero Slider Baru'}
        subtitle="Konfigurasi visual banner utama beranda web publik AmanahZakat"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Judul Utama Banner *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Contoh: Wujudkan Ekosistem Berkelanjutan Lewat Green Zakat"
              className="w-full p-2.5 rounded-xl border border-slate-200  bg-white dark:bg-[#0D241B] text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Deskripsi Singkat / Subtitle *
            </label>
            <textarea
              required
              rows={2}
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="Jelaskan pesan inti program atau ajakan kebaikan..."
              className="w-full p-2.5 rounded-xl border border-slate-200  bg-white dark:bg-[#0D241B] text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kategori Tag (Highlight)
              </label>
              <input
                type="text"
                value={formData.tag}
                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                placeholder="Contoh: ZAKAT BERDAYA LINGKUNGAN"
                className="w-full p-2.5 rounded-xl border border-slate-200  bg-white dark:bg-[#0D241B] text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                URL / Path Gambar Banner *
              </label>
              <input
                type="text"
                required
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="Contoh: /images/hero_slide_green_zakat.jpg"
                className="w-full p-2.5 rounded-xl border border-slate-200  bg-white dark:bg-[#0D241B] text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Teks Tombol CTA Utama
              </label>
              <input
                type="text"
                value={formData.ctaText}
                onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                placeholder="Contoh: Tunaikan Zakat"
                className="w-full p-2.5 rounded-xl border border-slate-200  bg-white dark:bg-[#0D241B] text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Link Tombol CTA Utama
              </label>
              <input
                type="text"
                value={formData.ctaLink}
                onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                placeholder="Contoh: /donasi"
                className="w-full p-2.5 rounded-xl border border-slate-200  bg-white dark:bg-[#0D241B] text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Teks Tombol Sekunder (Opsional)
              </label>
              <input
                type="text"
                value={formData.secondaryCtaText}
                onChange={(e) => setFormData({ ...formData, secondaryCtaText: e.target.value })}
                placeholder="Contoh: Lihat Program"
                className="w-full p-2.5 rounded-xl border border-slate-200  bg-white dark:bg-[#0D241B] text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Link Tombol Sekunder
              </label>
              <input
                type="text"
                value={formData.secondaryCtaLink}
                onChange={(e) => setFormData({ ...formData, secondaryCtaLink: e.target.value })}
                placeholder="Contoh: /kampanye"
                className="w-full p-2.5 rounded-xl border border-slate-200  bg-white dark:bg-[#0D241B] text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Badge Pojok
              </label>
              <input
                type="text"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                placeholder="Contoh: Program Unggulan"
                className="w-full p-2.5 rounded-xl border border-slate-200  bg-white dark:bg-[#0D241B] text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Warna Badge
              </label>
              <input
                type="color"
                value={formData.badgeColor}
                onChange={(e) => setFormData({ ...formData, badgeColor: e.target.value })}
                className="w-full h-10 p-1 rounded-xl border border-slate-200  cursor-pointer"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Urutan Tampil (#)
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-200  bg-white dark:bg-[#0D241B] text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActiveCheck"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-[#0F9D6E] rounded-sm focus:ring-[#0F9D6E]"
            />
            <label htmlFor="isActiveCheck" className="font-bold text-slate-700 dark:text-slate-300">
              Aktifkan tayang di slider web publik
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
              {isSubmitting ? 'Menyimpan...' : selectedSlider ? 'Simpan Perubahan' : 'Terbitkan Banner'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Hapus Hero Slider"
        subtitle="Apakah Anda yakin ingin menghapus banner ini dari beranda web publik?"
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 dark:text-slate-300">
            Banner "<strong>{selectedSlider?.title}</strong>" akan dihapus secara permanen.
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
              {isSubmitting ? 'Menghapus...' : 'Ya, Hapus Banner'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
