import type { AuthUser, CatalogModul } from '../types/acl';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
export const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 Hours in ms

// Session & Token Management
export const getStoredToken = (): string | null => {
  if (!isSessionValid()) {
    return null;
  }
  return localStorage.getItem('amanahzakat_token');
};

export const setStoredToken = (token: string): void => {
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  localStorage.setItem('amanahzakat_token', token);
  localStorage.setItem('amanahzakat_expires_at', expiresAt.toString());
};

export const isSessionValid = (): boolean => {
  const token = localStorage.getItem('amanahzakat_token');
  const expiresAtStr = localStorage.getItem('amanahzakat_expires_at');

  if (!token) return false;

  if (expiresAtStr) {
    const expiresAt = parseInt(expiresAtStr, 10);
    if (Date.now() > expiresAt) {
      removeStoredToken();
      return false;
    }
  }

  return true;
};

export const getStoredUser = () => {
  if (!isSessionValid()) return null;
  const userStr = localStorage.getItem('amanahzakat_user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const removeStoredToken = (): void => {
  localStorage.removeItem('amanahzakat_token');
  localStorage.removeItem('amanahzakat_expires_at');
  localStorage.removeItem('amanahzakat_user');
};

// Helper for authorized fetch
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    if (response.status === 401) {
      removeStoredToken();
    }
    throw new Error(data.message || `HTTP Error ${response.status}`);
  }

  return data.data;
}

// 1. Auth API Module
export const authApi = {
  async login(usernameOrEmail: string, password: string) {
    // Step 1: Login challenge
    const challengeRes = await apiFetch<{ challengeId: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ usernameOrEmail, password }),
    });

    // Step 2: Auto-verify with dummy OTP '00000'
    const verifyRes = await apiFetch<{
      accessToken: string;
      user: AuthUser;
    }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({
        challengeId: challengeRes.challengeId,
        otp: '00000',
      }),
    });

    // Save Token & User Session for 24 Hours
    if (verifyRes.accessToken) {
      setStoredToken(verifyRes.accessToken);
      localStorage.setItem('amanahzakat_user', JSON.stringify(verifyRes.user));
    }

    return verifyRes;
  },

  async me() {
    return apiFetch<AuthUser>('/auth/me');
  },

  logout() {
    removeStoredToken();
  },
};

// 2. Users API Module (CRUD)
export const usersApi = {
  async getUsers() {
    return apiFetch<any[]>('/users');
  },

  async createUser(data: {
    username: string;
    email: string;
    password: string;
    namaLengkap: string;
    nomorHp?: string;
    nip?: string;
    roleIds?: string[];
  }) {
    return apiFetch<any>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateUser(
    id: string,
    data: {
      namaLengkap?: string;
      nomorHp?: string;
      nip?: string;
      isActive?: boolean;
      password?: string;
      roleIds?: string[];
    }
  ) {
    return apiFetch<any>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteUser(id: string) {
    return apiFetch<any>(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};

// 3. ACL API Module
export const aclApi = {
  async getRoles() {
    return apiFetch<any[]>('/acl/roles');
  },

  async createRole(data: { kodeRole: string; namaRole: string; deskripsi?: string }) {
    return apiFetch<any>('/acl/roles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getModules(includeInactive = false) {
    const query = includeInactive ? '?includeInactive=true' : '';
    return apiFetch<CatalogModul[]>(`/acl/modules${query}`);
  },

  async createModul(data: { kodeModul: string; namaModul: string; urutan?: number }) {
    return apiFetch<any>('/acl/modules', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateModul(
    id: string,
    data: { namaModul?: string; urutan?: number; isActive?: boolean }
  ) {
    return apiFetch<any>(`/acl/modules/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteModul(id: string) {
    return apiFetch<any>(`/acl/modules/${id}`, {
      method: 'DELETE',
    });
  },

  async createMenu(data: {
    modulId: string;
    kodeMenu: string;
    namaMenu: string;
    kodeTampil: string;
    icon?: string | null;
    urutan?: number;
    tampilDiSidebar?: boolean;
    tampilDiHeader?: boolean;
    actions?: string[];
  }) {
    return apiFetch<any>('/acl/menus', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateMenu(
    id: string,
    data: {
      namaMenu?: string;
      kodeTampil?: string;
      icon?: string | null;
      urutan?: number;
      tampilDiSidebar?: boolean;
      tampilDiHeader?: boolean;
      isActive?: boolean;
      modulId?: string;
    }
  ) {
    return apiFetch<any>(`/acl/menus/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteMenu(id: string) {
    return apiFetch<any>(`/acl/menus/${id}`, {
      method: 'DELETE',
    });
  },

  async getPermissions() {
    return apiFetch<any[]>('/acl/permissions');
  },

  async createPermission(data: {
    menuId: string;
    aksi: string;
    namaPermission: string;
    kodePermission?: string;
  }) {
    return apiFetch<any>('/acl/permissions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updatePermission(
    id: string,
    data: { namaPermission?: string; aksi?: string; kodePermission?: string }
  ) {
    return apiFetch<any>(`/acl/permissions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deletePermission(id: string) {
    return apiFetch<any>(`/acl/permissions/${id}`, {
      method: 'DELETE',
    });
  },

  async assignPermissionRoles(permissionId: string, roleIds: string[]) {
    return apiFetch<any>(`/acl/permissions/${permissionId}/assign-roles`, {
      method: 'POST',
      body: JSON.stringify({ roleIds }),
    });
  },

  async assignPermissions(roleId: string, permissionIds: string[]) {
    return apiFetch<any>('/acl/assign-permission', {
      method: 'POST',
      body: JSON.stringify({ roleId, permissionIds }),
    });
  },
};
