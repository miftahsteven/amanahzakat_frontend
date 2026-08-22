import React, { useState, useEffect } from 'react';
import {
  FileBarChart,
  Edit3,
  Save,
  RefreshCw,
  Plus,
  Trash2,
  FileText,
  PieChart,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { cmsApi } from '../../lib/api';

export const ImpactManagementPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Impact Data State
  const [metrics, setMetrics] = useState<any[]>([]);
  const [fundAllocations, setFundAllocations] = useState<any[]>([]);
  const [annualReports, setAnnualReports] = useState<any[]>([]);

  // Annual Report Modal
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [newReport, setNewReport] = useState({
    tahun: '2026',
    judul: 'Laporan Keuangan & Dampak Tahunan 2026',
    deskripsi: 'Opini Wajar Tanpa Pengecualian (WTP) berdasarkan standar PSAK 109.',
    ukuranFile: '9.2 MB (PDF)',
    tanggalTerbit: '15 Maret 2027',
    auditor: 'KAP Wisnu & Rekan',
  });

  const loadImpact = async () => {
    setLoading(true);
    try {
      const res = await cmsApi.getImpact();
      if (res) {
        setMetrics(res.metrics || []);
        setFundAllocations(res.fundAllocations || []);
        setAnnualReports(res.annualReports || []);
      }
    } catch (error: any) {
      toast.error(`Gagal memuat data dampak: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImpact();
  }, []);

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await cmsApi.updateImpact({
        metrics,
        fundAllocations,
        annualReports,
        beneficiaryStories: [],
      });
      toast.success('Seluruh data laporan dampak publik berhasil disimpan!');
    } catch (error: any) {
      toast.error(`Gagal menyimpan: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMetricChange = (index: number, field: string, val: string) => {
    const updated = [...metrics];
    updated[index] = { ...updated[index], [field]: val };
    setMetrics(updated);
  };

  const handleAllocationChange = (index: number, field: string, val: any) => {
    const updated = [...fundAllocations];
    updated[index] = {
      ...updated[index],
      [field]: field === 'percentage' ? Number(val) : val,
      ...(field === 'percentage' ? { percentageLabel: `${val}%` } : {}),
    };
    setFundAllocations(updated);
  };

  const handleAddReport = () => {
    if (!newReport.tahun || !newReport.judul) {
      toast.error('Tahun dan judul laporan wajib diisi.');
      return;
    }
    setAnnualReports([newReport, ...annualReports]);
    setIsReportModalOpen(false);
    toast.success('Laporan tahunan baru berhasil ditambahkan ke daftar.');
  };

  const handleDeleteReport = (index: number) => {
    const updated = [...annualReports];
    updated.splice(index, 1);
    setAnnualReports(updated);
    toast.success('Laporan tahunan dihapus.');
  };

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
              Laporan Dampak, Transparansi & Audit
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kelola metrik pencapaian ZIS, persentase alokasi dana PSAK 109, dan publikasi berkas laporan keuangan WTP.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={loadImpact}
            className="flex items-center gap-2 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="flex items-center gap-2 text-xs bg-[#0F9D6E] hover:bg-[#09825A] text-white"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
          </Button>
        </div>
      </div>

      {/* 1. Key Metrics Section */}
      <div className="bg-white  p-6 rounded-2xl border border-slate-100  space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#0F9D6E]" />
            <h2 className="text-sm font-black text-slate-900 dark:text-white">
              1. Metrik Kunci Transparansi (Tampil di Beranda & Halaman Dampak)
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((m, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200  bg-slate-50/50 dark:bg-[#0D241B] space-y-2 text-xs"
            >
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">
                  Label Metrik
                </label>
                <input
                  type="text"
                  value={m.label}
                  onChange={(e) => handleMetricChange(idx, 'label', e.target.value)}
                  className="w-full font-bold p-1.5 rounded-lg border border-slate-200  bg-white  text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">
                    Angka Capaian
                  </label>
                  <input
                    type="text"
                    value={m.angka}
                    onChange={(e) => handleMetricChange(idx, 'angka', e.target.value)}
                    className="w-full font-extrabold text-[#0F9D6E] p-1.5 rounded-lg border border-slate-200  bg-white "
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">
                    Satuan
                  </label>
                  <input
                    type="text"
                    value={m.satuan}
                    onChange={(e) => handleMetricChange(idx, 'satuan', e.target.value)}
                    className="w-full p-1.5 rounded-lg border border-slate-200  bg-white  text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">
                  Keterangan Singkat
                </label>
                <input
                  type="text"
                  value={m.keterangan}
                  onChange={(e) => handleMetricChange(idx, 'keterangan', e.target.value)}
                  className="w-full text-[11px] p-1.5 rounded-lg border border-slate-200  bg-white  text-slate-900 dark:text-white"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Fund Allocations Section */}
      <div className="bg-white  p-6 rounded-2xl border border-slate-100  space-y-4 shadow-xs">
        <div className="flex items-center gap-2">
          <PieChart className="w-5 h-5 text-[#0F9D6E]" />
          <h2 className="text-sm font-black text-slate-900 dark:text-white">
            2. Persentase Alokasi Penyaluran Syariah (PSAK 109)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fundAllocations.map((fa, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200  bg-slate-50/50 dark:bg-[#0D241B] space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={fa.label}
                  onChange={(e) => handleAllocationChange(idx, 'label', e.target.value)}
                  className="font-bold text-slate-900 dark:text-white p-1 rounded border border-transparent hover:border-slate-300 w-3/4 bg-transparent"
                />
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.1"
                    value={fa.percentage}
                    onChange={(e) => handleAllocationChange(idx, 'percentage', e.target.value)}
                    className="w-16 font-extrabold text-[#0F9D6E] p-1 rounded border border-slate-200  bg-white  text-right"
                  />
                  <span className="font-bold text-slate-500">%</span>
                </div>
              </div>
              <textarea
                rows={2}
                value={fa.description}
                onChange={(e) => handleAllocationChange(idx, 'description', e.target.value)}
                className="w-full text-[11px] p-2 rounded-lg border border-slate-200  bg-white  text-slate-700 dark:text-slate-300"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 3. Annual Reports Publication */}
      <div className="bg-white  p-6 rounded-2xl border border-slate-100  space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0F9D6E]" />
            <h2 className="text-sm font-black text-slate-900 dark:text-white">
              3. Berkas Laporan Tahunan & Opini Audit WTP (Downloadable PDF)
            </h2>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-1 text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Berkas Laporan
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {annualReports.map((report, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200  bg-slate-50/50 dark:bg-[#0D241B] flex items-start justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-[#0F9D6E] text-white">
                    Tahun {report.tahun}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">{report.ukuranFile}</span>
                </div>
                <h4 className="font-extrabold text-slate-900 dark:text-white">{report.judul}</h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">{report.deskripsi}</p>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-1">
                  <span>Auditor: <strong>{report.auditor}</strong></span>
                  <span>•</span>
                  <span>Terbit: {report.tanggalTerbit}</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDeleteReport(idx)}
                className="p-1.5 h-7 w-7 text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-900 shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Add Report */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Tambah Berkas Laporan Tahunan"
        subtitle="Publikasikan ringkasan laporan keuangan audit WTP untuk diunduh publik"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tahun Buku *
              </label>
              <input
                type="text"
                value={newReport.tahun}
                onChange={(e) => setNewReport({ ...newReport, tahun: e.target.value })}
                placeholder="2026"
                className="w-full p-2.5 rounded-xl border border-slate-200  bg-white dark:bg-[#0D241B] text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Ukuran File
              </label>
              <input
                type="text"
                value={newReport.ukuranFile}
                onChange={(e) => setNewReport({ ...newReport, ukuranFile: e.target.value })}
                placeholder="Contoh: 8.4 MB (PDF)"
                className="w-full p-2.5 rounded-xl border border-slate-200  bg-white dark:bg-[#0D241B] text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Judul Laporan *
            </label>
            <input
              type="text"
              value={newReport.judul}
              onChange={(e) => setNewReport({ ...newReport, judul: e.target.value })}
              placeholder="Contoh: Laporan Keuangan & Dampak Tahunan 2026"
              className="w-full p-2.5 rounded-xl border border-slate-200  bg-white dark:bg-[#0D241B] text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Deskripsi Opini Audit
            </label>
            <textarea
              rows={2}
              value={newReport.deskripsi}
              onChange={(e) => setNewReport({ ...newReport, deskripsi: e.target.value })}
              placeholder="Opini Wajar Tanpa Pengecualian (WTP)..."
              className="w-full p-2.5 rounded-xl border border-slate-200  bg-white dark:bg-[#0D241B] text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Auditor Independen (KAP)
              </label>
              <input
                type="text"
                value={newReport.auditor}
                onChange={(e) => setNewReport({ ...newReport, auditor: e.target.value })}
                placeholder="Contoh: KAP Wisnu & Rekan"
                className="w-full p-2.5 rounded-xl border border-slate-200  bg-white dark:bg-[#0D241B] text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Terbit
              </label>
              <input
                type="text"
                value={newReport.tanggalTerbit}
                onChange={(e) => setNewReport({ ...newReport, tanggalTerbit: e.target.value })}
                placeholder="Contoh: 15 Maret 2027"
                className="w-full p-2.5 rounded-xl border border-slate-200  bg-white dark:bg-[#0D241B] text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsReportModalOpen(false)}>
              Batal
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleAddReport}
              className="bg-[#0F9D6E] hover:bg-[#09825A] text-white"
            >
              Tambahkan ke Daftar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
