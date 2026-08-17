'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AppHeader } from '@/components/app-header'
import {
  User,
  Shield,
  FileText,
  Clock,
  CheckCircle2,
  MapPin,
  Mail,
  Phone,
  Building2,
  Lock,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Eye,
  Award,
  AlertCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type RoleType = 'warga' | 'bpd' | 'admin'

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'identitas' | 'riwayat' | 'keamanan'>('identitas')
  const [currentRole, setCurrentRole] = useState<RoleType>('warga')
  const [isAnonymousDefault, setIsAnonymousDefault] = useState(true)
  const [savedSuccess, setSavedSuccess] = useState(false)

  // Profile data states
  const [profileData, setProfileData] = useState({
    nama: 'Warga Demo',
    email: 'warga@demo.id',
    nik: '331301******0002',
    telepon: '+62 812-3456-7890',
    desaDomisili: 'Desa Karanganyar',
    kecamatan: 'Kecamatan Karanganyar',
    kabupaten: 'Kabupaten Karanganyar',
    provinsi: 'Jawa Tengah',
    pekerjaan: 'Wiraswasta / Pemerhati Kebijakan Publik',
    tanggalDaftar: '12 Januari 2024',
    statusVerifikasi: 'Terverifikasi KTP (Terenkripsi SHA-256)',
  })

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  const roleConfigs = {
    warga: {
      title: 'Warga / Pemantau Publik',
      badge: 'Warga Terverifikasi',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      desc: 'Memantau alokasi belanja desa, memeriksa transparansi proyek APBDes, dan berpartisipasi menyampaikan aspirasi/laporan partisipatif.',
      quickLinks: [
        { label: 'Lihat APBDes Desa Karanganyar', href: '/desa/karanganyar/apbdes', icon: FileText },
        { label: 'Kirim Laporan / Aduan Baru', href: '/desa/karanganyar/lapor', icon: AlertCircle },
      ],
    },
    bpd: {
      title: 'BPD & Auditor Lapangan',
      badge: 'Badan Permusyawaratan Desa',
      color: 'bg-blue-50 text-blue-800 border-blue-300',
      desc: 'Melakukan fungsi pengawasan legislatif desa sesuai UU No. 6/2014, audit statistik Modified Z-Score/MAD, dan ekspor lembar kerja pengawasan.',
      quickLinks: [
        { label: 'Buka Portal Analisis Auditor', href: '/auditor', icon: Shield },
        { label: 'Deteksi Anomali Hybrid Karanganyar', href: '/desa/karanganyar/benchmark', icon: Award },
      ],
    },
    admin: {
      title: 'Perangkat Desa / Administrator',
      badge: 'Sekretariat / Bendahara Desa',
      color: 'bg-amber-50 text-amber-800 border-amber-300',
      desc: 'Mengunggah file PDF APBDes Siskeudes resmi, memverifikasi hasil ekstraksi AI, dan memberikan klarifikasi/Hak Jawab resmi atas laporan warga.',
      quickLinks: [
        { label: 'Upload PDF Siskeudes Baru', href: '/desa/karanganyar/upload', icon: FileText },
        { label: 'Antrean Review Ekstraksi AI', href: '/admin/review-queue', icon: Clock },
      ],
    },
  }

  return (
    <div className="min-h-dvh bg-surface">
      <AppHeader />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground transition-colors">
            Dasbor
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="font-semibold text-foreground">Profil Pengguna</span>
        </nav>

        {/* Top Profile Header Card */}
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xs relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 h-40 w-72 bg-gradient-to-bl from-primary/10 via-accent/10 to-transparent pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="relative">
                <div className="flex size-20 sm:size-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-heading text-3xl font-bold shadow-md shadow-primary/20">
                  {profileData.nama[0]}
                </div>
                <div className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs" title="Akun Terverifikasi">
                  <CheckCircle2 className="size-3.5" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
                    {profileData.nama}
                  </h1>
                  <Badge className={`text-xs font-semibold ${roleConfigs[currentRole].color}`}>
                    {roleConfigs[currentRole].badge}
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                  <Mail className="size-3.5" />
                  {profileData.email}
                  <span className="text-border">•</span>
                  <MapPin className="size-3.5 text-primary" />
                  {profileData.desaDomisili}, {profileData.kabupaten}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Bergabung sejak {profileData.tanggalDaftar}
                </p>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="flex sm:flex-col items-center sm:items-end gap-2 border-t sm:border-t-0 pt-4 sm:pt-0 border-border">
              <Link href="/desa/karanganyar/apbdes">
                <Button size="sm" className="rounded-xl shadow-xs gap-1.5 text-xs font-semibold">
                  <Eye className="size-3.5" />
                  Pantau APBDes
                </Button>
              </Link>
            </div>
          </div>

          {/* Role Switcher Pill Bar (Demo Persona Switcher) */}
          <div className="mt-6 pt-5 border-t border-border/70">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
                  Simulasi Peran / Persona Pengguna:
                </span>
                <p className="text-[11px] text-muted-foreground">
                  {roleConfigs[currentRole].desc}
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-2xl border border-border">
                {(['warga', 'bpd', 'admin'] as RoleType[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setCurrentRole(r)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      currentRole === r
                        ? 'bg-card text-foreground shadow-xs border border-border/80'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {r === 'warga' && '👥 Warga'}
                    {r === 'bpd' && '⚖️ BPD / Auditor'}
                    {r === 'admin' && '🏢 Admin Desa'}
                  </button>
                ))}
              </div>
            </div>

            {/* Role Quick Links */}
            <div className="mt-3 flex flex-wrap gap-2">
              {roleConfigs[currentRole].quickLinks.map((ql, idx) => (
                <Link
                  key={idx}
                  href={ql.href}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card/80 hover:bg-muted px-3 py-1.5 text-xs font-medium text-foreground transition-colors shadow-2xs"
                >
                  <ql.icon className="size-3 text-primary" />
                  {ql.label}
                  <ArrowRight className="size-3 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-border mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('identitas')}
            className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'identitas'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <User className="size-4" />
            Identitas &amp; Domisili
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('riwayat')}
            className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'riwayat'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Clock className="size-4" />
            Riwayat Partisipasi &amp; Laporan
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('keamanan')}
            className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'keamanan'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Lock className="size-4" />
            Keamanan &amp; Privasi
          </button>
        </div>

        {/* TAB 1: IDENTITAS & DOMISILI */}
        {activeTab === 'identitas' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-xs">
              <h2 className="font-heading text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <User className="size-4 text-primary" />
                Data Profil &amp; Kependudukan
              </h2>

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                {savedSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2 animate-fade-in">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                    <span>Perubahan profil berhasil disimpan secara lokal!</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Nama Lengkap</label>
                    <input
                      type="text"
                      value={profileData.nama}
                      onChange={(e) => setProfileData({ ...profileData, nama: e.target.value })}
                      className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Alamat Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Nomor Induk Kependudukan (NIK)</label>
                    <input
                      type="text"
                      disabled
                      value={profileData.nik}
                      className="w-full h-9 rounded-xl border border-input bg-muted/60 px-3 text-xs text-muted-foreground cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Nomor WhatsApp / Kontak</label>
                    <input
                      type="text"
                      value={profileData.telepon}
                      onChange={(e) => setProfileData({ ...profileData, telepon: e.target.value })}
                      className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Desa Domisili</label>
                    <input
                      type="text"
                      value={profileData.desaDomisili}
                      onChange={(e) => setProfileData({ ...profileData, desaDomisili: e.target.value })}
                      className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Kabupaten / Provinsi</label>
                    <input
                      type="text"
                      disabled
                      value={`${profileData.kabupaten}, ${profileData.provinsi}`}
                      className="w-full h-9 rounded-xl border border-input bg-muted/60 px-3 text-xs text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Pekerjaan / Bidang Kepentingan</label>
                  <input
                    type="text"
                    value={profileData.pekerjaan}
                    onChange={(e) => setProfileData({ ...profileData, pekerjaan: e.target.value })}
                    className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <Button type="submit" size="sm" className="rounded-xl shadow-xs text-xs font-semibold">
                    Simpan Perubahan
                  </Button>
                </div>
              </form>
            </div>

            {/* Sidebar Verifikasi & Keanggotaan */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                  <Shield className="size-4" />
                  Status Kredensial
                </div>
                <div className="p-3 rounded-xl bg-muted/40 border border-border text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">KTP Digital</span>
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="size-3" /> Terverifikasi
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Enkripsi NIK</span>
                    <span className="font-mono text-[10px] text-foreground">SHA-256</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Hak Lapor Warga</span>
                    <span className="text-primary font-semibold">Aktif</span>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Identitas Anda terhubung dengan verifikasi kependudukan desa untuk mencegah bot/spam, dengan opsi tetap anonim saat mengirim aduan.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-foreground">
                  Desa yang Dipantau
                </h3>
                <div className="space-y-2 text-xs">
                  <Link
                    href="/desa/karanganyar"
                    className="flex items-center justify-between p-2.5 rounded-xl border border-border hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="size-3.5 text-primary" />
                      <span className="font-semibold text-foreground">Desa Karanganyar</span>
                    </div>
                    <Badge variant="outline" className="text-[10px]">Data Riil</Badge>
                  </Link>
                  <Link
                    href="/desa/bojonegoro-nganti"
                    className="flex items-center justify-between p-2.5 rounded-xl border border-border hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="size-3.5 text-muted-foreground" />
                      <span className="font-semibold text-foreground">Desa Nganti (Bojonegoro)</span>
                    </div>
                    <Badge variant="outline" className="text-[10px]">SIKD</Badge>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RIWAYAT PARTISIPASI & LAPORAN */}
        {activeTab === 'riwayat' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <h2 className="font-heading text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <FileText className="size-4 text-primary" />
                Daftar Laporan &amp; Aduan Partisipatif Anda
              </h2>

              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[11px]">
                        Selesai
                      </Badge>
                      <span className="font-mono text-xs font-bold text-foreground">#LAP-2024-001</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">18 Juni 2024</span>
                  </div>

                  <h3 className="font-heading text-sm font-bold text-foreground">
                    Perbaikan Tutup Saluran Drainase RT 02 Dusun I (Desa Karanganyar)
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Terdapat beberapa titik plat beton penutup drainase yang retak akibat sering dilalui armada pengangkut hasil panen padi.
                  </p>

                  <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="size-3.5" />
                      Tanggapan Resmi: TPK telah mengganti plat beton pembesian baru (22 Juni 2024).
                    </span>
                    <Link href="/lapor/LAP-2024-001" className="text-primary font-semibold hover:underline inline-flex items-center gap-1">
                      Lihat Detail <ExternalLink className="size-3" />
                    </Link>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-[11px]">
                        Ditindaklanjuti
                      </Badge>
                      <span className="font-mono text-xs font-bold text-foreground">#LAP-2024-002</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">05 Agustus 2024</span>
                  </div>

                  <h3 className="font-heading text-sm font-bold text-foreground">
                    Jadwal Timbangan &amp; Alat Posyandu Balita RW 03
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Mohon penambahan alat ukur infantometer digital agar pencatatan stunting balita lebih presisi.
                  </p>

                  <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-blue-700 font-semibold flex items-center gap-1">
                      <Clock className="size-3.5" />
                      Tanggapan Resmi: Dimasukkan ke pengadaan Tahap 2 dan didistribusikan ke Bidan Desa.
                    </span>
                    <Link href="/lapor/LAP-2024-002" className="text-primary font-semibold hover:underline inline-flex items-center gap-1">
                      Lihat Detail <ExternalLink className="size-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: KEAMANAN & PRIVASI */}
        {activeTab === 'keamanan' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
              <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
                <Lock className="size-4 text-primary" />
                Preferensi Privasi Laporan
              </h2>

              <div className="space-y-4 text-xs">
                <div className="flex items-start justify-between gap-4 p-3 rounded-xl border border-border bg-muted/20">
                  <div>
                    <span className="font-semibold text-foreground block">Mode Anonim Otomatis</span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Sembunyikan nama dan kontak Anda secara otomatis saat mengirim laporan/aduan anggaran baru.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isAnonymousDefault}
                    onChange={(e) => setIsAnonymousDefault(e.target.checked)}
                    className="size-4 mt-1 accent-primary cursor-pointer"
                  />
                </div>

                <div className="flex items-start justify-between gap-4 p-3 rounded-xl border border-border bg-muted/20">
                  <div>
                    <span className="font-semibold text-foreground block">Notifikasi Tanggapan Resmi</span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Terima pemberitahuan saat Kepala Desa / Sekdes memberikan Hak Jawab resmi atas laporan Anda.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="size-4 mt-1 accent-primary cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
              <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
                <Shield className="size-4 text-primary" />
                Keamanan Akun
              </h2>

              <div className="space-y-3 text-xs">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Kata Sandi Saat Ini</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Kata Sandi Baru</label>
                  <input
                    type="password"
                    placeholder="Minimal 8 karakter"
                    className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs outline-none focus:border-primary"
                  />
                </div>
                <div className="pt-2">
                  <Button size="sm" variant="outline" className="rounded-xl text-xs">
                    Perbarui Kata Sandi
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
