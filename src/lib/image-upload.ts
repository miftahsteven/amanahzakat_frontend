export const DEFAULT_MAX_IMAGE_MB = 50;

export function validateImageFile(file: File, maxMb = DEFAULT_MAX_IMAGE_MB): string | null {
  if (!file.type.startsWith('image/')) {
    return 'Hanya file gambar (JPG, PNG, WEBP) yang diperbolehkan.';
  }
  if (file.size > maxMb * 1024 * 1024) {
    return `Ukuran file terlalu besar (${(file.size / (1024 * 1024)).toFixed(1)} MB). Batas maksimal adalah ${maxMb} MB.`;
  }
  return null;
}

export function imageFileFromClipboardItem(item: DataTransferItem): File | null {
  if (!item.type.startsWith('image/')) return null;
  const blob = item.getAsFile();
  if (!blob) return null;
  const ext = (item.type.split('/')[1] || 'png').replace('jpeg', 'jpg');
  return new File([blob], `paste-gambar-${Date.now()}.${ext}`, { type: item.type });
}

export function firstImageFileFromClipboard(data: DataTransfer | null): File | null {
  const items = data?.items;
  if (!items?.length) return null;
  for (let i = 0; i < items.length; i++) {
    const file = imageFileFromClipboardItem(items[i]);
    if (file) return file;
  }
  return null;
}

export function preventFileDragDefaults(e: React.DragEvent) {
  e.preventDefault();
  e.stopPropagation();
}
