const trimTrailingSlash = (url: string) => url.replace(/\/+$/, '');

/** Backend origin, e.g. http://localhost:5005 */
export function getBackendOrigin(): string {
  const apiBase = import.meta.env.VITE_API_BASE_URL || '/api/v1';
  if (apiBase.startsWith('http://') || apiBase.startsWith('https://')) {
    return trimTrailingSlash(apiBase.replace(/\/api\/v\d+\/?$/, ''));
  }
  const port = import.meta.env.VITE_BACKEND_PORT || '5005';
  return `http://localhost:${port}`;
}

/** Webpublic site origin, e.g. http://localhost:3000 */
export function getWebPublicOrigin(): string {
  return trimTrailingSlash(
    import.meta.env.VITE_WEBPUBLIC_URL || 'http://localhost:3000'
  );
}

/**
 * Resolve a stored media path to a full URL the ERP can load in <img>.
 * - blob:/data: → local preview (unchanged)
 * - /uploads/* → backend static files
 * - /images/*  → webpublic Next.js public folder
 * - absolute URLs → unchanged
 */
export function resolveMediaUrl(url?: string | null): string {
  if (!url) return '';

  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('blob:') ||
    url.startsWith('data:')
  ) {
    return url;
  }

  const path = url.startsWith('/') ? url : `/${url}`;

  if (path.startsWith('/uploads/')) {
    return `${getBackendOrigin()}${path}`;
  }

  if (path.startsWith('/images/')) {
    return `${getWebPublicOrigin()}${path}`;
  }

  return `${getWebPublicOrigin()}${path}`;
}

/** Build a webpublic page URL (e.g. kampanye detail). */
export function webPublicPageUrl(path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${getWebPublicOrigin()}${clean}`;
}
