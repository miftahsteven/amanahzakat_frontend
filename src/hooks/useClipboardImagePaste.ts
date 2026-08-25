import { useEffect } from 'react';
import { toast } from 'sonner';
import { firstImageFileFromClipboard, validateImageFile } from '../lib/image-upload';

/** Dengarkan Ctrl+V / paste gambar dari clipboard saat `enabled` (mis. modal terbuka). */
export function useClipboardImagePaste(
  enabled: boolean,
  onFile: (file: File) => void,
  successMessage = 'Gambar dari clipboard berhasil ditempel.',
) {
  useEffect(() => {
    if (!enabled) return;

    const onPaste = (e: ClipboardEvent) => {
      const file = firstImageFileFromClipboard(e.clipboardData);
      if (!file) return;

      const err = validateImageFile(file);
      if (err) {
        toast.error(err);
        return;
      }

      e.preventDefault();
      onFile(file);
      toast.success(successMessage);
    };

    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [enabled, onFile, successMessage]);
}
