'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, ArrowLeft, Leaf, User, Mail, Lock, Phone } from 'lucide-react'

import { loginUserByEmail } from '@/lib/auth/user-store'
import { supabase } from '@/lib/supabase/client'

export default function AuthPage() {
  const [isRegister, setIsRegister] = useState(false)
  const [showPw, setShowPw] = useState(false)

  // Login form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Register form state
  const [namaReg, setNamaReg] = useState('')
  const [emailReg, setEmailReg] = useState('')
  const [kontakReg, setKontakReg] = useState('')
  const [pwReg, setPwReg] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    loginUserByEmail(email)
    if (supabase) {
      try {
        await supabase.auth.signInWithPassword({ email, password })
      } catch (err) {
        console.warn('Supabase auth sign in error (falling back to local session):', err)
      }
    }
    window.location.href = '/dashboard'
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    loginUserByEmail(emailReg)
    window.location.href = '/dashboard'
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
                  Masuk ke sistem transparansi TransparanDesa
                </p>
              </div>

              {/* Quick demo accounts */}
              <div className="rounded-xl border border-border bg-muted/40 p-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Pintasi 1-Klik Akun Demo:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {['warga@demo.id', 'bpd@demo.id', 'admin@demo.id'].map((acc) => (
                    <button
                      key={acc}
                      type="button"
                      onClick={() => { setEmail(acc); setPassword('demo1234') }}
                      className="rounded-full border border-border bg-card hover:bg-secondary hover:text-primary px-2.5 py-1 text-xs font-medium text-foreground transition-colors"
                    >
                      {acc.split('@')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@anda.com"
                    required
                    className="w-full h-10 rounded-xl border border-input bg-background pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
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
                    className="w-full h-10 rounded-xl border border-input bg-background pl-9 pr-10 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
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
                className="w-full h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xs transition-all shadow-xs mt-2"
              >
                MASUK SEKARANG
              </button>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegister} className="space-y-3 max-w-sm mx-auto w-full">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Leaf className="size-4" />
                </div>
                <span className="font-heading font-bold text-foreground text-base">TransparanDesa</span>
              </div>

              <div>
                <h1 className="font-heading text-2xl font-bold text-foreground">Daftar Akun</h1>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Buat akun untuk ikut mengawasi dana desa
                </p>
              </div>

              {/* Nama */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={namaReg}
                    onChange={(e) => setNamaReg(e.target.value)}
                    placeholder="Nama Anda"
                    required
                    className="w-full h-9 rounded-xl border border-input bg-background pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Email */}
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
                    className="w-full h-9 rounded-xl border border-input bg-background pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* No HP */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">No. WhatsApp <span className="text-muted-foreground font-normal">(opsional)</span></label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type="tel"
                    value={kontakReg}
                    onChange={(e) => setKontakReg(e.target.value)}
                    placeholder="0812xxxxxxx"
                    className="w-full h-9 rounded-xl border border-input bg-background pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={pwReg}
                    onChange={(e) => setPwReg(e.target.value)}
                    placeholder="Min. 8 karakter"
                    required
                    minLength={8}
                    className="w-full h-9 rounded-xl border border-input bg-background pl-9 pr-10 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xs transition-all shadow-xs mt-1"
              >
                BUAT AKUN SEKARANG
              </button>
            </form>
          )}
        </div>

        {/* RIGHT COLUMN: GREEN BANNER PANEL */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-primary via-[#3d8b4c] to-[#2a5c35] text-primary-foreground p-8 sm:p-10 flex flex-col items-center justify-center text-center relative min-h-[260px] md:min-h-[500px]">
          {/* Decorative background elements */}
          <div className="absolute -top-12 -left-12 size-48 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -bottom-10 -right-8 size-40 rounded-full bg-white/5 pointer-events-none" />

          <div className="relative flex size-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 mb-5">
            <Leaf className="size-7 text-white" />
          </div>

          {!isRegister ? (
            <div className="space-y-4 max-w-xs">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-1.5">TransparanDesa</p>
                <h2 className="font-heading text-2xl font-bold leading-tight text-white">
                  Halo, Selamat Datang!
                </h2>
                <p className="mt-2 text-xs text-white/80 leading-relaxed">
                  Belum punya akun? Bergabunglah sekarang untuk mengakses data dan ikut serta dalam pengawasan desa.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className="w-full rounded-xl border-2 border-white/50 bg-white/10 hover:bg-white/25 px-6 py-2.5 text-xs font-bold text-white tracking-wider transition-all shadow-sm"
              >
                DAFTAR AKUN BARU
              </button>
            </div>
          ) : (
            <div className="space-y-4 max-w-xs">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-1.5">TransparanDesa</p>
                <h2 className="font-heading text-2xl font-bold leading-tight text-white">
                  Sudah Punya Akun?
                </h2>
                <p className="mt-2 text-xs text-white/80 leading-relaxed">
                  Masuk dengan akun Anda dan lanjutkan memantau transparansi anggaran desa secara terbuka.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="w-full rounded-xl border-2 border-white/50 bg-white/10 hover:bg-white/25 px-6 py-2.5 text-xs font-bold text-white tracking-wider transition-all shadow-sm"
              >
                MASUK KE AKUN
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
