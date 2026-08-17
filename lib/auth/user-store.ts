'use client'

export type UserRole = 'warga' | 'bpd' | 'admin'

export interface UserProfile {
  id: string
  nama: string
  email: string
  peran: string
  role: UserRole
  jabatan: string
  desaDomisili: string
  kecamatan: string
  kabupaten: string
  provinsi: string
  nik: string
  telepon: string
  tanggalDaftar: string
  statusVerifikasi: string
  avatar: string
}

export const PRESET_USERS: Record<UserRole, UserProfile> = {
  warga: {
    id: 'usr-warga-01',
    nama: 'Budi Santoso',
    email: 'warga@demo.id',
    peran: 'Warga / Pemantau',
    role: 'warga',
    jabatan: 'Warga / Pemantau Publik',
    desaDomisili: 'Desa Karanganyar',
    kecamatan: 'Kecamatan Karanganyar',
    kabupaten: 'Kabupaten Karanganyar',
    provinsi: 'Jawa Tengah',
    nik: '3313010508920002',
    telepon: '+62 812-3456-7890',
    tanggalDaftar: '12 Januari 2024',
    statusVerifikasi: 'Terverifikasi KTP (Warga Desa)',
    avatar: 'B',
  },
  bpd: {
    id: 'usr-bpd-01',
    nama: 'Drs. H. Mulyono',
    email: 'bpd@demo.id',
    peran: 'BPD / Auditor',
    role: 'bpd',
    jabatan: 'Ketua Badan Permusyawaratan Desa (BPD)',
    desaDomisili: 'Desa Karanganyar',
    kecamatan: 'Kecamatan Karanganyar',
    kabupaten: 'Kabupaten Karanganyar',
    provinsi: 'Jawa Tengah',
    nik: '3313011204680001',
    telepon: '+62 813-9876-5432',
    tanggalDaftar: '05 Januari 2024',
    statusVerifikasi: 'Kredensial Resmi BPD (SK Bupati)',
    avatar: 'M',
  },
  admin: {
    id: 'usr-admin-01',
    nama: 'Endang Widyastuti, S.AP',
    email: 'admin@demo.id',
    peran: 'Admin Desa',
    role: 'admin',
    jabatan: 'Sekretaris Desa (Sekdes) & PPKD',
    desaDomisili: 'Desa Karanganyar',
    kecamatan: 'Kecamatan Karanganyar',
    kabupaten: 'Kabupaten Karanganyar',
    provinsi: 'Jawa Tengah',
    nik: '3313014502800003',
    telepon: '+62 811-2233-4455',
    tanggalDaftar: '01 Januari 2024',
    statusVerifikasi: 'Administrator Siskeudes Terverifikasi',
    avatar: 'E',
  },
}

const STORAGE_KEY = 'transparandesa_active_user_role'

export function getActiveUserRole(): UserRole {
  if (typeof window === 'undefined') return 'warga'
  const saved = localStorage.getItem(STORAGE_KEY) as UserRole
  if (saved && PRESET_USERS[saved]) {
    return saved
  }
  return 'warga'
}

export function setActiveUserRole(role: UserRole) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, role)
  document.cookie = `user_role=${role}; path=/; max-age=604800`
  window.dispatchEvent(new Event('auth_state_change'))
}

export function getActiveUserProfile(): UserProfile {
  const role = getActiveUserRole()
  return PRESET_USERS[role]
}

export function loginUserByEmail(email: string): UserProfile {
  const lower = (email || '').toLowerCase().trim()
  let role: UserRole = 'warga'

  if (lower.includes('admin')) {
    role = 'admin'
  } else if (lower.includes('bpd') || lower.includes('auditor')) {
    role = 'bpd'
  } else {
    role = 'warga'
  }

  setActiveUserRole(role)
  return PRESET_USERS[role]
}

export function logoutUser() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
  document.cookie = 'user_role=; path=/; max-age=0'
  window.dispatchEvent(new Event('auth_state_change'))
}
