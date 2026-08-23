import React, { useState, useEffect, useRef } from 'react';
import {
  FolderKanban,
  Plus,
  Search,
  Edit3,
  Trash2,
  ExternalLink,
  Users,
  Clock,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  UploadCloud,
  X,
  FileImage,
} from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { cmsApi } from '../../lib/api';
import { resolveMediaUrl, webPublicPageUrl } from '../../lib/media-url';

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

const MONTHS_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export function dateStringToInputFormat(str: string): string {
  if (!str) return new Date().toISOString().split('T')[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(str.trim())) return str.trim();

  const parts = str.trim().split(/\s+/);
  if (parts.length >= 3) {
    const day = parseInt(parts[0], 10);
    const monthName = parts[1];
    const year = parseInt(parts[2], 10);
    const monthIndex = MONTHS_ID.findIndex((m) => m.toLowerCase() === monthName.toLowerCase());
    if (day && monthIndex >= 0 && year) {
      const mm = String(monthIndex + 1).padStart(2, '0');
      const dd = String(day).padStart(2, '0');
      return `${year}-${mm}-${dd}`;
    }
  }

  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split('T')[0];
  }
  return new Date().toISOString().split('T')[0];
}

export function inputFormatToIndoDate(dateStr: string): string {
  if (!dateStr) return '31 Desember 2026';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (monthIndex >= 0 && monthIndex < 12) {
      return `${day} ${MONTHS_ID[monthIndex]} ${year}`;
    }
  }
  return dateStr;
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

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    nama: '',
    program: 'Wakaf Sumur',
    lokasi: 'Indonesia',
    target: 500000000,
    terkumpul: 0,
    tenggatDateInput: '2026-12-31',
    ringkas: '',
    cerita: '',
    imageUrl: '',
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
    setSelectedFile(null);
    setPreviewUrl('');
    setFormData({
      nama: '',
      program: 'Wakaf Sumur',
      lokasi: 'Indonesia',
      target: 500000000,
      terkumpul: 0,
      tenggatDateInput: '2026-12-31',
      ringkas: '',
      cerita: '',
      imageUrl: '',
      status: 'Berjalan',
      isFeatured: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (campaign: CampaignItem) => {
    setSelectedCampaign(campaign);
    setSelectedFile(null);
    setPreviewUrl(campaign.imageUrl);
    setFormData({
      nama: campaign.nama,
      program: campaign.program,
      lokasi: campaign.lokasi,
      target: campaign.target,
      terkumpul: campaign.terkumpul,
      tenggatDateInput: dateStringToInputFormat(campaign.tenggat),
      ringkas: campaign.ringkas,
      cerita: campaign.cerita,
      imageUrl: campaign.imageUrl,
      status: campaign.status,
      isFeatured: campaign.isFeatured,
    });
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate 50 MB limit
    const MAX_SIZE_MB = 50;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Ukuran file terlalu besar (${(file.size / (1024 * 1024)).toFixed(1)} MB). Batas maksimal adalah ${MAX_SIZE_MB} MB.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.target) {
      toast.error('Nama kampanye dan target dana wajib diisi.');
      return;
    }

    if (!selectedFile && !formData.imageUrl) {
      toast.error('Silakan upload gambar banner kampanye terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalImageUrl = formData.imageUrl;

      // Upload file if new file chosen
      if (selectedFile) {
        setIsUploading(true);
        const uploadRes = await cmsApi.uploadCampaign(selectedFile);
        finalImageUrl = uploadRes.url;
        setIsUploading(false);
      }

      const formattedTenggat = inputFormatToIndoDate(formData.tenggatDateInput);

      const payload = {
        nama: formData.nama,
        program: formData.program,
        lokasi: formData.lokasi || 'Indonesia',
        target: Number(formData.target),
        terkumpul: Number(formData.terkumpul) || 0,
        tenggat: formattedTenggat,
        ringkas: formData.ringkas || formData.nama,
        cerita: formData.cerita || formData.ringkas || formData.nama,
        imageUrl: finalImageUrl,
        status: formData.status,
        isFeatured: formData.isFeatured,
      };

      if (selectedCampaign) {
        await cmsApi.updateCampaign(selectedCampaign.id, payload);
        toast.success('Program kampanye berhasil diperbarui!');
      } else {
        await cmsApi.createCampaign(payload);
        toast.success('Program kampanye baru berhasil dibuat!');
      }
      setIsModalOpen(false);
      loadCampaigns();
    } catch (error: any) {
      toast.error(`Gagal menyimpan kampanye: ${error.message}`);
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
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

  const categories = Array.from(new Set(campaigns.map((c) => c.program))).filter(Boolean);

  const filtered = campaigns.filter((c) => {
    const matchSearch =
      c.nama.toLowerCase().includes(search.toLowerCase()) ||
      c.program.toLowerCase().includes(search.toLowerCase()) ||
      c.lokasi.toLowerCase().includes(search.toLowerCase());
    const matchProgram =
      selectedProgramFilter === 'ALL' || c.program === selectedProgramFilter;
    return matchSearch && matchProgram;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E3E8E4] shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#E6F6EF] border border-[#BFE4D4] text-[#0F9D6E] flex items-center justify-center text-xl shadow-xs shrink-0">
            <FolderKanban className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-[25px] font-extrabold text-[#16211D] tracking-tight">
              Kelola Program & Kampanye ZIS
            </h1>
            <p className="text-[13px] text-[#7D938A] mt-0.5">
              Atur katalog program donasi publik, target pagu kebaikan, tenggat waktu, dan kabar mustahik.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
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
            className="flex items-center gap-2 text-xs bg-[#0F9D6E] hover:bg-[#0B7C56] text-white"
          >
            <Plus className="w-4 h-4" />
            Buat Kampanye Baru
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E3E8E4]">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#7D938A]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kampanye berdasarkan judul, kategori, atau lokasi..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-[#DDE3DF] bg-[#F4F6F4] text-[#16211D] placeholder-[#7D938A] focus:outline-none focus:ring-2 focus:ring-[#0F9D6E]"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedProgramFilter}
            onChange={(e) => setSelectedProgramFilter(e.target.value)}
            className="w-full md:w-56 p-2 text-xs rounded-xl border border-[#DDE3DF] bg-[#F4F6F4] text-[#16211D] font-bold focus:outline-none focus:ring-2 focus:ring-[#0F9D6E]"
          >
            <option value="ALL">Semua Pilar Program</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <span className="text-xs font-bold text-[#7D938A] whitespace-nowrap hidden sm:inline-block">
            Total: {filtered.length} Program
          </span>
        </div>
      </div>

      {/* Compact Cards Grid (Identical to Beranda Style) */}
      {loading ? (
        <div className="p-16 text-center text-xs font-bold text-[#7D938A] bg-white rounded-2xl border border-[#E3E8E4]">
          <RefreshCw className="w-7 h-7 animate-spin mx-auto mb-3 text-[#0F9D6E]" />
          Memuat data program kampanye...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-[#E3E8E4]">
          <FolderKanban className="w-12 h-12 mx-auto text-[#DDE3DF] mb-3" />
          <p className="text-sm font-bold text-[#16211D]">Tidak ada program kampanye yang cocok.</p>
          <p className="text-xs text-[#7D938A] mt-1">Coba gunakan kata kunci pencarian lain atau buat kampanye baru.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((camp) => {
            const pct = Math.min(100, Math.round((camp.terkumpul / camp.target) * 100));
            const isReached = pct >= 100;
            const isGreenZakat = /Pohon|Oksigen|DAS|Sumur|Agroforestry|Pertanian|Surya|Sampah|Pangan/i.test(
              camp.program
            );

            return (
              <div
                key={camp.id}
                className="bg-white rounded-2xl border border-[#E3E8E4] overflow-hidden flex flex-col justify-between hover:border-[#0F9D6E]/50 hover:shadow-md transition-all duration-200 group"
              >
                {/* Image Header with Aspect Ratio & Badges */}
                <div className="relative h-40 sm:h-44 w-full overflow-hidden bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolveMediaUrl(camp.imageUrl)}
                    alt={camp.nama}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (!target.dataset.triedFallback) {
                        target.dataset.triedFallback = '1';
                        target.src = resolveMediaUrl('/images/campaigns/sumur-sumba.jpg');
                      }
                    }}
                  />

                  {/* Gradient Overlay for bottom text legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  {/* Top Left: Category Badge */}
                  <span className="absolute left-3 top-3 bg-white/95 backdrop-blur-xs text-[#0F9D6E] font-extrabold text-[10px] px-2.5 py-0.5 rounded-full shadow-xs border border-[#BFE4D4] select-none">
                    {camp.program}
                  </span>

                  {/* Top Right: Progress & Status Badge */}
                  <div className="absolute right-3 top-3 flex items-center gap-1">
                    <span
                      className={`font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-xs select-none ${
                        isReached
                          ? 'bg-[#04241A] text-[#A5E4CB]'
                          : 'bg-black/60 text-white backdrop-blur-xs'
                      }`}
                    >
                      {isReached ? 'Tercapai' : `${pct}%`}
                    </span>
                  </div>

                  {/* Bottom Left: Tag Chip & Location */}
                  <div className="absolute left-3 bottom-2.5 right-3 flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-1.5">
                      {camp.isFeatured && (
                        <span className="text-[9.5px] font-extrabold px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 shadow-xs flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" />
                          Unggulan
                        </span>
                      )}
                      {isGreenZakat && (
                        <span className="text-[9.5px] font-extrabold px-2 py-0.5 rounded-full bg-[#0F9D6E] text-white shadow-xs">
                          Green Zakat
                        </span>
                      )}
                    </div>
                    <span className="text-white text-[10.5px] font-bold drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)] truncate">
                      {camp.lokasi}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-extrabold text-[14px] sm:text-[14.5px] text-[#16211D] group-hover:text-[#0F9D6E] transition-colors leading-snug line-clamp-2 min-h-[38px]">
                      {camp.nama}
                    </h3>
                    <p className="text-xs text-[#7D938A] leading-relaxed line-clamp-2 mt-1 min-h-[32px]">
                      {camp.ringkas}
                    </p>
                  </div>

                  {/* Progress & Stats */}
                  <div className="space-y-1.5 pt-2 border-t border-[#E3E8E4]">
                    <div className="h-1.5 rounded-full bg-[#F4F6F4] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#0F9D6E] transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex items-baseline justify-between text-xs pt-0.5">
                      <span className="font-mono font-bold text-xs text-[#0F9D6E]">
                        Rp {camp.terkumpul.toLocaleString('id-ID')}
                      </span>
                      <span className="text-[11px] text-[#7D938A]">
                        dari Rp {(camp.target / 1000000).toLocaleString('id-ID')} Jt
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#7D938A]">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-[#7D938A]" />
                        {camp.donaturCount.toLocaleString('id-ID')} donatur
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#7D938A]" />
                        s.d. {camp.tenggat}
                      </span>
                    </div>
                  </div>

                  {/* Footer Action Buttons */}
                  <div className="pt-2 border-t border-[#E3E8E4] flex items-center justify-between gap-2">
                    <a
                      href={webPublicPageUrl(`/kampanye/${camp.slug}`)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-bold text-[#0F9D6E] hover:text-[#0B7C56] flex items-center gap-1 hover:underline"
                    >
                      <span>Lihat di Web</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(camp)}
                        className="p-1.5 rounded-lg border border-[#DDE3DF] hover:bg-[#E6F6EF] text-[#4D5C56] hover:text-[#0F9D6E] transition-colors cursor-pointer"
                        title="Edit Kampanye"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCampaign(camp);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-[#B83D32] transition-colors cursor-pointer"
                        title="Hapus Kampanye"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Create/Edit (Direct Upload Max 50MB + Datepicker) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedCampaign ? 'Edit Program Kampanye' : 'Buat Program Kampanye Baru'}
        subtitle="Form entri data program penggalangan dana ZIS publik"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
          {/* 1. Upload Langsung Gambar Banner (Max 50MB) */}
          <div className="space-y-2">
            <label className="block font-bold text-[#16211D]">
              Foto / Gambar Utama Kampanye (Upload Langsung, Maksimal 50 MB) *
            </label>

            {previewUrl ? (
              <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 bg-slate-100 shadow-xs group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolveMediaUrl(previewUrl)}
                  alt="Preview Kampanye"
                  className="w-full h-44 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (!target.dataset.triedFallback) {
                      target.dataset.triedFallback = '1';
                      target.src = resolveMediaUrl('/images/campaigns/sumur-sumba.jpg');
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
                      setPreviewUrl('');
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
                className="border-2 border-dashed border-[#BFE4D4] hover:border-[#0F9D6E] bg-[#E6F6EF]/40 hover:bg-[#E6F6EF]/70 transition-all rounded-2xl p-6 text-center cursor-pointer space-y-2 group"
              >
                <div className="w-12 h-12 rounded-full bg-white text-[#0F9D6E] flex items-center justify-center mx-auto shadow-xs group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-sm text-[#16211D]">
                    Klik untuk Pilih Gambar Program atau Tarik File ke Sini
                  </p>
                  <p className="text-[11px] text-[#7D938A] mt-0.5">
                    Rasio 16:9 direkomendasikan · Format: JPG, PNG, WEBP · Ukuran Maksimal 50 MB
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

          {/* 2. Nama Kampanye & Pilar Program */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="block font-bold text-[#16211D]">
                Nama Program Kampanye *
              </label>
              <input
                type="text"
                required
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                placeholder="Contoh: Sumur Kehidupan Sumba Timur"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE3DF] bg-white text-[#16211D] font-bold text-sm focus:ring-2 focus:ring-[#0F9D6E] focus:outline-none placeholder-[#7D938A]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block font-bold text-[#16211D]">
                Pilar / Kategori Program *
              </label>
              <input
                type="text"
                required
                value={formData.program}
                onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                placeholder="Contoh: Wakaf Sumur / Beasiswa / Kesehatan / Bantuan Pangan"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE3DF] bg-white text-[#16211D] font-bold focus:ring-2 focus:ring-[#0F9D6E] focus:outline-none placeholder-[#7D938A]"
              />
            </div>
          </div>

          {/* 3. Lokasi, Target Dana & Tenggat Waktu (Datepicker) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="space-y-1.5">
              <label className="block font-bold text-[#16211D]">
                Lokasi Penyaluran
              </label>
              <input
                type="text"
                value={formData.lokasi}
                onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                placeholder="Contoh: Sumba Timur, NTT"
                className="w-full px-3.5 py-2 rounded-xl border border-[#DDE3DF] bg-white text-[#16211D] focus:ring-2 focus:ring-[#0F9D6E] focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block font-bold text-[#16211D]">
                Target Dana (Rp) *
              </label>
              <input
                type="number"
                required
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-[#DDE3DF] bg-white text-[#16211D] font-mono font-bold focus:ring-2 focus:ring-[#0F9D6E] focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block font-bold text-[#16211D]">
                Tenggat Waktu (Datepicker) *
              </label>
              <input
                type="date"
                required
                value={formData.tenggatDateInput}
                onChange={(e) => setFormData({ ...formData, tenggatDateInput: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-[#DDE3DF] bg-white text-[#16211D] font-mono font-bold focus:ring-2 focus:ring-[#0F9D6E] focus:outline-none"
              />
              <p className="text-[10px] text-[#7D938A]">
                Format tampil: {inputFormatToIndoDate(formData.tenggatDateInput)}
              </p>
            </div>
          </div>

          {/* 4. Ringkasan Singkat (Card) */}
          <div className="space-y-1.5">
            <label className="block font-bold text-[#16211D]">
              Ringkasan Singkat (Tampil di Kotak Program) *
            </label>
            <textarea
              rows={2}
              required
              value={formData.ringkas}
              onChange={(e) => setFormData({ ...formData, ringkas: e.target.value })}
              placeholder="Jelaskan ringkasan program dalam 1-2 kalimat untuk tampilan box program..."
              className="w-full px-3.5 py-2 rounded-xl border border-[#DDE3DF] bg-white text-[#16211D] focus:ring-2 focus:ring-[#0F9D6E] focus:outline-none leading-relaxed"
            />
          </div>

          {/* 5. Cerita Lengkap */}
          <div className="space-y-1.5">
            <label className="block font-bold text-[#16211D]">
              Cerita Lengkap & Urgensi Program
            </label>
            <textarea
              rows={4}
              value={formData.cerita}
              onChange={(e) => setFormData({ ...formData, cerita: e.target.value })}
              placeholder="Tuliskan latar belakang masalah, kondisi mustahik, dan urgensi penyaluran..."
              className="w-full px-3.5 py-2 rounded-xl border border-[#DDE3DF] bg-white text-[#16211D] focus:ring-2 focus:ring-[#0F9D6E] focus:outline-none leading-relaxed"
            />
          </div>

          {/* 6. Status & Featured */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
            <div className="space-y-1.5">
              <label className="block font-bold text-[#16211D]">
                Status Kampanye
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE3DF] bg-white text-[#16211D] font-bold focus:ring-2 focus:ring-[#0F9D6E] focus:outline-none"
              >
                <option value="Berjalan">Berjalan (Sedang Menghimpun)</option>
                <option value="Tercapai">Tercapai (Target Terpenuhi)</option>
                <option value="Selesai">Selesai (Sudah Disalurkan)</option>
              </select>
            </div>
            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="isFeaturedCheck"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4 text-[#0F9D6E] rounded-sm focus:ring-[#0F9D6E] accent-[#0F9D6E]"
                />
                <span className="font-bold text-[#16211D]">
                  Tampilkan di Kampanye Pilihan Beranda
                </span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E3E8E4]">
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
                  {isUploading ? 'Mengunggah Foto (Max 50MB)...' : 'Menyimpan...'}
                </>
              ) : selectedCampaign ? (
                'Simpan Perubahan'
              ) : (
                'Terbitkan Kampanye'
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Hapus Program Kampanye"
        maxWidth="sm"
      >
        <div className="space-y-4 font-sans text-xs">
          <p className="text-[#16211D]">
            Apakah Anda yakin ingin menghapus program "<strong>{selectedCampaign?.nama}</strong>"?
          </p>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E3E8E4]">
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
              {isSubmitting ? 'Menghapus...' : 'Ya, Hapus'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
