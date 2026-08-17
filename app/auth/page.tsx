'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, ArrowLeft, Leaf, User, Mail, Lock, Phone, CheckCircle2, Shield, Users, Building2 } from 'lucide-react'
import Swal from 'sweetalert2'

import { loginUserByEmail, PRESET_USERS, UserRole } from '@/lib/auth/user-store'
import { supabase } from '@/lib/supabase/client'

export default function AuthPage() {
  const [isRegister, setIsRegister] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  // Login form state (default ke akun Warga)
  const [email, setEmail] = useState('warga@demo.id')
  const [password, setPassword] = useState('demo1234')

  // Register form state
  const [namaReg, setNamaReg] = useState('')
  const [emailReg, setEmailReg] = useState('')
  const [kontakReg, setKontakReg] = useState('')
  const [pwReg, setPwReg] = useState('')

  // Menentukan role aktif yang sedang dipilih berdasarkan email
  const activeRole: UserRole = email.includes('admin')
    ? 'admin'
    : email.includes('bpd')
    ? 'bpd'
    : 'warga'

  const demoAccounts = [
    {
      role: 'warga' as UserRole,
      label: 'Warga / Pemantau',
      email: 'warga@demo.id',
      icon: Users,
      badge: 'Default',
    },
    {
      role: 'bpd' as UserRole,
      label: 'BPD / Auditor',
      email: 'bpd@demo.id',
      icon: Shield,
      badge: 'Pengawas',
    },
    {
      role: 'admin' as UserRole,
      label: 'Admin Desa',
      email: 'admin@demo.id',
      icon: Building2,
      badge: 'Perangkat',
    },
  ]

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    // 1. Validasi Input Kosong
    if (!email.trim() || !password.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Form Belum Lengkap',
        text: 'Silakan isi email dan kata sandi Anda.',
        confirmButtonColor: '#2F6E3F',
        confirmButtonText: 'Mengerti',
        customClass: {
          popup: 'rounded-3xl border border-border bg-card shadow-2xl font-sans',
          confirmButton: 'rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-xs',
        },
      })
      return
    }

    setLoading(true)

    // 2. Validasi Kredensial
    let isValid = false
    const lowerEmail = email.toLowerCase().trim()
    const isDemoEmail = lowerEmail === 'warga@demo.id' || lowerEmail === 'bpd@demo.id' || lowerEmail === 'admin@demo.id'
    
    if (isDemoEmail && password === 'demo1234') {
      isValid = true
    }

    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email: lowerEmail, password })
        if (!error && data.user) {
          isValid = true
        }
      } catch (err) {
        console.warn('Supabase auth check fallback:', err)
      }
    }

    setLoading(false)

    // 3. Handle Gagal Login
    if (!isValid) {
      Swal.fire({
        icon: 'error',
        title: 'Login Gagal!',
        html: `Email atau kata sandi yang Anda masukkan tidak sesuai.<br/><span class="text-xs text-muted-foreground mt-2 block">Gunakan kata sandi <b>demo1234</b> untuk akun demo resmi.</span>`,
        confirmButtonColor: '#2F6E3F',
        confirmButtonText: 'Coba Lagi',
        customClass: {
          popup: 'rounded-3xl border border-border bg-card shadow-2xl font-sans',
          confirmButton: 'rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-xs',
        },
      })
      return
    }

    // 4. Handle Berhasil Login
    const user = loginUserByEmail(lowerEmail)
    
    Swal.fire({
      icon: 'success',
      title: 'Login Berhasil!',
      html: `
        <div style="text-align: left; font-size: 12px; margin-top: 10px; padding: 12px; border-radius: 12px; background: rgba(47,110,63,0.08); border: 1px solid rgba(47,110,63,0.2);">
          <p style="margin: 0 0 4px 0;"><b>👤 Nama:</b> ${user.nama}</p>
          <p style="margin: 0 0 4px 0;"><b>🛡️ Peran:</b> ${user.peran}</p>
          <p style="margin: 0;"><b>📍 Wilayah:</b> ${user.desaDomisili}</p>
        </div>
        <p style="font-size: 11px; color: #666; margin-top: 10px;">Mengalihkan ke dasbor...</p>
      `,
      timer: 1600,
      showConfirmButton: false,
      timerProgressBar: true,
      customClass: {
        popup: 'rounded-3xl border border-border bg-card shadow-2xl font-sans',
      },
    }).then(() => {
      window.location.href = '/dashboard'
    })
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!namaReg.trim() || !emailReg.trim() || !pwReg.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Form Belum Lengkap',
        text: 'Semua kolom wajib diisi untuk pendaftaran.',
        confirmButtonColor: '#2F6E3F',
      })
      return
    }

    const user = loginUserByEmail(emailReg)
    Swal.fire({
      icon: 'success',
      title: 'Pendaftaran Berhasil!',
      text: `Selamat datang, ${namaReg}! Akun Anda telah terdaftar.`,
      timer: 1500,
      showConfirmButton: false,
    }).then(() => {
      window.location.href = '/dashboard'
    })
  }

  return (
    <div className="min-h-dvh bg-surface flex flex-col items-center justify-center p-4 sm:p-6 relative">
      {/* Back to home button */}
      <div className="w-full max-w-4xl flex items-center justify-start mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-xs"
        >
          <ArrowLeft className="size-3.5" />
          Beranda
        </Link>
      </div>

      {/* Main Outer Container */}
      <div className="w-full max-w-4xl rounded-3xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* LEFT / MAIN COLUMN: FORM AREA */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 sm:py-10 flex flex-col justify-center bg-card">
          {!isRegister ? (
            /* LOGIN FORM */
            <form onSubmit={handleLogin} className="space-y-4 max-w-sm mx-auto w-full">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Leaf className="size-4" />
                </div>
                <span className="font-heading font-bold text-foreground text-base">TransparanDesa</span>
              </div>

              <div>
                <h1 className="font-heading text-2xl font-bold text-foreground">Masuk</h1>
                <p className="mt-1 text-xs text-muted-foreground">
                  Pilih peran demo atau masukkan email kredensial Anda
                </p>
              </div>

              {/* Quick demo accounts with active highlight */}
              <div className="rounded-2xl border border-border bg-muted/30 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Pilih Peran Akun Demo (1-Klik):
                  </p>
                  <span className="text-[10px] font-semibold text-primary">
                    Aktif: {activeRole.toUpperCase()}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-1.5">
                  {demoAccounts.map((acc) => {
                    const isSelected = activeRole === acc.role
                    return (
                      <button
                        key={acc.email}
                        type="button"
                        onClick={() => {
                          setEmail(acc.email)
                          setPassword('demo1234')
                        }}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-primary text-primary-foreground border-primary shadow-xs ring-2 ring-primary/20 scale-[1.02]'
                            : 'bg-card text-foreground border-border hover:bg-muted hover:border-primary/40'
                        }`}
                      >
                        <acc.icon className={`size-4 mb-1 ${isSelected ? 'text-primary-foreground' : 'text-primary'}`} />
                        <span className="text-[11px] font-bold leading-tight block">
                          {acc.role === 'warga' && 'Warga'}
                          {acc.role === 'bpd' && 'BPD'}
                          {acc.role === 'admin' && 'Admin'}
                        </span>
                        <span className={`text-[9px] mt-0.5 ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                          {acc.badge}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Email Pengguna</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@anda.com"
                    required
                    className="w-full h-10 rounded-xl border border-input bg-background pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">Password</label>
                  <button type="button" className="text-[11px] text-primary hover:underline">Lupa password?</button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full h-10 rounded-xl border border-input bg-background pl-9 pr-10 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs tracking-wide transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? 'Memverifikasi...' : 'MASUK SEKARANG'}
              </button>

              <div className="pt-2 text-center text-xs text-muted-foreground">
                <p>
                  Belum punya akun?{' '}
                  <button
                    type="button"
                    onClick={() => setIsRegister(true)}
                    className="font-semibold text-primary hover:underline cursor-pointer"
                  >
                    Daftar Akun Baru
                  </button>
                </p>
              </div>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegister} className="space-y-3.5 max-w-sm mx-auto w-full">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Leaf className="size-4" />
                </div>
                <span className="font-heading font-bold text-foreground text-base">TransparanDesa</span>
              </div>

              <div>
                <h1 className="font-heading text-2xl font-bold text-foreground">Daftar Akun</h1>
                <p className="mt-1 text-xs text-muted-foreground">
                  Daftar untuk memantau dana dan menyampaikan aspirasi warga desa
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={namaReg}
                    onChange={(e) => setNamaReg(e.target.value)}
                    placeholder="Nama Lengkap Anda"
                    required
                    className="w-full h-9 rounded-xl border border-input bg-background pl-9 pr-3 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={emailReg}
                    onChange={(e) => setEmailReg(e.target.value)}
                    placeholder="email@anda.com"
                    required
                    className="w-full h-9 rounded-xl border border-input bg-background pl-9 pr-3 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">No. WhatsApp</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type="tel"
                    value={kontakReg}
                    onChange={(e) => setKontakReg(e.target.value)}
                    placeholder="08123456789"
                    className="w-full h-9 rounded-xl border border-input bg-background pl-9 pr-3 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={pwReg}
                    onChange={(e) => setPwReg(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full h-9 rounded-xl border border-input bg-background pl-9 pr-3 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs tracking-wide transition-all shadow-xs cursor-pointer"
              >
                DAFTAR SEKARANG
              </button>

              <div className="pt-2 text-center text-xs text-muted-foreground">
                <p>
                  Sudah punya akun?{' '}
                  <button
                    type="button"
                    onClick={() => setIsRegister(false)}
                    className="font-semibold text-primary hover:underline cursor-pointer"
                  >
                    Masuk di sini
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>

        {/* RIGHT COLUMN: WELCOME BANNER */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-primary to-[#245230] p-8 sm:p-12 text-primary-foreground flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute -top-16 -right-16 size-48 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 size-56 rounded-full bg-white/5 pointer-events-none" />

          <div className="size-16 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-6 shadow-inner">
            <Leaf className="size-8 text-primary-foreground" />
          </div>

          <span className="text-[11px] font-bold uppercase tracking-widest text-primary-foreground/80 mb-2">
            TRANSPARANDESA
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold mb-3 text-white">
            Halo, Selamat Datang!
          </h2>
          <p className="text-xs text-primary-foreground/80 max-w-xs leading-relaxed mb-6">
            Portal transparansi APBDes, audit AI 5-Tingkat, dan pengawasan partisipatif anggaran desa seluruh Indonesia.
          </p>

          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs text-xs text-white/90 max-w-xs text-left space-y-1.5 border border-white/10">
            <div className="flex items-center gap-2 font-bold text-[11px]">
              <CheckCircle2 className="size-3.5 text-emerald-300" />
              <span>3 Peran Resmi Tersedia:</span>
            </div>
            <p className="text-[10px] text-white/80 leading-normal">
              • <b>Warga:</b> Visualizer & Lapor APBDes<br/>
              • <b>BPD:</b> Analisis Anomali MAD/Z-Score & Audit<br/>
              • <b>Admin Desa:</b> Upload Siskeudes & Hak Jawab
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
