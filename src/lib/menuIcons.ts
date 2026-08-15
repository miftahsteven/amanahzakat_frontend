import {
  LayoutDashboard,
  FileBarChart,
  Map,
  HeartHandshake,
  Wallet,
  HandCoins,
  Users,
  FolderKanban,
  Building2,
  Globe2,
  Landmark,
  Banknote,
  UserRoundSearch,
  BookOpen,
  Lock,
  Package,
  Calculator,
  Info,
  Bell,
  UserCog,
  Layers,
  KeyRound,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';

export const MENU_ICON_OPTIONS: { value: string; label: string; Icon: LucideIcon }[] = [
  { value: 'LayoutDashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { value: 'FileBarChart', label: 'Laporan', Icon: FileBarChart },
  { value: 'Map', label: 'Peta', Icon: Map },
  { value: 'HeartHandshake', label: 'Dampak', Icon: HeartHandshake },
  { value: 'Wallet', label: 'Penerimaan', Icon: Wallet },
  { value: 'HandCoins', label: 'Penyaluran', Icon: HandCoins },
  { value: 'Users', label: 'Muzakki / User', Icon: Users },
  { value: 'FolderKanban', label: 'Program', Icon: FolderKanban },
  { value: 'Building2', label: 'Mitra', Icon: Building2 },
  { value: 'Globe2', label: 'Portal', Icon: Globe2 },
  { value: 'Landmark', label: 'UPZ', Icon: Landmark },
  { value: 'Banknote', label: 'Payroll', Icon: Banknote },
  { value: 'UserRoundSearch', label: 'Mustahik', Icon: UserRoundSearch },
  { value: 'BookOpen', label: 'Jurnal', Icon: BookOpen },
  { value: 'Lock', label: 'Closing', Icon: Lock },
  { value: 'Package', label: 'SIMBA', Icon: Package },
  { value: 'Calculator', label: 'Kalkulator', Icon: Calculator },
  { value: 'Info', label: 'Informasi', Icon: Info },
  { value: 'Bell', label: 'Inbox', Icon: Bell },
  { value: 'UserCog', label: 'Manajemen User', Icon: UserCog },
  { value: 'Layers', label: 'Modul', Icon: Layers },
  { value: 'KeyRound', label: 'Permission', Icon: KeyRound },
  { value: 'ShieldCheck', label: 'ACL', Icon: ShieldCheck },
];

const iconMap = Object.fromEntries(
  MENU_ICON_OPTIONS.map((option) => [option.value, option.Icon])
) as Record<string, LucideIcon>;

export function getMenuIcon(iconName?: string | null): LucideIcon | null {
  if (!iconName) return null;
  return iconMap[iconName] || null;
}
