import type { AuthUser, CatalogModul } from '../types/acl';
import type { PenerimaanDetail, PenyaluranDetail, MuzakkiDetail, MustahikDetail } from '../types/zis';
import type { ProgramDetail, MitraDetail, UpzDetail } from '../types/system';

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

// 4. CMS API Module (Content Management System)
export const cmsApi = {
  // Hero Sliders & Upload
  async uploadSlider(file: File) {
    const token = getStoredToken();
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}/cms/upload-slider`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Gagal mengunggah gambar slider');
    }
    return data.data; // { url: "/uploads/slider/...", filename: "...", size: number }
  },
  async getHeroSliders() {
    return apiFetch<any[]>('/cms/hero-sliders');
  },

  async createHeroSlider(data: any) {
    return apiFetch<any>('/cms/hero-sliders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async updateHeroSlider(id: number, data: any) {
    return apiFetch<any>(`/cms/hero-sliders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async deleteHeroSlider(id: number) {
    return apiFetch<any>(`/cms/hero-sliders/${id}`, {
      method: 'DELETE',
    });
  },

  // Campaigns & Upload
  async uploadCampaign(file: File) {
    const token = getStoredToken();
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}/cms/upload-campaign`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Gagal mengunggah gambar kampanye');
    }
    return data.data; // { url: "/uploads/campaigns/...", filename: "...", size: number }
  },
  async getCampaigns() {
    return apiFetch<any[]>('/cms/campaigns');
  },

  async createCampaign(data: any) {
    return apiFetch<any>('/cms/campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async updateCampaign(id: number, data: any) {
    return apiFetch<any>(`/cms/campaigns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async deleteCampaign(id: number) {
    return apiFetch<any>(`/cms/campaigns/${id}`, {
      method: 'DELETE',
    });
  },

  // Distributions
  async getDistributions() {
    return apiFetch<any[]>('/cms/distributions');
  },
  async createDistribution(data: any) {
    return apiFetch<any>('/cms/distributions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async updateDistribution(id: number, data: any) {
    return apiFetch<any>(`/cms/distributions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async deleteDistribution(id: number) {
    return apiFetch<any>(`/cms/distributions/${id}`, {
      method: 'DELETE',
    });
  },

  // Testimonials
  async getTestimonials() {
    return apiFetch<any[]>('/cms/testimonials');
  },
  async createTestimonial(data: any) {
    return apiFetch<any>('/cms/testimonials', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async updateTestimonial(id: string, data: any) {
    return apiFetch<any>(`/cms/testimonials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async deleteTestimonial(id: string) {
    return apiFetch<any>(`/cms/testimonials/${id}`, {
      method: 'DELETE',
    });
  },

  // FAQs
  async getFaqs() {
    return apiFetch<any[]>('/cms/faqs');
  },
  async createFaq(data: any) {
    return apiFetch<any>('/cms/faqs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async updateFaq(id: string, data: any) {
    return apiFetch<any>(`/cms/faqs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async deleteFaq(id: string) {
    return apiFetch<any>(`/cms/faqs/${id}`, {
      method: 'DELETE',
    });
  },

  // Impact
  async getImpact() {
    return apiFetch<any>('/cms/impact');
  },
  async updateImpact(data: any) {
    return apiFetch<any>('/cms/impact', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Assistance
  async getAssistanceSubmissions() {
    return apiFetch<any[]>('/cms/assistance');
  },
  async updateAssistanceStatus(id: string, data: { status: string; surveiNotes?: string }) {
    return apiFetch<any>(`/cms/assistance/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Web Settings
  async getWebSettings() {
    return apiFetch<any>('/cms/settings');
  },
  async updateWebSettings(data: any) {
    return apiFetch<any>('/cms/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

export const penerimaanApi = {
  async list(jenisZis?: string) {
    const query = jenisZis && jenisZis !== 'Semua' ? `?jenisZis=${encodeURIComponent(jenisZis)}` : '';
    return apiFetch<any[]>(`/penerimaan${query}`);
  },
  async getById(id: string) {
    return apiFetch<PenerimaanDetail>(`/penerimaan/${id}`);
  },
  async listMuzakki() {
    return apiFetch<any[]>('/penerimaan/muzakki');
  },
  async create(data: {
    muzakkiId: string;
    jenisZis: string;
    nominal: number;
    kanal: string;
    rekeningTujuan?: string;
    catatan?: string;
    programNama?: string;
  }) {
    return apiFetch<any>('/penerimaan', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async update(
    id: string,
    data: {
      muzakkiId?: string;
      jenisZis?: string;
      nominal?: number;
      kanal?: string;
      rekeningTujuan?: string;
      catatan?: string;
      programNama?: string;
    },
  ) {
    return apiFetch<any>(`/penerimaan/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  async remove(id: string) {
    return apiFetch<void>(`/penerimaan/${id}`, { method: 'DELETE' });
  },
  async verify(id: string) {
    return apiFetch<any>(`/penerimaan/${id}/verify`, {
      method: 'PATCH',
    });
  },
};

export const muzakkiApi = {
  async list() {
    return apiFetch<any[]>('/muzakki');
  },
  async getById(id: string) {
    return apiFetch<MuzakkiDetail>(`/muzakki/${id}`);
  },
  async create(data: {
    nama: string;
    tipe: string;
    nikAtauNpwp: string;
    hp: string;
    email: string;
    alamat: string;
  }) {
    return apiFetch<any>('/muzakki', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async update(
    id: string,
    data: {
      nama: string;
      tipe: string;
      nikAtauNpwp: string;
      hp: string;
      email: string;
      alamat: string;
    },
  ) {
    return apiFetch<any>(`/muzakki/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  async remove(id: string) {
    return apiFetch<void>(`/muzakki/${id}`, { method: 'DELETE' });
  },
};

export const penyaluranApi = {
  async list(asnaf?: string) {
    const query = asnaf && asnaf !== 'Semua' ? `?asnaf=${encodeURIComponent(asnaf)}` : '';
    return apiFetch<any[]>(`/penyaluran${query}`);
  },
  async getById(id: string) {
    return apiFetch<PenyaluranDetail>(`/penyaluran/${id}`);
  },
  async listMustahik() {
    return apiFetch<any[]>('/penyaluran/mustahik');
  },
  async listProgram() {
    return apiFetch<any[]>('/penyaluran/program');
  },
  async create(data: {
    mustahikId: string;
    programId: string;
    asnaf: string;
    nominal: number;
    metodePembayaran: string;
    keterangan: string;
  }) {
    return apiFetch<any>('/penyaluran', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async update(
    id: string,
    data: {
      mustahikId?: string;
      programId?: string;
      asnaf?: string;
      nominal?: number;
      metodePembayaran?: string;
      keterangan?: string;
    },
  ) {
    return apiFetch<any>(`/penyaluran/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  async remove(id: string) {
    return apiFetch<void>(`/penyaluran/${id}`, { method: 'DELETE' });
  },
  async disburse(id: string) {
    return apiFetch<PenyaluranDetail>(`/penyaluran/${id}/disburse`, {
      method: 'PATCH',
    });
  },
};

export const mustahikApi = {
  async list(asnaf?: string) {
    const query = asnaf && asnaf !== 'Semua' ? `?asnaf=${encodeURIComponent(asnaf)}` : '';
    return apiFetch<any[]>(`/mustahik${query}`);
  },
  async getById(id: string) {
    return apiFetch<MustahikDetail>(`/mustahik/${id}`);
  },
  async updateGps(id: string, lat: number, lng: number) {
    return apiFetch<MustahikDetail>(`/mustahik/${id}/gps`, {
      method: 'PATCH',
      body: JSON.stringify({ lat, lng }),
    });
  },
  async create(data: {
    nik: string;
    nama: string;
    kategoriAsnaf: string;
    hp: string;
    alamat: string;
    pekerjaan: string;
    jumlahTanggungan: number;
    penghasilanBulanan: number;
    rekeningBank: string;
  }) {
    return apiFetch<any>('/mustahik', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async update(
    id: string,
    data: {
      nama: string;
      kategoriAsnaf: string;
      hp: string;
      alamat: string;
      pekerjaan: string;
      jumlahTanggungan: number;
      penghasilanBulanan: number;
      rekeningBank: string;
      statusSurvei?: string;
    },
  ) {
    return apiFetch<MustahikDetail>(`/mustahik/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  async remove(id: string) {
    return apiFetch<void>(`/mustahik/${id}`, { method: 'DELETE' });
  },
};

export const programApi = {
  async list() {
    return apiFetch<any[]>('/program');
  },
  async getById(id: string) {
    return apiFetch<ProgramDetail>(`/program/${id}`);
  },
  async create(data: {
    nama: string;
    pilar: string;
    paguAnggaran: number;
    targetPenerima: number;
    penanggungJawab: string;
    status?: string;
  }) {
    return apiFetch<any>('/program', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async update(
    id: string,
    data: Partial<{
      nama: string;
      pilar: string;
      paguAnggaran: number;
      targetPenerima: number;
      penanggungJawab: string;
      status: string;
    }>,
  ) {
    return apiFetch<any>(`/program/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  async remove(id: string) {
    return apiFetch<any>(`/program/${id}`, {
      method: 'DELETE',
    });
  },
};

export const mitraApi = {
  async list(statusLpj?: string) {
    const query = statusLpj && statusLpj !== 'Semua' ? `?statusLpj=${encodeURIComponent(statusLpj)}` : '';
    return apiFetch<any[]>(`/mitra${query}`);
  },
  async getById(id: string) {
    return apiFetch<MitraDetail>(`/mitra/${id}`);
  },
  async create(data: {
    nama: string;
    bentukLembaga: string;
    masaKerjasama: string;
    picKontak: string;
    hpPic: string;
    totalPenyaluran?: number;
    statusLaporanLpj?: string;
  }) {
    return apiFetch<any>('/mitra', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async update(
    id: string,
    data: Partial<{
      nama: string;
      bentukLembaga: string;
      masaKerjasama: string;
      picKontak: string;
      hpPic: string;
      totalPenyaluran: number;
      statusLaporanLpj: string;
    }>,
  ) {
    return apiFetch<any>(`/mitra/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};

export const upzApi = {
  async list(kategori?: string, statusKepatuhan?: string) {
    const params = new URLSearchParams();
    if (kategori && kategori !== 'Semua') params.set('kategori', kategori);
    if (statusKepatuhan && statusKepatuhan !== 'Semua') params.set('statusKepatuhan', statusKepatuhan);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiFetch<any[]>(`/upz${query}`);
  },
  async getById(id: string) {
    return apiFetch<UpzDetail>(`/upz/${id}`);
  },
  async create(data: {
    nama: string;
    kategori: string;
    hakPengelolaanPct?: number;
    totalPenghimpunan?: number;
    totalPenyaluran?: number;
    statusKepatuhan?: string;
  }) {
    return apiFetch<any>('/upz', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async update(
    id: string,
    data: Partial<{
      nama: string;
      kategori: string;
      hakPengelolaanPct: number;
      totalPenghimpunan: number;
      totalPenyaluran: number;
      statusKepatuhan: string;
    }>,
  ) {
    return apiFetch<any>(`/upz/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  async portalSummary() {
    return apiFetch<any>('/upz/portal');
  },
};

export const payrollApi = {
  async list(divisi?: string) {
    const query = divisi && divisi !== 'Semua' ? `?divisi=${encodeURIComponent(divisi)}` : '';
    return apiFetch<any[]>(`/payroll${query}`);
  },
  async create(data: {
    nama: string;
    jabatan: string;
    divisi: string;
    gajiPokok: number;
    tunjanganAmil: number;
    keikutsertaanPayroll?: boolean;
    statusKerja?: string;
  }) {
    return apiFetch<any>('/payroll', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async update(
    id: string,
    data: Partial<{
      nama: string;
      jabatan: string;
      divisi: string;
      gajiPokok: number;
      tunjanganAmil: number;
      keikutsertaanPayroll: boolean;
      statusKerja: string;
    }>,
  ) {
    return apiFetch<any>(`/payroll/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  async process(periode?: string) {
    return apiFetch<{
      periode: string;
      jumlahAmil: number;
      totalBruto: number;
      totalPotonganZakat: number;
      totalNetto: number;
      slips: any[];
    }>('/payroll/process', {
      method: 'POST',
      body: JSON.stringify({ periode }),
    });
  },
};

export const dashboardApi = {
  async summary(params?: {
    dari?: string;
    sampai?: string;
    skala?: 'harian' | 'bulanan' | 'tahunan';
  }) {
    const q = new URLSearchParams();
    if (params?.dari) q.set('dari', params.dari);
    if (params?.sampai) q.set('sampai', params.sampai);
    if (params?.skala) q.set('skala', params.skala);
    const query = q.toString() ? `?${q.toString()}` : '';
    return apiFetch<any>(`/dashboard/summary${query}`);
  },
  async search(q: string) {
    return apiFetch<{
      menus: Array<{ id: string; screen: string; title: string; subtitle: string }>;
      muzakki: Array<{ id: string; screen: 'muzakki'; title: string; subtitle: string }>;
      mustahik: Array<{ id: string; screen: 'mustahik'; title: string; subtitle: string }>;
      penerimaan: Array<{ id: string; screen: 'penerimaan'; title: string; subtitle: string }>;
      penyaluran: Array<{ id: string; screen: 'penyaluran'; title: string; subtitle: string }>;
    }>(`/dashboard/search?q=${encodeURIComponent(q)}`);
  },
};

export const laporanApi = {
  async distribusi(params?: { dari?: string; sampai?: string }) {
    const q = new URLSearchParams();
    if (params?.dari) q.set('dari', params.dari);
    if (params?.sampai) q.set('sampai', params.sampai);
    const query = q.toString() ? `?${q.toString()}` : '';
    return apiFetch<any>(`/laporan/distribusi${query}`);
  },
  async sebaran() {
    return apiFetch<any>('/laporan/sebaran');
  },
  async dampak() {
    return apiFetch<any>('/laporan/dampak');
  },
};

export const keuanganApi = {
  async listCoa() {
    return apiFetch<any[]>('/keuangan/coa');
  },
  async listJurnal() {
    return apiFetch<any[]>('/keuangan/jurnal');
  },
  async createJurnal(data: {
    tanggal: string;
    keterangan: string;
    debitKode: string;
    kreditKode: string;
    nominal: number;
  }) {
    return apiFetch<any>('/keuangan/jurnal', { method: 'POST', body: JSON.stringify(data) });
  },
  async listSimba() {
    return apiFetch<any[]>('/keuangan/simba');
  },
  async exportSimba(kodeForm: string) {
    return apiFetch<any>(`/keuangan/simba/${kodeForm}/export`, { method: 'PATCH' });
  },
  async getClosing() {
    return apiFetch<any>('/keuangan/closing');
  },
  async updateClosingStep(periode: string, stepId: string, done: boolean) {
    return apiFetch<any>('/keuangan/closing/step', {
      method: 'PATCH',
      body: JSON.stringify({ periode, stepId, done }),
    });
  },
  async toggleClosingLock(periode: string, lock: boolean) {
    return apiFetch<any>('/keuangan/closing/lock', {
      method: 'PATCH',
      body: JSON.stringify({ periode, lock }),
    });
  },
  async laporanKeuangan(params?: { dari?: string; sampai?: string }) {
    const q = new URLSearchParams();
    if (params?.dari) q.set('dari', params.dari);
    if (params?.sampai) q.set('sampai', params.sampai);
    const query = q.toString() ? `?${q.toString()}` : '';
    return apiFetch<any>(`/keuangan/laporan${query}`);
  },
};

export const inboxApi = {
  async list() {
    return apiFetch<any[]>('/inbox');
  },
  async markRead(id: string) {
    return apiFetch<any>(`/inbox/${id}/read`, { method: 'PATCH' });
  },
  async markAllRead() {
    return apiFetch<any>('/inbox/read-all', { method: 'PATCH' });
  },
};

export const approvalApi = {
  async list(status?: string) {
    const query = status && status !== 'Menunggu' ? `?status=${encodeURIComponent(status)}` : '';
    return apiFetch<any[]>(`/approval${query}`);
  },
  async approve(id: string) {
    return apiFetch<any>(`/approval/${id}/approve`, { method: 'PATCH' });
  },
  async reject(id: string, catatan?: string) {
    return apiFetch<any>(`/approval/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ catatan: catatan || '' }),
    });
  },
};

export const portalApi = {
  async summary() {
    return apiFetch<any>('/portal/summary');
  },
  async listPengajuan(limit?: number) {
    const q = limit ? `?limit=${limit}` : '';
    return apiFetch<any[]>(`/portal/pengajuan${q}`);
  },
  async track(query: string) {
    return apiFetch<any>(`/portal/pengajuan/track?q=${encodeURIComponent(query)}`);
  },
};

export const kalkulatorApi = {
  async getConfig() {
    return apiFetch<import('./zakatCalculator').ZakatConfigView>('/kalkulator/config');
  },
  async updateConfig(data: import('./zakatCalculator').ZakatConfigParams) {
    return apiFetch<import('./zakatCalculator').ZakatConfigView>('/kalkulator/config', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async hitung(payload: { jenis: string; input: Record<string, unknown> }) {
    return apiFetch<any>('/kalkulator/hitung', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  async listRiwayat(params?: { limit?: number; jenis?: string; sumber?: string }) {
    const q = new URLSearchParams();
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.jenis) q.set('jenis', params.jenis);
    if (params?.sumber) q.set('sumber', params.sumber);
    const query = q.toString() ? `?${q.toString()}` : '';
    return apiFetch<any[]>(`/kalkulator/riwayat${query}`);
  },
};

