export interface NavMenu {
  kodeMenu: string;
  namaMenu: string;
  kodeTampil: string;
  icon?: string | null;
  urutan: number;
  tampilDiSidebar: boolean;
  tampilDiHeader: boolean;
}

export interface NavModul {
  kodeModul: string;
  namaModul: string;
  urutan: number;
  menus: NavMenu[];
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  namaLengkap: string;
  nomorHp?: string | null;
  nip?: string | null;
  roles: string[];
  permissions: string[];
  menus: string[];
  navigation: NavModul[];
}

export interface CatalogPermission {
  id: string;
  kodePermission: string;
  namaPermission: string;
  aksi: string;
  menuId: string;
}

export interface CatalogMenu {
  id: string;
  kodeMenu: string;
  namaMenu: string;
  kodeTampil: string;
  icon?: string | null;
  urutan: number;
  tampilDiSidebar: boolean;
  tampilDiHeader: boolean;
  isActive?: boolean;
  modulId?: string;
  permissions: CatalogPermission[];
}

export interface CatalogModul {
  id: string;
  kodeModul: string;
  namaModul: string;
  urutan: number;
  isActive?: boolean;
  menus: CatalogMenu[];
}

export function menuCodesFromUser(user?: Partial<AuthUser> | null): string[] {
  if (user?.menus && user.menus.length > 0) {
    return user.menus;
  }

  if (user?.navigation && user.navigation.length > 0) {
    return user.navigation.flatMap((modul) => modul.menus.map((menu) => menu.kodeMenu));
  }

  return [];
}

export function findMenuLabel(navigation: NavModul[], kodeMenu: string): string {
  for (const modul of navigation) {
    const menu = modul.menus.find((item) => item.kodeMenu === kodeMenu);
    if (menu) return menu.namaMenu;
  }
  return kodeMenu;
}
