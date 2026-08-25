import React, { useState, useEffect } from 'react';
import {
  Info,
  Plus,
  Search,
  Edit3,
  Trash2,
  BookOpen,
  HelpCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { IdNumberInput } from '../../components/ui/IdNumberInput';
import { cmsApi } from '../../lib/api';

export interface FaqItemData {
  id: string;
  category: string;
  question: string;
  answer: string;
  sourceReference: string;
  urutan: number;
}

export interface FaqManagementPageProps {
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export const FaqManagementPage: React.FC<FaqManagementPageProps> = ({
  canCreate = false,
  canUpdate = false,
  canDelete = false,
}) => {
  const [faqs, setFaqs] = useState<FaqItemData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedFaq, setSelectedFaq] = useState<FaqItemData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState({
    category: 'Dasar ZIS',
    question: '',
    answer: '',
    sourceReference: 'QS. At-Taubah: 60 · Fatwa MUI',
    urutan: 1,
  });

  const loadFaqs = async () => {
    setLoading(true);
    try {
      const res = await cmsApi.getFaqs();
      setFaqs(res || []);
    } catch (error: any) {
      toast.error(`Gagal memuat FAQ: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFaqs();
  }, []);

  const openCreateModal = () => {
    setSelectedFaq(null);
    setFormData({
      category: 'Dasar ZIS',
      question: '',
      answer: '',
      sourceReference: 'QS. At-Taubah: 60 · Fatwa MUI',
      urutan: faqs.length + 1,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (faq: FaqItemData) => {
    setSelectedFaq(faq);
    setFormData({
      category: faq.category,
      question: faq.question,
      answer: faq.answer,
      sourceReference: faq.sourceReference,
      urutan: faq.urutan,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question || !formData.answer) {
      toast.error('Pertanyaan dan jawaban fiqih wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (selectedFaq) {
        await cmsApi.updateFaq(selectedFaq.id, formData);
        toast.success('Item FAQ berhasil diperbarui!');
      } else {
        await cmsApi.createFaq(formData);
        toast.success('Item FAQ baru berhasil ditambahkan!');
      }
      setIsModalOpen(false);
      loadFaqs();
    } catch (error: any) {
      toast.error(`Gagal menyimpan FAQ: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedFaq) return;
    setIsSubmitting(true);
    try {
      await cmsApi.deleteFaq(selectedFaq.id);
      toast.success('Item FAQ berhasil dihapus.');
      setIsDeleteModalOpen(false);
      loadFaqs();
    } catch (error: any) {
      toast.error(`Gagal menghapus: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = Array.from(new Set(faqs.map((f) => f.category)));

  const filtered = faqs.filter((f) => {
    const matchesSearch =
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase()) ||
      f.category.toLowerCase().includes(search.toLowerCase()) ||
      f.sourceReference.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || f.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white  p-6 rounded-2xl border border-slate-100  shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-[#0F9D6E] flex items-center justify-center text-xl shadow-xs">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              Kelola FAQ & Asisten Fiqih Ustaz Digital
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kelola tanya-jawab syariah ZIS dan basis pengetahuan untuk asisten AI interaktif web.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={loadFaqs}
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
              Tambah FAQ Baru
            </Button>
          )}
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
            placeholder="Cari FAQ berdasarkan pertanyaan, jawaban, atau dalil rujukan..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200  bg-slate-50 dark:bg-[#0D241B] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F9D6E]"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full md:w-56 p-2 text-xs rounded-xl border border-slate-200  bg-slate-50 dark:bg-[#0D241B] text-slate-900 dark:text-white"
        >
          <option value="ALL">Semua Kategori Fiqih</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* FAQ Accordion List */}
      {loading ? (
        <div className="p-12 text-center text-xs font-bold text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0F9D6E]" />
          Memuat basis data FAQ...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white  rounded-2xl border border-slate-100 ">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Tidak ada pertanyaan yang cocok.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((faq) => (
            <div
              key={faq.id}
              className="p-5 rounded-2xl bg-white  border border-slate-100  shadow-xs hover:border-[#0F9D6E]/40 transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-50 dark:bg-emerald-950 text-[#0F9D6E] border border-emerald-200 dark:border-emerald-900">
                      {faq.category}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">Urutan #{faq.urutan}</span>
                  </div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    {faq.question}
                  </h3>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {canUpdate && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(faq)}
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
                        setSelectedFaq(faq);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-1.5 h-7 w-7 text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-900"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100  text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {faq.answer.split('|').map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1 font-semibold text-slate-500 dark:text-slate-400">
                  <BookOpen className="w-3 h-3 text-[#0F9D6E]" />
                  Rujukan Dalil: {faq.sourceReference}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Tersedia untuk Ustaz Digital
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedFaq ? 'Edit FAQ Fiqih ZIS' : 'Tambah FAQ Fiqih ZIS Baru'}
        subtitle="Form entri tanya jawab syariah dan basis pengetahuan AI"
        maxWidth="lg"
        maximizable
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kategori Fiqih *
              </label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Contoh: Zakat Maal / Zakat Profesi / Infak & Shodaqoh / Pajak & Bukti"
                className="w-full p-2.5 rounded-xl border border-slate-200  bg-white dark:bg-[#0D241B] text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Urutan (#)
              </label>
              <IdNumberInput
                value={formData.urutan}
                onValueChange={(urutan) => setFormData({ ...formData, urutan })}
                className="w-full p-2.5 rounded-xl border border-slate-200  bg-white dark:bg-[#0D241B] text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Pertanyaan Syariah *
            </label>
            <input
              type="text"
              required
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              placeholder="Contoh: Bagaimana cara menghitung zakat penghasilan bulanan?"
              className="w-full p-2.5 rounded-xl border border-slate-200  bg-white dark:bg-[#0D241B] text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Jawaban Fiqih & Penjelasan Lengkap * (Gunakan tanda '|' untuk memisah paragraf)
            </label>
            <textarea
              required
              rows={4}
              value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              placeholder="Tuliskan jawaban lengkap yang lugas dan berdasar kaidah fiqih zakat..."
              className="w-full p-2.5 rounded-xl border border-slate-200  bg-white dark:bg-[#0D241B] text-slate-900 dark:text-white font-sans"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Rujukan Dalil / Fatwa MUI / Undang-Undang
            </label>
            <input
              type="text"
              value={formData.sourceReference}
              onChange={(e) => setFormData({ ...formData, sourceReference: e.target.value })}
              placeholder="Contoh: Fatwa MUI 3/2003 · QS. At-Taubah: 60"
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
              {isSubmitting ? 'Menyimpan...' : selectedFaq ? 'Simpan Perubahan' : 'Simpan FAQ'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Hapus Item FAQ"
        subtitle="Apakah Anda yakin ingin menghapus pertanyaan ini?"
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 dark:text-slate-300">
            Pertanyaan "<strong>{selectedFaq?.question}</strong>" akan dihapus dari basis data.
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
