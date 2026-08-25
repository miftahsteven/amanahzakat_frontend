import type { AuthUser } from '../types/acl';

/** Cek permission ERP; SUPER_ADMIN selalu lolos. */
export function hasPermission(user: AuthUser | null | undefined, permission: string): boolean {
  if (!user) return false;
  if (user.roles?.includes('SUPER_ADMIN')) return true;
  return Boolean(user.permissions?.includes(permission));
}

/** Cek salah satu permission dari daftar. */
export function hasAnyPermission(user: AuthUser | null | undefined, permissions: string[]): boolean {
  return permissions.some((p) => hasPermission(user, p));
}
