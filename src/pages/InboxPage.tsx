import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { NotifikasiItem } from '../types/system';
import { INITIAL_NOTIFIKASI } from '../mock/mockData';
import { DataTable } from '../components/shared/DataTable';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Inbox, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';

export interface InboxPageProps {
  onNavigate: (screen: string) => void;
}

export const InboxPage: React.FC<InboxPageProps> = ({ onNavigate }) => {
  const [dataList, setDataList] = useState<NotifikasiItem[]>(INITIAL_NOTIFIKASI);

  const handleMarkAllRead = () => {
    setDataList(dataList.map((n) => ({ ...n, dibaca: true })));
    toast.success('Semua pemberitahuan ditandai telah dibaca');
  };

  const columns: ColumnDef<NotifikasiItem, any>[] = [
    {
      accessorKey: 'judul',
      header: 'Subjek Pemberitahuan',
      cell: ({ row }: any) => (
        <div
          onClick={() => {
            if (row.original.linkScreen) onNavigate(row.original.linkScreen);
          }}
          className="cursor-pointer hover:underline"
        >
          <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            {!row.original.dibaca && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
            <span>{row.getValue('judul')}</span>
          </div>
          <div className="text-xs text-slate-500 line-clamp-1">{row.original.pesan}</div>
        </div>
      ),
    },
    {
      accessorKey: 'kategori',
      header: 'Kategori',
      cell: ({ row }: any) => <Badge variant="emerald">{row.getValue('kategori')}</Badge>,
    },
    {
      accessorKey: 'waktu',
      header: 'Waktu',
    },
    {
      accessorKey: 'dibaca',
      header: 'Status',
      cell: ({ row }: any) => <Badge statusText={row.getValue('dibaca') ? 'Terbuka' : 'Draft'} />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Inbox className="w-6 h-6 text-[#0f9d6e]" /> Kotak Masuk Pemberitahuan System
          </h1>
          <p className="text-xs text-slate-500">Pesan notifikasi transaksi, verifikasi proposal, dan pengingat tutup buku</p>
        </div>
        <Button variant="outline" icon={<CheckCheck className="w-4 h-4" />} onClick={handleMarkAllRead}>
          Tandai Semua Dibaca
        </Button>
      </div>

      <DataTable columns={columns} data={dataList} searchPlaceholder="Cari pemberitahuan..." />
    </div>
  );
};
