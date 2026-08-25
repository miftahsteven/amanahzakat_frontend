import React, { useRef } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import {
  BszRecord,
  buildSbmzNumber,
  displayVerifyUrl,
  formatBszDate,
  formatBszNominal,
  getAkunGlPenerimaan,
  qrImageUrl,
  toBszPrintFilename,
} from '../../lib/bsz';
import { printHtmlInIframe } from '../../lib/printReport';

export interface BszPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: BszRecord | null;
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4 text-[13px] py-0.5">
      <span className="text-[#6b7a74] shrink-0">{label}</span>
      <span className={`text-right text-[#16211D] ${mono ? "font-mono font-semibold" : "font-semibold"}`}>
        {value}
      </span>
    </div>
  );
}

export const BszPdfModal: React.FC<BszPdfModalProps> = ({ isOpen, onClose, data }) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!data) return null;

  const tgl = formatBszDate(data.tanggal);
  const nomorSbmz = buildSbmzNumber(data);
  const verifyUrl = data.verifyUrl?.trim() || '';
  const akun = getAkunGlPenerimaan(data.jenisZis);
  /** QR must encode the signed public URL so scanners open the verify page. */
  const qrPayload = verifyUrl;
  const handleDownloadPdf = () => {
    if (!verifyUrl) {
      toast.error('Tautan verifikasi belum tersedia. Muat ulang data lalu coba lagi.');
      return;
    }
    const node = printRef.current;
    if (!node) return;

    const filename = toBszPrintFilename(data.noKwitansi);
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${filename}</title>
  <style>
    @page { size: A4; margin: 16mm; }
    body { font-family: Inter, system-ui, sans-serif; color: #16211d; margin: 0; }
    .sheet { max-width: 640px; margin: 0 auto; }
    .header { background: #0d1714; color: #e7efe9; padding: 22px 26px; border-radius: 12px 12px 0 0; }
    .eyebrow { font-size: 10.5px; letter-spacing: 1.2px; text-transform: uppercase; color: #7d938a; font-weight: 700; }
    .org { font-size: 20px; font-weight: 800; margin-top: 6px; }
    .sub { font-size: 11.5px; color: #8fa79c; margin-top: 3px; }
    .body { padding: 22px 26px; border: 1px solid #e5eae6; border-top: 0; border-radius: 0 0 12px 12px; }
    .row { display: flex; justify-content: space-between; gap: 14px; font-size: 13px; padding: 8px 0; border-bottom: 1px dashed #dde3df; }
    .row:last-of-type { border-bottom: 0; }
    .label { color: #6b7a74; }
    .value { font-weight: 600; text-align: right; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
    .amount { background: #f4f8f6; border: 1px dashed #bfe4d4; border-radius: 12px; padding: 16px 18px; display: flex; justify-content: space-between; align-items: center; margin: 14px 0; }
    .amount-val { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 21px; font-weight: 700; color: #0b7c56; }
    .qr-box { display: flex; gap: 18px; align-items: center; padding: 16px 18px; border: 1px solid #e5eae6; border-radius: 12px; }
    .legal { margin: 14px 0 0; font-size: 11.5px; color: #8b9992; line-height: 1.6; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="sheet">${node.innerHTML}</div>
</body>
</html>`;

    try {
      printHtmlInIframe(html);
      toast.success(`Dialog cetak terbuka — pilih "Simpan sebagai PDF" untuk ${filename}`);
    } catch {
      toast.error('Gagal membuka dialog cetak. Coba lagi.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bukti Setor Zakat"
      subtitle="Dokumen resmi pengurang pajak sesuai PP No. 60 Tahun 2010"
      maxWidth="lg"
      maximizable
      footer={
        <div className="flex items-center justify-end gap-2.5">
          <Button type="button" variant="outline" onClick={onClose}>
            Tutup
          </Button>
          <Button
            type="button"
            variant="primary"
            icon={<Download className="w-4 h-4" />}
            onClick={handleDownloadPdf}
            className="bg-[#0F9D6E] hover:bg-[#0B7C56]"
          >
            Unduh PDF
          </Button>
        </div>
      }
    >
      <div ref={printRef} className="overflow-hidden rounded-xl border border-[#E5EAE6] bg-white text-[#16211D]">
        <div className="header bg-[#0D1714] text-[#E7EFE9] px-6 py-5">
          <div className="eyebrow text-[10.5px] font-bold uppercase tracking-[1.2px] text-[#7D938A]">
            Bukti Setor Zakat
          </div>
          <div className="org text-[19px] font-extrabold mt-1.5">AmanahZakat</div>
          <div className="sub text-[11.5px] text-[#8FA79C] mt-1">
            Lembaga Amil Zakat Nasional · SK Kemenag RI
          </div>
        </div>

        <div className="body px-6 py-5 space-y-3">
          <div className="space-y-0 divide-y divide-dashed divide-[#DDE3DF]">
            <div className="py-2">
              <DetailRow label="No. Bukti" value={data.noKwitansi} mono />
            </div>
            <div className="py-2">
              <DetailRow label="Tanggal Setor" value={tgl} mono />
            </div>
            <div className="py-2">
              <DetailRow label="Nama Muzakki" value={data.muzakkiNama} />
            </div>
            <div className="py-2">
              <DetailRow label="Jenis Dana" value={data.jenisZis} />
            </div>
            <div className="py-2">
              <DetailRow label="Kanal Pembayaran" value={data.kanal} />
            </div>
            {data.status ? (
              <div className="py-2">
                <DetailRow label="Status" value={data.status} />
              </div>
            ) : null}
            <div className="py-2">
              <DetailRow label="Akun G/L" value={akun} mono />
            </div>
          </div>
          <div className="amount bg-[#F4F8F6] border border-dashed border-[#BFE4D4] rounded-xl px-[18px] py-4 flex justify-between items-center">
            <span className="text-[12.5px] font-semibold text-[#4D5C56]">Jumlah Setoran</span>
            <span className="amount-val font-mono text-[21px] font-semibold text-[#0B7C56]">
              {formatBszNominal(data.nominal)}
            </span>
          </div>

          <div className="qr-box flex gap-[18px] items-center p-4 border border-[#E5EAE6] rounded-xl">
            {verifyUrl ? (
              <img
                src={qrImageUrl(qrPayload, 120)}
                alt={`QR ${nomorSbmz}`}
                className="w-[120px] h-[120px] rounded-md border border-[#E5EAE6] bg-white shrink-0"
              />
            ) : (
              <div className="w-[120px] h-[120px] rounded-md border border-dashed border-[#E5EAE6] bg-[#F8FAF9] shrink-0 flex items-center justify-center p-2 text-center text-[10px] text-[#8B9992]">
                Tautan verifikasi belum tersedia
              </div>
            )}
            <div className="min-w-0 space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-[0.7px] text-[#8B9992]">Nomor SBMZ</div>
              <div className="font-mono text-[12.5px] font-bold break-all">{nomorSbmz}</div>
              {verifyUrl ? (
                <div className="font-mono text-[11px] text-[#7C8B84] break-all">{displayVerifyUrl(verifyUrl)}</div>
              ) : (
                <div className="text-[11px] text-amber-700">Muat ulang data penerimaan untuk mendapatkan QR bertanda tangan.</div>
              )}
            </div>
          </div>

          <p className="legal m-0 text-[11.5px] text-[#8B9992] leading-relaxed">
            Bukti setor ini sah tanpa tanda tangan basah dan dapat digunakan sebagai pengurang penghasilan kena pajak
            sesuai PP No. 60 Tahun 2010. Keaslian dokumen dapat diverifikasi dengan memindai kode QR di atas.
          </p>
        </div>
      </div>
    </Modal>
  );
};
