import React, { useCallback, useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { NotifikasiItem } from '../types/system';
import { DataTable } from '../components/shared/DataTable';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Inbox, CheckCheck, RefreshCw } from 'lucide-react';
import { inboxApi } from '../lib/api';
import { toast } from 'sonner';

export interface InboxPageProps {
  onNavigate: (screen: string) => void;
}

export const InboxPage: React.FC<InboxPageProps> = ({ onNavigate }) => {
  const [dataList, setDataList] = useState<NotifikasiItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      setDataList(await inboxApi.list());
    } catch (err: any) {
      toast.error(err.message || 'Gagal memuat inbox');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleMarkAllRead = async () => {
    try {
      await inboxApi.markAllRead();
      setDataList((prev) => prev.map((n) => ({ ...n, dibaca: true })));
      toast.success('Semua pemberitahuan ditandai telah dibaca');
    } catch (err: any) {
      toast.error(err.message || 'Gagal menandai dibaca');
    }
  };

  const columns: ColumnDef<NotifikasiItem, any>[] = [
    {
      accessorKey: 'judul',
      header: 'Subjek',
      cell: ({ row }) => (
        <div
          onClick={async () => {
            if (row.original.linkScreen) onNavigate(row.original.linkScreen);
            if (!row.original.dibaca) {
              await inboxApi.markRead(row.original.id);
              setDataList((prev) => prev.map((n) => (n.id === row.original.id ? { ...n, dibaca: true } : n)));
            }
          }}
          className="cursor-pointer hover:underline"
        >
          <div className="font-bold flex items-center gap-2">
            {!row.original.dibaca && <span className="w-2 h-2 rounded-full bg-[#0F9D6E]" />}
            {row.getValue('judul')}
          </div>
          <div className="text-xs text-[#7D938A] line-clamp-1">{row.original.pesan}</div>
        </div>
      ),
    },
    { accessorKey: 'kategori', header: 'Kategori', cell: ({ row }) => <Badge variant="emerald">{row.getValue('kategori')}</Badge> },
    { accessorKey: 'waktu', header: 'Waktu' },
    {
      accessorKey: 'dibaca',
      header: 'Status',
      cell: ({ row }) => <Badge statusText={row.getValue('dibaca') ? 'Terbuka' : 'Baru'} />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#16211D] flex items-center gap-2">
            <Inbox className="w-6 h-6 text-[#0F9D6E]" /> Kotak Masuk Notifikasi
          </h1>
          <p className="text-xs text-[#7D938A]">Pesan transaksi, verifikasi, dan pengingat tutup buku — sync dari ERP</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={<RefreshCw className="w-4 h-4" />} onClick={loadData} disabled={isLoading}>Refresh</Button>
          <Button variant="outline" icon={<CheckCheck className="w-4 h-4" />} onClick={handleMarkAllRead}>Tandai Semua Dibaca</Button>
        </div>
      </div>
      <DataTable columns={columns} data={dataList} isLoading={isLoading} searchPlaceholder="Cari pemberitahuan..." />
    </div>
  );
};
