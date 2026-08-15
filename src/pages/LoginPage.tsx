import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  Building2, 
  Sparkles,
  KeyRound,
  FileCheck,
  Award
} from 'lucide-react';
import { authApi } from '../lib/api';
import { toast } from 'sonner';
import type { AuthUser } from '../types/acl';

export interface LoginPageProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      toast.error('Mohon isi username dan kata sandi Anda');
      return;
    }

    setIsLoading(true);

    try {
      const res = await authApi.login(username, password);
      setIsLoading(false);
      toast.success(`Selamat datang kembali! Autentikasi ACL berhasil untuk ${res.user.namaLengkap}`);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setIsLoading(false);
      toast.error(err.message || 'Username atau kata sandi tidak valid (Default: admin / password123)');
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#091D15] font-sans selection:bg-[#0B9D6D] selection:text-white relative overflow-hidden">
      
      {/* LEFT SIDE: Brand Showcase with Real Zakat Office Background */}
      <div className="hidden lg:flex lg:w-7/12 relative flex-col justify-between p-12 overflow-hidden">
        {/* Background Image Layer with Gradient Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
          style={{ backgroundImage: `url('/assets/zakat-office-bg.png')` }}
        />
        {/* Dark Emerald & Mint Glass Overlay for maximum legibility & brand alignment */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#091D15]/95 via-[#091D15]/80 to-[#0B9D6D]/45 backdrop-blur-[2px]" />

        {/* Decorative Light Glow Accent */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#0B9D6D]/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-[#C8933B]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Logo */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#0B9D6D] text-white flex items-center justify-center font-black text-2xl shadow-xl border border-white/20">
              A
            </div>
            <div>
              <span className="text-2xl font-black text-white tracking-tight block">AmanahZakat</span>
              <span className="text-xs font-bold text-[#A3DBC8] uppercase tracking-widest block">
                Sistem ERP Lembaga Amil ZIS Indonesia
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Server Aktif v2.4.0</span>
          </div>
        </div>

        {/* Center Main Value Proposition */}
        <div className="relative z-10 my-auto max-w-xl space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C8933B]/20 border border-[#C8933B]/40 text-[#F7F0E0] text-xs font-bold backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-[#C8933B]" />
            <span>Digitalisasi Penyelenggaraan Zakat, Infak & Sedekah</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-black text-white leading-[1.15] tracking-tight drop-shadow-md">
            Kelola ZIS Lebih Transparan, Akuntabel & Sesuai Syariah
          </h1>

          <p className="text-base text-[#D4DBD6] leading-relaxed font-normal">
            Platform ERP Terpadu untuk Pelayanan Muzakki, Pendataan Mustahik 8 Asnaf, Akuntansi PSAK 109, serta Integrasi Ekspor SIMBA BAZNAS Nasional.
          </p>

          {/* Key Feature Badges Grid */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-white flex items-start gap-3 hover:bg-white/15 transition-all">
              <div className="p-2 rounded-xl bg-[#0B9D6D]/40 text-[#A3DBC8] shrink-0">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white">Standar PSAK 109</h4>
                <p className="text-xs text-[#A3DBC8]">Pencatatan Jurnal & Laporan Keuangan ZIS Otomatis</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-white flex items-start gap-3 hover:bg-white/15 transition-all">
              <div className="p-2 rounded-xl bg-[#C8933B]/40 text-[#F7F0E0] shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white">Integrasi SIMBA BAZNAS</h4>
                <p className="text-xs text-[#D4DBD6]">Format Pelaporan Resmi Badan Amil Zakat Nasional</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer Info inside Office Backdrop */}
        <div className="relative z-10 flex items-center justify-between border-t border-white/15 pt-6 text-xs text-[#A3DBC8]">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#C8933B]" />
            <span>Kantor Pelayanan ZIS Kantor Pusat & Cabang Indonesia</span>
          </div>
          <span>© 2026 AmanahZakat ERP. Hak Cipta Dilindungi.</span>
        </div>
      </div>

      {/* RIGHT SIDE: Modern Clean Login Form */}
      <div className="w-full lg:w-5/12 flex items-center justify-center p-6 md:p-12 bg-[#F3F6F4] dark:bg-[#091D15] relative">
        {/* Soft Background Accent Lines */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#0B9D6D]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md space-y-8 relative z-10">
          
          {/* Mobile Logo View (Hidden on LG) */}
          <div className="lg:hidden flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#0B9D6D] text-white flex items-center justify-center font-black text-xl shadow-md">
              A
            </div>
            <div>
              <span className="text-xl font-black text-[#14271F] dark:text-white block">AmanahZakat</span>
              <span className="text-[10px] font-bold text-[#0B9D6D] uppercase tracking-wider block">Lembaga Amil Zakat</span>
            </div>
          </div>

          {/* Header Title */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#E6F7EE] dark:bg-[#0B9D6D]/20 text-[#0B9D6D] dark:text-[#A3DBC8] text-xs font-bold border border-[#A3DBC8]/50">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Portal Masuk Petugas Amil & Pengelola</span>
            </div>
            <h2 className="text-3xl font-black text-[#14271F] dark:text-white tracking-tight">
              Selamat Datang
            </h2>
            <p className="text-xs text-[#8A9691] font-medium leading-relaxed">
              Silakan masukkan kredensial akun amil Anda untuk mengelola transaksi penerimaan, penyaluran, dan laporan keuangan ZIS.
            </p>
          </div>

          {/* Main Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            
            {/* Input Username / NIP */}
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-[#14271F] dark:text-slate-200">
                Nama Pengguna / NIP Amil *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A9691]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: admin atau AML-2026-001"
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#14271F] border border-[#D4DBD6] dark:border-slate-700 rounded-xl text-xs text-[#14271F] dark:text-white placeholder-[#8A9691] focus:outline-none focus:ring-2 focus:ring-[#0B9D6D] focus:border-transparent transition-all font-medium"
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-extrabold text-[#14271F] dark:text-slate-200">
                  Kata Sandi *
                </label>
                <button
                  type="button"
                  onClick={() => toast.info('Sistem reset OTP dikirim ke email penanggung jawab amil.')}
                  className="text-[11px] font-bold text-[#0B9D6D] hover:underline cursor-pointer"
                >
                  Lupa Kata Sandi?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A9691]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-3 bg-white dark:bg-[#14271F] border border-[#D4DBD6] dark:border-slate-700 rounded-xl text-xs text-[#14271F] dark:text-white placeholder-[#8A9691] focus:outline-none focus:ring-2 focus:ring-[#0B9D6D] focus:border-transparent transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8A9691] hover:text-[#14271F] dark:hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember me & Security status */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#D4DBD6] text-[#0B9D6D] focus:ring-[#0B9D6D] accent-[#0B9D6D]"
                />
                <span className="text-xs font-medium text-[#14271F] dark:text-slate-300">
                  Ingat saya di perangkat ini
                </span>
              </label>

              <div className="flex items-center gap-1 text-[11px] font-bold text-[#0B9D6D]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>SSL 256-bit</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#0B9D6D] to-[#091D15] hover:from-[#091D15] hover:to-[#0B9D6D] text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memverifikasi Kredensial...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Dashboard ERP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Security Badges */}
          <div className="pt-6 border-t border-[#D4DBD6] dark:border-slate-800 text-center space-y-2">
            <div className="flex items-center justify-center gap-4 text-[11px] font-extrabold text-[#8A9691]">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0B9D6D]" /> BAZNAS Compliant
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-[#C8933B]" /> Standard Audit Syariah
              </span>
            </div>
            <p className="text-[10px] text-[#8A9691]">
              AmanahZakat ERP • Terdaftar & Diawasi Kementerian Agama RI & BAZNAS
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
