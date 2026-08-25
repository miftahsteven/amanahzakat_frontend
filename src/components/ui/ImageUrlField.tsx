import React, { useCallback, useRef, useState } from 'react';
import { FileImage, Loader2, UploadCloud, X } from 'lucide-react';
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
  hint?: string;
  required?: boolean;
}

export const ImageUrlField: React.FC<ImageUrlFieldProps> = ({
  label,
  value,
  onChange,
  pasteEnabled = false,
  hint = 'JPG, PNG, WEBP · Maks 50 MB · Bisa paste dari browser / clipboard',
  required = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedName, setSelectedName] = useState<string | null>(null);

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
        setSelectedName(`${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`);
        toast.success('Gambar dari clipboard / upload berhasil disimpan.');
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

  const clearImage = () => {
    onChange('');
    setSelectedName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const previewSrc = value ? resolveMediaUrl(value) : '';

  return (
    <div className="space-y-2">
      <label className="block font-bold text-[#16211D] dark:text-slate-200">
        {label}
        {required ? ' *' : ''}
      </label>

      {previewSrc ? (
        <div
          className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 bg-slate-100 shadow-xs group"
          tabIndex={0}
          onDragOver={preventFileDragDefaults}
          onDrop={handleDrop}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewSrc}
            alt="Preview"
            className="w-full max-h-72 object-contain bg-slate-100"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs">
            <Button
              type="button"
              variant="primary"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="text-xs flex items-center gap-1.5"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
              {isUploading ? 'Mengunggah...' : 'Ganti Gambar'}
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={isUploading}
              onClick={clearImage}
              className="text-xs flex items-center gap-1.5"
            >
              <X className="w-4 h-4" />
              Hapus
            </Button>
          </div>
          <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-[10px] font-mono flex items-center gap-1.5">
            <FileImage className="w-3 h-3 text-[#A5E4CB]" />
            {selectedName || 'Gambar Tersimpan di Server'}
          </div>
        </div>
      ) : (
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          onDragOver={preventFileDragDefaults}
          onDrop={handleDrop}
          className="border-2 border-dashed border-[#BFE4D4] hover:border-[#0F9D6E] bg-[#E6F6EF]/40 hover:bg-[#E6F6EF]/70 transition-all rounded-2xl p-6 text-center cursor-pointer space-y-2 group"
        >
          <div className="w-12 h-12 rounded-full bg-white text-[#0F9D6E] flex items-center justify-center mx-auto shadow-xs group-hover:scale-110 transition-transform">
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <UploadCloud className="w-6 h-6" />
            )}
          </div>
          <div>
            <p className="font-bold text-sm text-[#16211D]">
              {isUploading
                ? 'Mengunggah gambar...'
                : 'Klik, tarik file, atau tempel (Ctrl+V) gambar di sini'}
            </p>
            <p className="text-[11px] text-[#7D938A] mt-0.5">{hint}</p>
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
  );
};
