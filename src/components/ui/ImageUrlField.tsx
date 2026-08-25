import React, { useCallback, useRef, useState } from 'react';
import { ImageIcon, Loader2, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { cmsApi } from '../../lib/api';
import { preventFileDragDefaults, validateImageFile } from '../../lib/image-upload';
import { resolveMediaUrl } from '../../lib/media-url';
import { useClipboardImagePaste } from '../../hooks/useClipboardImagePaste';
import { Button } from './Button';

export interface ImageUrlFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  /** Aktifkan paste/drag saat modal terbuka. */
  pasteEnabled?: boolean;
  placeholder?: string;
  hint?: string;
}

export const ImageUrlField: React.FC<ImageUrlFieldProps> = ({
  label,
  value,
  onChange,
  pasteEnabled = false,
  placeholder = 'https://... atau upload / paste gambar (Ctrl+V)',
  hint = 'URL gambar, upload file, tarik file, atau tempel (Ctrl+V) dari clipboard',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = useCallback(
    async (file: File) => {
      const err = validateImageFile(file);
      if (err) {
        toast.error(err);
        return;
      }

      setIsUploading(true);
      try {
        const res = await cmsApi.uploadMedia(file);
        onChange(res.url);
        toast.success('Gambar berhasil diunggah.');
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Gagal mengunggah gambar.';
        toast.error(message);
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    },
    [onChange],
  );

  useClipboardImagePaste(pasteEnabled, uploadFile);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void uploadFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    preventFileDragDefaults(e);
    const file = e.dataTransfer.files?.[0];
    if (file) void uploadFile(file);
  };

  const previewSrc = value ? resolveMediaUrl(value) : '';

  return (
    <div className="space-y-2">
      <label className="block font-bold text-slate-700 dark:text-slate-300">{label}</label>
      <div
        className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 p-3 space-y-2"
        onDragOver={preventFileDragDefaults}
        onDrop={handleDrop}
      >
        {previewSrc ? (
          <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 max-h-40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewSrc} alt="Preview" className="w-full max-h-40 object-contain" />
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[11px] text-slate-500 py-1">
            <ImageIcon className="w-4 h-4 shrink-0" />
            <span>{hint}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1 p-2.5 rounded-xl border border-slate-200 bg-white dark:bg-[#0D241B] text-slate-900 dark:text-white text-xs"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploading}
            icon={isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? 'Mengunggah...' : 'Upload'}
          </Button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};
