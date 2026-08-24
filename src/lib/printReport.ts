import { formatRP } from './utils';

type DistribusiData = {
  summary: {
    totalNominal: number;
    totalTransaksi: number;
    mustahikTerbantu: number;
    totalDanaMustahik: number;
  };
  perAsnaf: Array<{ nama: string; transaksi: number; nominal: number }>;
  perProgram: Array<{ id: string; nama: string; transaksi: number; nominal: number }>;
  transaksi: Array<{
    tanggal: string;
    noPenyaluran: string;
    mustahikNama: string;
    asnaf: string;
    programNama: string;
    nominal: number;
    metodePembayaran: string;
  }>;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function printLaporanDistribusi(data: DistribusiData, dari: string, sampai: string) {
  const trxRows = data.transaksi
    .map(
      (row) => `
      <tr>
        <td>${escapeHtml(row.tanggal)}</td>
        <td>${escapeHtml(row.noPenyaluran)}</td>
        <td>${escapeHtml(row.mustahikNama)}</td>
        <td>${escapeHtml(row.asnaf)}</td>
        <td>${escapeHtml(row.programNama)}</td>
        <td class="num">${escapeHtml(formatRP(row.nominal))}</td>
        <td>${escapeHtml(row.metodePembayaran)}</td>
      </tr>`
    )
    .join('');

  const asnafRows = data.perAsnaf
    .map(
      (row) => `
      <tr>
        <td>${escapeHtml(row.nama)}</td>
        <td class="num">${row.transaksi}</td>
        <td class="num">${escapeHtml(formatRP(row.nominal))}</td>
      </tr>`
    )
    .join('');

  const programRows = data.perProgram
    .map(
      (row) => `
      <tr>
        <td>${escapeHtml(row.nama)}</td>
        <td class="num">${row.transaksi}</td>
        <td class="num">${escapeHtml(formatRP(row.nominal))}</td>
      </tr>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <title>Laporan Distribusi ZIS ${escapeHtml(dari)} – ${escapeHtml(sampai)}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #16211D; padding: 28px; }
    h1 { font-size: 18px; margin: 0 0 4px; }
    p { font-size: 12px; color: #5b6b64; margin: 0 0 16px; }
    .cards { display: flex; gap: 12px; margin-bottom: 20px; }
    .card { flex: 1; border: 1px solid #E3E8E4; border-radius: 8px; padding: 10px 12px; }
    .card span { display: block; font-size: 10px; text-transform: uppercase; color: #7D938A; }
    .card strong { font-size: 14px; }
    h2 { font-size: 13px; margin: 20px 0 8px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th, td { border: 1px solid #E3E8E4; padding: 6px 8px; text-align: left; }
    th { background: #F4F6F4; }
    .num { text-align: right; white-space: nowrap; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <h1>Laporan Distribusi ZIS — Amanah Zakat</h1>
  <p>Periode ${escapeHtml(dari)} s.d. ${escapeHtml(sampai)} · Dicetak ${new Date().toLocaleString('id-ID')}</p>
  <div class="cards">
    <div class="card"><span>Total Penyaluran</span><strong>${escapeHtml(formatRP(data.summary.totalNominal))}</strong></div>
    <div class="card"><span>Transaksi</span><strong>${data.summary.totalTransaksi}</strong></div>
    <div class="card"><span>Mustahik Terbantu</span><strong>${data.summary.mustahikTerbantu}</strong></div>
    <div class="card"><span>Dana ke Mustahik</span><strong>${escapeHtml(formatRP(data.summary.totalDanaMustahik))}</strong></div>
  </div>
  <h2>Per Asnaf</h2>
  <table><thead><tr><th>Asnaf</th><th>Transaksi</th><th>Nominal</th></tr></thead><tbody>${asnafRows}</tbody></table>
  <h2>Per Program</h2>
  <table><thead><tr><th>Program</th><th>Transaksi</th><th>Nominal</th></tr></thead><tbody>${programRows}</tbody></table>
  <h2>Detail Transaksi</h2>
  <table>
    <thead>
      <tr>
        <th>Tanggal</th><th>No. Penyaluran</th><th>Mustahik</th><th>Asnaf</th>
        <th>Program</th><th>Nominal</th><th>Metode</th>
      </tr>
    </thead>
    <tbody>${trxRows || '<tr><td colspan="7">Tidak ada transaksi pada periode ini</td></tr>'}</tbody>
  </table>
</body>
</html>`;

  const popup = window.open('', '_blank', 'width=1024,height=768');
  if (!popup) {
    throw new Error('Popup diblokir. Izinkan jendela baru untuk mencetak PDF.');
  }
  popup.document.open();
  popup.document.write(html);
  popup.document.close();
  popup.focus();
  window.setTimeout(() => {
    popup.print();
  }, 350);
}
