import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  CheckCircle2,
  AlertCircle,
  MoveUp,
  MoveDown,
  UploadCloud,
  X,
  FileImage,
} from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { cmsApi } from '../../lib/api';
import { resolveMediaUrl } from '../../lib/media-url';
import { preventFileDragDefaults, validateImageFile } from '../../lib/image-upload';
import { useClipboardImagePaste } from '../../hooks/useClipboardImagePaste';

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

export interface HeroSliderPageProps {
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export const HeroSliderPage: React.FC<HeroSliderPageProps> = ({
  canCreate = false,
  canUpdate = false,
  canDelete = false,
}) => {
  const [sliders, setSliders] = useState<HeroSliderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedSlider, setSelectedSlider] = useState<HeroSliderItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    tag: 'PROGRAM UTAMA',
    ctaText: 'Donasi Sekarang',
    ctaLink: '/donasi',
    imageUrl: '',
    badge: '',
    badgeColor: '#0F9D6E',
    isActive: true,
    order: 1,
  });

  const loadSliders = async () => {
    setLoading(true);
    try {
      const res = await cmsApi.getHeroSliders();
      // Sort descending by order, then by id descending
      const sorted = (res || []).sort((a: HeroSliderItem, b: HeroSliderItem) => {
        if (b.order !== a.order) return b.order - a.order;
        return b.id - a.id;
      });
      setSliders(sorted);
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
    setSelectedFile(null);
    setPreviewUrl('');
    const highestOrder = sliders.length > 0 ? Math.max(...sliders.map((s) => s.order || 0)) : 0;
    setFormData({
      title: '',
      subtitle: '',
      tag: 'PROGRAM UTAMA',
      ctaText: 'Donasi Sekarang',
      ctaLink: '/donasi',
      imageUrl: '',
      badge: '',
      badgeColor: '#0F9D6E',
      isActive: true,
      order: highestOrder + 1,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (slider: HeroSliderItem) => {
    setSelectedSlider(slider);
    setSelectedFile(null);
    setPreviewUrl(slider.imageUrl);
    setFormData({
      title: slider.title,
      subtitle: slider.subtitle,
      tag: slider.tag || 'PROGRAM UTAMA',
      ctaText: slider.ctaText || 'Donasi Sekarang',
      ctaLink: slider.ctaLink || '/donasi',
      imageUrl: slider.imageUrl,
      badge: slider.badge || '',
      badgeColor: slider.badgeColor || '#0F9D6E',
      isActive: slider.isActive,
      order: slider.order,
    });
    setIsModalOpen(true);
  };

  const applySelectedImage = useCallback((file: File) => {
    const err = validateImageFile(file);
    if (err) {
      toast.error(err);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSelectedFile(file);
    setPreviewUrl((prev) => {
      if (prev.startsWith('blob:')) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) applySelectedImage(file);
  };

  const handleDropImage = (e: React.DragEvent<HTMLDivElement>) => {
    preventFileDragDefaults(e);
    const file = e.dataTransfer.files?.[0];
    if (file) applySelectedImage(file);
  };

  useClipboardImagePaste(isModalOpen, applySelectedImage);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.subtitle) {
      toast.error('Judul utama dan deskripsi singkat wajib diisi.');
      return;
    }

    if (!selectedFile && !formData.imageUrl) {
      toast.error('Silakan upload gambar banner terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalImageUrl = formData.imageUrl;

      // Upload file to backend/uploads/slider if a new file is chosen
      if (selectedFile) {
        setIsUploading(true);
        const uploadRes = await cmsApi.uploadSlider(selectedFile);
        finalImageUrl = uploadRes.url;
        setIsUploading(false);
      }

      const payload = {
        title: formData.title,
        subtitle: formData.subtitle,
        tag: formData.tag || 'PROGRAM UTAMA',
        ctaText: formData.ctaText || 'Donasi Sekarang',
        ctaLink: formData.ctaLink || '/donasi',
        imageUrl: finalImageUrl,
        badge: formData.badge,
        badgeColor: formData.badgeColor,
        isActive: formData.isActive,
        order: formData.order,
      };

      if (selectedSlider) {
        await cmsApi.updateHeroSlider(selectedSlider.id, payload);
        toast.success('Hero Slider berhasil diperbarui!');
      } else {
        await cmsApi.createHeroSlider(payload);
        toast.success('Hero Slider baru berhasil ditambahkan!');
      }

      setIsModalOpen(false);
      loadSliders();
    } catch (error: any) {
      toast.error(`Gagal menyimpan slider: ${error.message}`);
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
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
      toast.success(`Banner #${slider.order} ${!slider.isActive ? 'diaktifkan' : 'dinonaktifkan'}.`);
      loadSliders();
    } catch (error: any) {
      toast.error(`Gagal mengubah status: ${error.message}`);
    }
  };

  const adjustOrder = async (slider: HeroSliderItem, delta: number) => {
    try {
      const newOrder = Math.max(1, (slider.order || 1) + delta);
      await cmsApi.updateHeroSlider(slider.id, { order: newOrder });
      toast.success(`Urutan banner diubah menjadi #${newOrder}`);
      loadSliders();
    } catch (error: any) {
      toast.error(`Gagal mengubah urutan: ${error.message}`);
    }
  };

  const activeSliders = sliders.filter((s) => s.isActive);

  const filteredSliders = sliders.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.subtitle.toLowerCase().includes(search.toLowerCase()) ||
      s.tag.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E3E8E4] shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#E6F6EF] border border-[#BFE4D4] text-[#0F9D6E] flex items-center justify-center text-xl shadow-xs shrink-0">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-[25px] font-extrabold text-[#16211D] tracking-tight">
              Hero Slider & Banner Beranda
            </h1>
            <p className="text-[13px] text-[#7D938A] mt-0.5">
              Kelola banner utama beranda web publik. Maksimal 5 banner aktif teratas otomatis tayang (Urutan Descending).
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={loadSliders}
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
              className="flex items-center gap-2 text-xs"
            >
              <Plus className="w-4 h-4" />
              Tambah Banner Baru
            </Button>
          )}
        </div>
      </div>

      {/* Info Notice Banner */}
      <div className="flex items-start gap-3 p-4 bg-[#E6F6EF] border border-[#BFE4D4] rounded-2xl text-xs text-[#0B7C56]">
        <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-[#0F9D6E]" />
        <div className="space-y-0.5">
          <p className="font-bold text-[#0B7C56] text-sm">
            Aturan Tayang: Maksimal 5 Banner Aktif Teratas (Order Descending)
          </p>
          <p className="text-[#3E5C4E] leading-relaxed">
            Upload langsung gambar banner (maksimal 50 MB, tersimpan di <code>backend/uploads/slider</code>). Banner aktif dengan nilai urutan tertinggi otomatis tampil di posisi Slide #1, #2, dst.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E3E8E4]">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#7D938A]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari banner berdasarkan judul, tag, atau deskripsi..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-[#DDE3DF] bg-[#F4F6F4] text-[#16211D] placeholder-[#7D938A] focus:outline-none focus:ring-2 focus:ring-[#0F9D6E]"
          />
        </div>
        <div className="flex items-center gap-3 text-xs font-bold text-[#7D938A]">
          <span className="px-2.5 py-1 rounded-full bg-[#F4F6F4] border border-[#DDE3DF] text-[#16211D]">
            Total: {filteredSliders.length} Banner
          </span>
          <span className="px-2.5 py-1 rounded-full bg-[#E6F6EF] text-[#0B7C56] border border-[#BFE4D4]">
            {activeSliders.length} Aktif ({Math.min(5, activeSliders.length)} Tayang di Web)
          </span>
        </div>
      </div>

      {/* List / Table View */}
      {loading ? (
        <div className="p-16 text-center text-xs font-bold text-[#7D938A] bg-white rounded-2xl border border-[#E3E8E4]">
          <RefreshCw className="w-7 h-7 animate-spin mx-auto mb-3 text-[#0F9D6E]" />
          Memuat data hero slider...
        </div>
      ) : filteredSliders.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-[#E3E8E4]">
          <ImageIcon className="w-12 h-12 mx-auto text-[#DDE3DF] mb-3" />
          <p className="text-sm font-bold text-[#16211D]">Belum ada banner slider.</p>
          <p className="text-xs text-[#7D938A] mt-1">Klik tombol 'Tambah Banner Baru' di atas untuk membuat slider baru.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E3E8E4] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#16211D]">
              <thead>
                <tr className="border-b border-[#E3E8E4] bg-[#F4F6F4] text-[#7D938A] uppercase tracking-wider font-extrabold text-[10.5px]">
                  <th className="py-3.5 px-4 text-center w-20">URUTAN</th>
                  <th className="py-3.5 px-4 w-32">PREVIEW GAMBAR</th>
                  <th className="py-3.5 px-4">INFORMASI BANNER & DESKRIPSI</th>
                  <th className="py-3.5 px-4 w-44">TOMBOL CTA</th>
                  <th className="py-3.5 px-4 text-center w-36">STATUS TAYANG</th>
                  <th className="py-3.5 px-4 text-center w-28">STATUS</th>
                  <th className="py-3.5 px-4 text-right w-28">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E8E4]">
                {filteredSliders.map((slider) => {
                  const activeIndex = activeSliders.findIndex((s) => s.id === slider.id);
                  const isTayang = slider.isActive && activeIndex >= 0 && activeIndex < 5;

                  return (
                    <tr
                      key={slider.id}
                      className={`hover:bg-[#F4F6F4]/60 transition-colors ${
                        !slider.isActive ? 'bg-slate-50/50 opacity-75' : ''
                      }`}
                    >
                      {/* Urutan / Order */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-mono font-extrabold text-sm px-2.5 py-0.5 rounded-lg bg-[#F4F6F4] border border-[#DDE3DF] text-[#16211D]">
                            #{slider.order}
                          </span>
                          <div className="flex items-center gap-0.5">
                            <button
                              type="button"
                              onClick={() => adjustOrder(slider, 1)}
                              title="Tingkatkan Urutan (+1)"
                              className="p-1 hover:bg-[#E3E8E4] rounded text-[#7D938A] hover:text-[#0F9D6E] cursor-pointer"
                            >
                              <MoveUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => adjustOrder(slider, -1)}
                              title="Turunkan Urutan (-1)"
                              className="p-1 hover:bg-[#E3E8E4] rounded text-[#7D938A] hover:text-rose-600 cursor-pointer"
                            >
                              <MoveDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Thumbnail Gambar */}
                      <td className="py-4 px-4">
                        <div className="w-28 h-16 rounded-xl overflow-hidden border border-[#DDE3DF] bg-slate-100 relative group shadow-xs">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={resolveMediaUrl(slider.imageUrl)}
                            alt={slider.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              if (!target.dataset.triedFallback) {
                                target.dataset.triedFallback = '1';
                                target.src = resolveMediaUrl('/images/hero_slide_green_zakat.jpg');
                              }
                            }}
                          />
                        </div>
                      </td>

                      {/* Informasi Banner & Deskripsi */}
                      <td className="py-4 px-4 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E6F6EF] text-[#0F9D6E] border border-[#BFE4D4] flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            {slider.tag}
                          </span>
                          {slider.badge && (
                            <span
                              className="text-[9.5px] font-bold px-2 py-0.5 rounded-full text-white shadow-xs"
                              style={{ backgroundColor: slider.badgeColor || '#0F9D6E' }}
                            >
                              {slider.badge}
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-sm text-[#16211D] leading-snug">
                          {slider.title}
                        </h3>

                        <p className="text-xs text-[#7D938A] line-clamp-1 max-w-xl leading-relaxed">
                          {slider.subtitle}
                        </p>
                      </td>

                      {/* Tombol CTA (1 Button Saja) */}
                      <td className="py-4 px-4 space-y-1">
                        <div className="flex items-center gap-1 font-bold text-xs text-[#0F9D6E]">
                          <span>{slider.ctaText || 'Donasi Sekarang'}</span>
                          <ExternalLink className="w-3 h-3 text-[#7D938A]" />
                        </div>
                        <span className="text-[10px] text-[#7D938A] font-mono block truncate">
                          {slider.ctaLink || '/donasi'}
                        </span>
                      </td>

                      {/* Status Tayang di Web */}
                      <td className="py-4 px-4 text-center">
                        {isTayang ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-[#E6F6EF] text-[#0B7C56] border border-[#BFE4D4]">
                            <CheckCircle2 className="w-3 h-3" />
                            Tayang di Web #{activeIndex + 1}
                          </span>
                        ) : slider.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-[#F4F6F4] text-[#7D938A] border border-[#DDE3DF]" title="Di luar 5 teratas, disimpan sebagai cadangan">
                            <AlertCircle className="w-3 h-3 text-amber-500" />
                            Antrean Cadangan
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium bg-[#FBEeed] text-[#B83D32] border border-[#F2D1CE]">
                            Nonaktif
                          </span>
                        )}
                      </td>

                      {/* Status Toggle */}
                      <td className="py-4 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => toggleStatus(slider)}
                          title={slider.isActive ? 'Klik untuk Nonaktifkan' : 'Klik untuk Aktifkan'}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                            slider.isActive
                              ? 'bg-[#E6F6EF] text-[#0B7C56] hover:bg-emerald-200 border border-[#BFE4D4]'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-300'
                          }`}
                        >
                          {slider.isActive ? (
                            <>
                              <Eye className="w-3 h-3 text-[#0F9D6E]" />
                              <span>Aktif</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3 text-slate-400" />
                              <span>Mati</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Aksi Edit / Hapus */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {canUpdate && (
                            <button
                              type="button"
                              onClick={() => openEditModal(slider)}
                              className="p-1.5 rounded-lg border border-[#DDE3DF] hover:bg-[#E6F6EF] text-[#4D5C56] hover:text-[#0F9D6E] transition-colors cursor-pointer"
                              title="Edit Slider"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedSlider(slider);
                                setIsDeleteModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-[#B83D32] transition-colors cursor-pointer"
                              title="Hapus Slider"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Tambah / Edit Hero Slider (Form Sederhana & Langsung Upload Gambar) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedSlider ? 'Edit Hero Slider' : 'Tambah Hero Slider Baru'}
        maxWidth="lg"
        maximizable
      >
        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
          {/* 1. Upload Langsung Gambar Banner (Max 50 MB) */}
          <div className="space-y-2">
            <label className="block font-bold text-[#16211D]">
              Gambar Banner Slider (Upload / Drag / Paste, Maksimal 50 MB) *
            </label>

            {previewUrl ? (
              <div
                className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 bg-slate-100 shadow-xs group"
                tabIndex={0}
                onDragOver={preventFileDragDefaults}
                onDrop={handleDropImage}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolveMediaUrl(previewUrl)}
                  alt="Preview Banner"
                  className="w-full max-h-72 object-contain bg-slate-100"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (!target.dataset.triedFallback) {
                      target.dataset.triedFallback = '1';
                      target.src = resolveMediaUrl('/images/hero_slide_green_zakat.jpg');
                    }
                  }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs flex items-center gap-1.5"
                  >
                    <UploadCloud className="w-4 h-4" />
                    Ganti Gambar
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl((prev) => {
                        if (prev.startsWith('blob:')) URL.revokeObjectURL(prev);
                        return '';
                      });
                      setFormData({ ...formData, imageUrl: '' });
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="text-xs flex items-center gap-1.5"
                  >
                    <X className="w-4 h-4" />
                    Hapus
                  </Button>
                </div>
                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-[10px] font-mono flex items-center gap-1.5">
                  <FileImage className="w-3 h-3 text-[#A5E4CB]" />
                  {selectedFile ? `${selectedFile.name} (${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)` : 'Gambar Tersimpan di Server'}
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={preventFileDragDefaults}
                onDrop={handleDropImage}
                className="border-2 border-dashed border-[#BFE4D4] hover:border-[#0F9D6E] bg-[#E6F6EF]/40 hover:bg-[#E6F6EF]/70 transition-all rounded-2xl p-6 text-center cursor-pointer space-y-2 group"
              >
                <div className="w-12 h-12 rounded-full bg-white text-[#0F9D6E] flex items-center justify-center mx-auto shadow-xs group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-sm text-[#16211D]">
                    Klik, tarik file, atau tempel (Ctrl+V) gambar di sini
                  </p>
                  <p className="text-[11px] text-[#7D938A] mt-0.5">
                    Format: JPG, PNG, WEBP, SVG · Maks 50 MB · Bisa paste dari browser / clipboard
                  </p>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* 2. Judul Utama Banner (H1) */}
          <div className="space-y-1.5">
            <label className="block font-bold text-[#16211D]">
              Judul Utama Banner *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Contoh: Darurat Kemanusiaan: Bantuan Pangan & Medis Mustahik"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE3DF] bg-white text-[#16211D] font-bold text-sm focus:ring-2 focus:ring-[#0F9D6E] focus:outline-none placeholder-[#7D938A]"
            />
          </div>

          {/* 3. Deskripsi Singkat (Maksimal 2 Baris) */}
          <div className="space-y-1.5">
            <label className="block font-bold text-[#16211D]">
              Deskripsi Singkat (Cukup 2 Baris) *
            </label>
            <textarea
              required
              rows={2}
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="Contoh: Bantu saudara kita yang membutuhkan pangan pokok, pemenuhan gizi balita cegah stunting, dan beasiswa yatim."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE3DF] bg-white text-[#16211D] focus:ring-2 focus:ring-[#0F9D6E] focus:outline-none placeholder-[#7D938A] leading-relaxed"
            />
          </div>

          {/* 4. Tag Kategori & Badge */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block font-bold text-[#16211D]">Tag Kategori Atas</label>
              <input
                type="text"
                value={formData.tag}
                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                placeholder="Contoh: RESPON KEMANUSIAAN CEPAT"
                className="w-full px-3 py-2 rounded-xl border border-[#DDE3DF] bg-white text-[#16211D] focus:ring-2 focus:ring-[#0F9D6E] focus:outline-none font-bold uppercase"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block font-bold text-[#16211D]">Label Badge Unggulan (Opsional)</label>
              <input
                type="text"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                placeholder="Contoh: Tanggap Bencana"
                className="w-full px-3 py-2 rounded-xl border border-[#DDE3DF] bg-white text-[#16211D] focus:ring-2 focus:ring-[#0F9D6E] focus:outline-none"
              />
            </div>
          </div>

          {/* 5. Tombol CTA Utama (Hanya 1 Tombol) */}
          <div className="p-3.5 rounded-xl bg-[#F4F6F4] border border-[#E3E8E4] space-y-3">
            <span className="block font-bold text-[#16211D] text-xs">
              Pengaturan Tombol Ajakan (Tombol Hijau Tunggal)
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-[#4D5C56]">Teks Tombol</label>
                <input
                  type="text"
                  required
                  value={formData.ctaText}
                  onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                  placeholder="Contoh: Bantu Sekarang / Donasi Sekarang"
                  className="w-full px-3 py-2 rounded-xl border border-[#DDE3DF] bg-white text-[#16211D] font-bold focus:ring-2 focus:ring-[#0F9D6E] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-[#4D5C56]">Tautan URL</label>
                <input
                  type="text"
                  required
                  value={formData.ctaLink}
                  onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                  placeholder="Contoh: /donasi atau /donasi?campaign=palestina"
                  className="w-full px-3 py-2 rounded-xl border border-[#DDE3DF] bg-white text-[#16211D] font-mono text-xs focus:ring-2 focus:ring-[#0F9D6E] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 6. Urutan Tayang & Status Aktif */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <label className="block font-bold text-[#16211D]">
                Nilai Urutan Tayang (Order Descending)
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value, 10) || 1 })}
                className="w-full px-3 py-2 rounded-xl border border-[#DDE3DF] bg-white text-[#16211D] font-mono font-bold focus:ring-2 focus:ring-[#0F9D6E] focus:outline-none"
              />
              <p className="text-[10px] text-[#7D938A]">Nilai lebih besar akan tayang lebih awal (Slide #1, #2, dst).</p>
            </div>
            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-[#0F9D6E] focus:ring-[#0F9D6E] accent-[#0F9D6E]"
                />
                <span className="font-bold text-[#16211D]">
                  Status Aktif (Tayangkan di Slider Web)
                </span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2.5 pt-4 border-t border-[#E3E8E4]">
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
              className="flex items-center gap-2 bg-[#0F9D6E] hover:bg-[#0B7C56] text-white"
            >
              {isSubmitting || isUploading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  {isUploading ? 'Mengunggah Gambar (Max 50MB)...' : 'Menyimpan...'}
                </>
              ) : selectedSlider ? (
                'Simpan Perubahan'
              ) : (
                'Buat Banner Baru'
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Konfirmasi Hapus */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Konfirmasi Hapus Banner"
        maxWidth="sm"
      >
        <div className="space-y-4 font-sans text-xs">
          <p className="text-[#16211D]">
            Apakah Anda yakin ingin menghapus banner slider <strong>"{selectedSlider?.title}"</strong>?
          </p>
          <div className="flex justify-end gap-2 pt-3 border-t border-[#E3E8E4]">
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
              variant="danger"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Menghapus...' : 'Hapus Banner'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
