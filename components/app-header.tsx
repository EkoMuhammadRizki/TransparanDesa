'use client'

import Link from 'next/link'
import { LogOut } from 'lucide-react'
import { Logo } from '@/components/logo'
import Swal from 'sweetalert2'
import { useState, useEffect } from 'react'
import { getActiveUserProfile, logoutUser, PRESET_USERS, UserProfile } from '@/lib/auth/user-store'

export function AppHeader() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(PRESET_USERS.warga)

  useEffect(() => {
    setCurrentUser(getActiveUserProfile())
    const handleAuthChange = () => {
      setCurrentUser(getActiveUserProfile())
    }
    window.addEventListener('auth_state_change', handleAuthChange)
    return () => window.removeEventListener('auth_state_change', handleAuthChange)
  }, [])

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault()
    Swal.fire({
      title: 'Konfirmasi Keluar',
      text: 'Apakah Anda yakin ingin keluar dari akun ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2F6E3F',
      cancelButtonColor: '#c2703d',
      confirmButtonText: 'Ya, Keluar',
      cancelButtonText: 'Batal',
      reverseButtons: true,
      customClass: {
        popup: 'rounded-2xl border border-border bg-card shadow-xl font-sans',
        confirmButton: 'rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-xs',
        cancelButton: 'rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-xs',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        logoutUser()
        window.location.href = '/'
      }
    })
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Logo />
        </Link>

        {/* Right User Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link
            href="/profil"
            title="Buka Profil Pengguna"
            className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-1.5 hover:border-primary/50 hover:bg-muted/60 transition-all shadow-2xs group cursor-pointer"
          >
            <div className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-xs group-hover:scale-105 transition-transform">
              {currentUser.avatar || currentUser.nama[0] || 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors leading-none">
                {currentUser.nama}
              </p>
              <p className="text-[10px] text-muted-foreground">{currentUser.peran}</p>
            </div>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card hover:bg-muted hover:border-rose-300 px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-rose-600 transition-colors cursor-pointer shadow-2xs"
          >
            <LogOut className="size-3.5" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>
    </header>
  )
}
