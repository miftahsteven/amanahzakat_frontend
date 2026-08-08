import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Printer, Download, QrCode, CheckCircle2 } from 'lucide-react';
import { formatRP } from '../../lib/utils';
import { toast } from 'sonner';

export interface BszPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    noKwitansi: string;
    tanggal: string;
    muzakkiNama: string;
    muzakkiTipe: string;
    jenisZis: string;
    nominal: number;
    kanal: string;
    catatan?: string;
  } | null;
}

export const BszPdfModal: React.FC<BszPdfModalProps> = ({ isOpen, onClose, data }) => {
  if (!data) return null;

  const handleDownload = () => {
    toast.success(`Dokumen BSZ ${data.noKwitansi} berhasil diunduh (PDF)`);
    onClose();
  };

  const handlePrint = () => {
    toast.info(`Mencetak dokumen ${data.noKwitansi}...`);
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bukti Setor Zakat (BSZ) / SBMZ"
      subtitle="Dokumen Resmi Pengurang Penghasilan Kena Pajak (SPT Tahunan)"
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Document Preview Box */}
        <div className="p-6 bg-white border border-[#D4DBD6] rounded-2xl shadow-xs text-[#14271F] space-y-5 font-sans relative">
          {/* Header Lembaga */}
          <div className="flex items-center justify-between border-b pb-4 border-[#EBEFEB]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0B9D6D] text-white flex items-center justify-center font-extrabold text-xl shadow-sm">
                A
              </div>
              <div>
                <h2 className="text-base font-extrabold text-[#091D15] tracking-wide uppercase">Amanah Zakat</h2>
                <p className="text-[11px] text-[#8A9691] font-medium">Lembaga Amil Zakat Nasional (LAZNAS) Izin Kemenag RI</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#E6F7EE] text-[#0B9D6D] border border-[#A3DBC8]">
                Resmi & Sah
              </span>
              <p className="text-xs font-mono font-bold text-[#14271F] mt-1">{data.noKwitansi}</p>
            </div>
          </div>

          {/* Title */}
          <div className="text-center py-2">
            <h3 className="text-sm font-bold tracking-wider text-[#14271F] uppercase">TANDA TERIMA BUKTI SETOR ZAKAT (BSZ)</h3>
            <p className="text-[11px] text-[#8A9691]">Dasar Pengurang Penghasilan Kena Pajak sesuai UU No. 23 Tahun 2011</p>
          </div>

          {/* Table Details */}
          <div className="bg-[#F3F6F4] rounded-xl p-4 border border-[#D4DBD6] space-y-2.5 text-xs">
            <div className="grid grid-cols-3 gap-2">
              <span className="text-[#8A9691] font-medium">Tanggal Transaksi</span>
              <span className="col-span-2 font-bold text-[#14271F]">{data.tanggal}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-[#8A9691] font-medium">Nama Muzakki</span>
              <span className="col-span-2 font-bold text-[#14271F]">{data.muzakkiNama} ({data.muzakkiTipe})</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-[#8A9691] font-medium">Jenis Akad ZIS</span>
              <span className="col-span-2 font-bold text-[#0B9D6D]">{data.jenisZis}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-[#8A9691] font-medium">Jumlah Setoran</span>
              <span className="col-span-2 font-extrabold text-base text-[#14271F]">{formatRP(data.nominal)}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-[#8A9691] font-medium">Kanal Pembayaran</span>
              <span className="col-span-2 font-medium text-[#14271F]">{data.kanal}</span>
            </div>
            {data.catatan && (
              <div className="grid grid-cols-3 gap-2">
                <span className="text-[#8A9691] font-medium">Keterangan</span>
                <span className="col-span-2 italic text-[#14271F]">{data.catatan}</span>
              </div>
            )}
          </div>

          {/* QR Verification & Sign Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-[#EBEFEB] text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#F3F6F4] rounded-xl border border-[#D4DBD6]">
                <QrCode className="w-10 h-10 text-[#091D15]" />
              </div>
              <div className="space-y-0.5">
                <p className="font-bold text-[11px] text-[#14271F] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0B9D6D]" /> Tanda Tangan Digital Sah
                </p>
                <p className="text-[10px] text-[#8A9691]">Scan QR untuk verifikasi keaslian via Sistem SIMBA</p>
              </div>
            </div>
            <div className="text-center font-medium">
              <p className="text-[10px] text-[#8A9691]">Bandung, {data.tanggal}</p>
              <p className="font-bold text-[#14271F] mt-6">Divisi Amil Kasir Utama</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" icon={<Printer className="w-4 h-4" />} onClick={handlePrint}>
            Cetak BSZ
          </Button>
          <Button variant="primary" icon={<Download className="w-4 h-4" />} onClick={handleDownload}>
            Unduh Sertifikat PDF
          </Button>
        </div>
      </div>
    </Modal>
  );
};
