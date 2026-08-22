import React, { useState, useEffect } from 'react';
import {
  Globe2,
  Save,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  Building,
  Plus,
  Trash2,
  Share2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import { cmsApi } from '../../lib/api';

export const WebSettingsPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState({
    siteName: 'AmanahZakat Peduli',
    siteTagline: 'Lembaga Amil Zakat Nasional — Amanah, Transparan & Berdaya Dampak',
    contactPhone: '0811-2100-900',
    contactEmail: 'layanan@amanahzakat.or.id',
    contactAddress: 'Gedung Menara Amanah Lt. 4, Jl. TB Simatupang No. 18, Jakarta Selatan 12520',
    socialLinks: {
      instagram: 'https://instagram.com/amanahzakat',
      facebook: 'https://facebook.com/amanahzakat',
      youtube: 'https://youtube.com/@amanahzakat',
      whatsapp: 'https://wa.me/628112100900',
    },
    bankAccounts: [
      { bank: 'Bank Syariah Indonesia (BSI)', noRekening: '7001-2345-67', atasNama: 'LAZNAS AmanahZakat Peduli - Zakat', jenis: 'Zakat' },
      { bank: 'Bank Syariah Indonesia (BSI)', noRekening: '7002-3456-78', atasNama: 'LAZNAS AmanahZakat Peduli - Infak', jenis: 'Infak/Sedekah' },
      { bank: 'Bank Central Asia (BCA)', noRekening: '5420-9988-77', atasNama: 'LAZNAS AmanahZakat Peduli', jenis: 'Operasional' },
      { bank: 'Bank Mandiri', noRekening: '127-00-1122334-4', atasNama: 'LAZNAS AmanahZakat Peduli - Wakaf', jenis: 'Wakaf' },
    ],
  });

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await cmsApi.getWebSettings();
      if (res) {
        setFormData({
          siteName: res.siteName || 'AmanahZakat Peduli',
          siteTagline: res.siteTagline || '',
          contactPhone: res.contactPhone || '',
          contactEmail: res.contactEmail || '',
          contactAddress: res.contactAddress || '',
          socialLinks: res.socialLinks || formData.socialLinks,
          bankAccounts: res.bankAccounts || formData.bankAccounts,
        });
      }
    } catch (error: any) {
      toast.error(`Gagal memuat pengaturan: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await cmsApi.updateWebSettings(formData);
      toast.success('Pengaturan web publik berhasil disimpan & diperbarui!');
    } catch (error: any) {
      toast.error(`Gagal menyimpan: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBankAccountChange = (index: number, field: string, val: string) => {
    const updated = [...formData.bankAccounts];
    updated[index] = { ...updated[index], [field]: val };
    setFormData({ ...formData, bankAccounts: updated });
  };

  const handleAddBankAccount = () => {
    setFormData({
      ...formData,
      bankAccounts: [
        ...formData.bankAccounts,
        { bank: 'Bank Syariah Indonesia (BSI)', noRekening: '', atasNama: 'LAZNAS AmanahZakat Peduli', jenis: 'Zakat' },
      ],
    });
  };

  const handleDeleteBankAccount = (index: number) => {
    const updated = [...formData.bankAccounts];
    updated.splice(index, 1);
    setFormData({ ...formData, bankAccounts: updated });
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white  p-6 rounded-2xl border border-slate-100  shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-[#0F9D6E] flex items-center justify-center text-xl shadow-xs">
            <Globe2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              Pengaturan Umum Web Publik
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Konfigurasi nama lembaga, kontak resmi, nomor rekening peruntukan ZIS, dan sosial media web.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={loadSettings}
            className="flex items-center gap-2 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSaving}
            className="flex items-center gap-2 text-xs bg-[#0F9D6E] hover:bg-[#09825A] text-white"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan Web'}
          </Button>
        </div>
      </div>

      {/* 1. Identity & Tagline */}
      <div className="bg-white  p-6 rounded-2xl border border-slate-100  space-y-4 shadow-xs text-xs">
        <h2 className="text-sm font-black text-slate-900 dark:text-white">
          1. Identitas Lembaga & Tagline
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nama Situs / Lembaga
            </label>
            <input
              type="text"
              value={formData.siteName}
              onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200  bg-slate-50/50 dark:bg-[#0D241B] text-slate-900 dark:text-white font-bold"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Tagline Lembaga
            </label>
            <input
              type="text"
              value={formData.siteTagline}
              onChange={(e) => setFormData({ ...formData, siteTagline: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200  bg-slate-50/50 dark:bg-[#0D241B] text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* 2. Contact Information */}
      <div className="bg-white  p-6 rounded-2xl border border-slate-100  space-y-4 shadow-xs text-xs">
        <h2 className="text-sm font-black text-slate-900 dark:text-white">
          2. Kontak Resmi Layanan Donatur & Lembaga
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nomor Telepon / Call Center
            </label>
            <input
              type="text"
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              placeholder="0811-2100-900"
              className="w-full p-2.5 rounded-xl border border-slate-200  bg-slate-50/50 dark:bg-[#0D241B] text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Email Resmi Layanan
            </label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              placeholder="layanan@amanahzakat.or.id"
              className="w-full p-2.5 rounded-xl border border-slate-200  bg-slate-50/50 dark:bg-[#0D241B] text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
            Alamat Kantor Pusat Lembaga
          </label>
          <textarea
            rows={2}
            value={formData.contactAddress}
            onChange={(e) => setFormData({ ...formData, contactAddress: e.target.value })}
            className="w-full p-2.5 rounded-xl border border-slate-200  bg-slate-50/50 dark:bg-[#0D241B] text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* 3. Official Bank Accounts */}
      <div className="bg-white  p-6 rounded-2xl border border-slate-100  space-y-4 shadow-xs text-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 dark:text-white">
            3. Rekening Resmi Penerimaan ZIS & Wakaf (Transfer Manual Web)
          </h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddBankAccount}
            className="flex items-center gap-1 text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Rekening
          </Button>
        </div>

        <div className="space-y-3">
          {formData.bankAccounts.map((acc, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200  bg-slate-50/50 dark:bg-[#0D241B] grid grid-cols-1 sm:grid-cols-4 gap-3 items-center"
            >
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">
                  Nama Bank
                </label>
                <input
                  type="text"
                  value={acc.bank}
                  onChange={(e) => handleBankAccountChange(idx, 'bank', e.target.value)}
                  className="w-full font-bold p-1.5 rounded-lg border border-slate-200  bg-white  text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">
                  Nomor Rekening
                </label>
                <input
                  type="text"
                  value={acc.noRekening}
                  onChange={(e) => handleBankAccountChange(idx, 'noRekening', e.target.value)}
                  className="w-full font-mono font-bold p-1.5 rounded-lg border border-slate-200  bg-white  text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">
                  Peruntukan Dana
                </label>
                <select
                  value={acc.jenis}
                  onChange={(e) => handleBankAccountChange(idx, 'jenis', e.target.value)}
                  className="w-full p-1.5 rounded-lg border border-slate-200  bg-white  text-slate-900 dark:text-white"
                >
                  <option value="Zakat">Zakat</option>
                  <option value="Infak/Sedekah">Infak / Sedekah</option>
                  <option value="Wakaf">Wakaf</option>
                  <option value="Kemanusiaan">Kemanusiaan</option>
                  <option value="Operasional">Operasional</option>
                </select>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">
                    Atas Nama
                  </label>
                  <input
                    type="text"
                    value={acc.atasNama}
                    onChange={(e) => handleBankAccountChange(idx, 'atasNama', e.target.value)}
                    className="w-full text-[11px] p-1.5 rounded-lg border border-slate-200  bg-white  text-slate-900 dark:text-white truncate"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteBankAccount(idx)}
                  className="p-1.5 h-7 w-7 text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-900 shrink-0 mt-3.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Social Media Links */}
      <div className="bg-white  p-6 rounded-2xl border border-slate-100  space-y-4 shadow-xs text-xs">
        <h2 className="text-sm font-black text-slate-900 dark:text-white">
          4. Tautan Media Sosial & Kontak WhatsApp
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Instagram URL
            </label>
            <input
              type="text"
              value={formData.socialLinks.instagram}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  socialLinks: { ...formData.socialLinks, instagram: e.target.value },
                })
              }
              className="w-full p-2.5 rounded-xl border border-slate-200  bg-slate-50/50 dark:bg-[#0D241B] text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              WhatsApp Link
            </label>
            <input
              type="text"
              value={formData.socialLinks.whatsapp}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  socialLinks: { ...formData.socialLinks, whatsapp: e.target.value },
                })
              }
              className="w-full p-2.5 rounded-xl border border-slate-200  bg-slate-50/50 dark:bg-[#0D241B] text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Facebook URL
            </label>
            <input
              type="text"
              value={formData.socialLinks.facebook}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  socialLinks: { ...formData.socialLinks, facebook: e.target.value },
                })
              }
              className="w-full p-2.5 rounded-xl border border-slate-200  bg-slate-50/50 dark:bg-[#0D241B] text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              YouTube URL
            </label>
            <input
              type="text"
              value={formData.socialLinks.youtube}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  socialLinks: { ...formData.socialLinks, youtube: e.target.value },
                })
              }
              className="w-full p-2.5 rounded-xl border border-slate-200  bg-slate-50/50 dark:bg-[#0D241B] text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>
    </form>
  );
};
