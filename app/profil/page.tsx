'use client'

import { useState, useEffect } from 'react'
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
  Briefcase,
  KeyRound,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getActiveUserProfile, PRESET_USERS, UserProfile, UserRole } from '@/lib/auth/user-store'

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'identitas' | 'riwayat' | 'keamanan'>('identitas')
  const [userProfile, setUserProfile] = useState<UserProfile>(PRESET_USERS.warga)
  const [isAnonymousDefault, setIsAnonymousDefault] = useState(true)
  const [savedSuccess, setSavedSuccess] = useState(false)

  // Profile editable fields
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    telepon: '',
    desaDomisili: '',
    pekerjaan: '',
  })

  useEffect(() => {
    const profile = getActiveUserProfile()
    setUserProfile(profile)
    setFormData({
      nama: profile.nama,
      email: profile.email,
      telepon: profile.telepon,
      desaDomisili: profile.desaDomisili,
      pekerjaan: profile.jabatan,
    })
  }, [])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  const roleMeta: Record<UserRole, {
    badge: string
    badgeColor: string
    heroDesc: string
    credentialsBadge: string
    credentialsDesc: string
    quickActions: { label: string; href: string; icon: any; desc: string }[]
    historyTitle: string
    historyItems: { id: string; date: string; title: string; desc: string; status: string; statusColor: string; note: string }[]
  }> = {
    warga: {
      badge: 'Warga / Pemantau Terverifikasi',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      heroDesc: 'Akun warga desa untuk memantau alokasi APBDes, membaca infografis anggaran, dan mengirim aduan partisipatif.',
      credentialsBadge: 'KTP Digital Terverifikasi',
      credentialsDesc: 'Identitas kependudukan terenkripsi SHA-256 untuk menjamin keaslian aduan tanpa menghilangkan hak anonimitas pelapor.',
      quickActions: [
        { label: 'Pantau APBDes Desa', href: '/desa/karanganyar/apbdes', icon: Eye, desc: 'Lihat rincian 170+ pos belanja dan realisasi' },
        { label: 'Kirim Laporan Warga', href: '/desa/karanganyar/lapor', icon: AlertCircle, desc: 'Kirim laporan temuan lapangan & foto bukti' },
      ],
      historyTitle: 'Riwayat Laporan & Partisipasi Warga',
      historyItems: [
        {
          id: '#LAP-2024-001',
          date: '18 Juni 2024',
          title: 'Perbaikan Tutup Saluran Drainase RT 02 Dusun I',
          desc: 'Terdapat beberapa titik plat beton penutup drainase yang retak akibat sering dilalui armada panen.',
          status: 'Selesai',
          statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          note: 'Tanggapan Resmi: TPK telah mengganti plat beton pembesian baru pada 22 Juni 2024.',
        },
        {
          id: '#LAP-2024-002',
          date: '05 Agustus 2024',
          title: 'Jadwal Timbangan Posyandu Balita RW 03',
          desc: 'Mohon penambahan alat ukur infantometer digital agar pencatatan stunting balita lebih presisi.',
          status: 'Ditindaklanjuti',
          statusColor: 'bg-blue-100 text-blue-800 border-blue-300',
          note: 'Tanggapan Resmi: Dimasukkan ke pengadaan Tahap 2 dan didistribusikan ke Bidan Desa.',
        },
      ],
    },
    bpd: {
      badge: 'Badan Permusyawaratan Desa (BPD)',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
      heroDesc: 'Kredensial pengawasan legislatif desa sesuai UU No. 6/2014 dengan akses ke modul Anomali Hybrid & Audit.',
      credentialsBadge: 'Kredensial Resmi BPD (SK Bupati)',
      credentialsDesc: 'Otorisasi pengawasan keuangan desa dengan akses penuh ke matriks anomali Modified Z-Score dan Isolation Forest.',
      quickActions: [
        { label: 'Portal Analisis Auditor', href: '/auditor', icon: Shield, desc: 'Breakdown analitik 4-layer & monitoring multi-desa' },
        { label: 'Deteksi Anomali Hybrid', href: '/desa/karanganyar/benchmark', icon: Award, desc: 'Perbandingan statistik MAD vs 75k desa' },
      ],
      historyTitle: 'Log Aktivitas Pengawasan BPD',
      historyItems: [
        {
          id: '#AUDIT-2024-04',
          date: '15 Juli 2024',
          title: 'Verifikasi Laporan Realisasi APBDes Semester I 2024',
          desc: 'Pemeriksaan kepatuhan serapan anggaran 93.6% dan kesesuaian fisik pekerjaan rabat beton Dusun II.',
          status: 'Terverifikasi',
          statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          note: 'Hasil Pengawasan: Seluruh pos anggaran dinyatakan wajar (CAS 0.08 / Low Risk).',
        },
        {
          id: '#AUDIT-2024-02',
          date: '20 Mei 2024',
          title: 'Review Pengadaan Pupuk & Benih Jagung Poktan',
          desc: 'Audit faktur dan berita acara serah terima bantuan sarana produksi pertanian Tahap 1.',
          status: 'Selesai',
          statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          note: 'BAST Nomor 045/BAST-POKTAN/2024 telah sesuai dengan alokasi RKPDes.',
        },
      ],
    },
    admin: {
      badge: 'Administrator / Perangkat Desa',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      heroDesc: 'Kewenangan sekretariat desa untuk mengunggah dokumen Siskeudes, memvalidasi hasil AI, dan memberikan Hak Jawab resmi.',
      credentialsBadge: 'Administrator Siskeudes Terakreditasi',
      credentialsDesc: 'Otorisasi unggah berkas resmi APBDes, pengelolaan publikasi data, dan representasi resmi Pemerintah Desa.',
      quickActions: [
        { label: 'Upload PDF APBDes Siskeudes', href: '/desa/karanganyar/upload', icon: FileText, desc: 'Ekstraksi PDF otomatis & validasi Rule Engine' },
        { label: 'Antrean Review Manual Dokumen', href: '/admin/review-queue', icon: Clock, desc: 'Audit dokumen dengan skor di bawah ambang' },
      ],
      historyTitle: 'Log Publikasi Dokumen & Hak Jawab Resmi',
      historyItems: [
        {
          id: '#DOC-2024-01',
          date: '10 Maret 2024',
          title: 'Publikasi APBDes 2024 (Lampiran 1b Siskeudes 9 Halaman)',
          desc: '172 Pos Belanja berhasil diparsing dan dipublikasikan dengan Confidence Score 98%.',
          status: 'Auto-Approved',
          statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          note: 'Validasi: 5 Rule Akuntansi Desa Lulus 100% tanpa selisih matematis.',
        },
        {
          id: '#HAK-JAWAB-02',
          date: '20 Mei 2024',
          title: 'Klarifikasi Resmi Alokasi Bantuan Bibit Jagung',
          desc: 'Penjelasan transparansi penyaluran bantuan pertanian kepada 4 Kelompok Tani.',
          status: 'Terpublikasi',
          statusColor: 'bg-blue-100 text-blue-800 border-blue-300',
          note: 'Dokumen pendukung BAST telah diunggah ke portal dialog publik.',
        },
      ],
    },
  }

  const currentMeta = roleMeta[userProfile.role] || roleMeta.warga

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
          <span className="font-semibold text-foreground">Profil Akun ({userProfile.peran})</span>
        </nav>

        {/* Top Profile Header Card */}
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xs relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 h-44 w-80 bg-gradient-to-bl from-primary/10 via-accent/10 to-transparent pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="relative">
                <div className="flex size-20 sm:size-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-heading text-3xl font-bold shadow-md shadow-primary/20">
                  {userProfile.avatar || userProfile.nama[0] || 'U'}
                </div>
                <div className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs" title="Akun Terverifikasi">
                  <CheckCircle2 className="size-3.5" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
                    {userProfile.nama}
                  </h1>
                  <Badge className={`text-xs font-semibold ${currentMeta.badgeColor}`}>
                    {currentMeta.badge}
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                  <Mail className="size-3.5" />
                  {userProfile.email}
                  <span className="text-border">•</span>
                  <MapPin className="size-3.5 text-primary" />
                  {userProfile.desaDomisili}, {userProfile.kabupaten}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Jabatan: <span className="font-semibold text-foreground">{userProfile.jabatan}</span> • Terdaftar sejak {userProfile.tanggalDaftar}
                </p>
              </div>
            </div>

            {/* Quick Primary Actions for this Role */}
            <div className="flex flex-wrap sm:flex-col items-stretch gap-2 border-t sm:border-t-0 pt-4 sm:pt-0 border-border">
              {currentMeta.quickActions.map((qa, idx) => (
                <Link key={idx} href={qa.href}>
                  <Button size="sm" variant={idx === 0 ? 'default' : 'outline'} className="rounded-xl shadow-xs gap-1.5 text-xs font-semibold w-full justify-start">
                    <qa.icon className="size-3.5" />
                    {qa.label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          {/* Role Description Banner */}
          <div className="mt-6 pt-5 border-t border-border/70">
            <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5 flex items-start gap-3">
              <Shield className="size-4 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-foreground block">
                  Peran Akun Aktif: {userProfile.peran}
                </span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {currentMeta.heroDesc}
                </p>
              </div>
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
            Identitas &amp; Jabatan
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
            {currentMeta.historyTitle}
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
            Keamanan &amp; Kredensial
          </button>
        </div>

        {/* TAB 1: IDENTITAS */}
        {activeTab === 'identitas' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-xs">
              <h2 className="font-heading text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <User className="size-4 text-primary" />
                Data Profil Pengguna
              </h2>

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                {savedSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2 animate-fade-in">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                    <span>Perubahan profil berhasil disimpan!</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Nama Lengkap</label>
                    <input
                      type="text"
                      value={formData.nama}
                      onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                      className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Alamat Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Nomor Induk Kependudukan (NIK)</label>
                    <input
                      type="text"
                      disabled
                      value={userProfile.nik}
                      className="w-full h-9 rounded-xl border border-input bg-muted/60 px-3 text-xs text-muted-foreground cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Nomor WhatsApp / Kontak</label>
                    <input
                      type="text"
                      value={formData.telepon}
                      onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                      className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Desa Domisili</label>
                    <input
                      type="text"
                      value={formData.desaDomisili}
                      onChange={(e) => setFormData({ ...formData, desaDomisili: e.target.value })}
                      className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Kabupaten / Provinsi</label>
                    <input
                      type="text"
                      disabled
                      value={`${userProfile.kabupaten}, ${userProfile.provinsi}`}
                      className="w-full h-9 rounded-xl border border-input bg-muted/60 px-3 text-xs text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Jabatan / Peran Resmi</label>
                  <input
                    type="text"
                    value={formData.pekerjaan}
                    onChange={(e) => setFormData({ ...formData, pekerjaan: e.target.value })}
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
                  Status Kredensial &amp; Otoritas
                </div>
                <div className="p-3 rounded-xl bg-muted/40 border border-border text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Kredensial</span>
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="size-3" /> {currentMeta.credentialsBadge}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Tingkat Hak Akses</span>
                    <span className="font-mono text-[11px] font-bold text-foreground">{userProfile.role.toUpperCase()} LEVEL</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Database Supabase</span>
                    <span className="text-emerald-600 font-semibold">Tersinkronisasi</span>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {currentMeta.credentialsDesc}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-foreground">
                  Pintasan Cepat Sesuai Peran
                </h3>
                <div className="space-y-2 text-xs">
                  {currentMeta.quickActions.map((qa, idx) => (
                    <Link
                      key={idx}
                      href={qa.href}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-border hover:bg-muted transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <qa.icon className="size-3.5 text-primary" />
                        <div>
                          <span className="font-semibold text-foreground block group-hover:text-primary transition-colors">{qa.label}</span>
                          <span className="text-[10px] text-muted-foreground">{qa.desc}</span>
                        </div>
                      </div>
                      <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RIWAYAT AKTIVITAS */}
        {activeTab === 'riwayat' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <h2 className="font-heading text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <FileText className="size-4 text-primary" />
                {currentMeta.historyTitle}
              </h2>

              <div className="space-y-3">
                {currentMeta.historyItems.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge className={`text-[11px] ${item.statusColor}`}>
                          {item.status}
                        </Badge>
                        <span className="font-mono text-xs font-bold text-foreground">{item.id}</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground">{item.date}</span>
                    </div>

                    <h3 className="font-heading text-sm font-bold text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.desc}
                    </p>

                    <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-foreground/80 font-medium flex items-center gap-1">
                        <CheckCircle2 className="size-3.5 text-primary" />
                        {item.note}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: KEAMANAN & KREDENSIAL */}
        {activeTab === 'keamanan' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
              <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
                <Shield className="size-4 text-primary" />
                Pengaturan Privasi &amp; Notifikasi
              </h2>

              <div className="space-y-4 text-xs">
                <div className="flex items-start justify-between gap-4 p-3 rounded-xl border border-border bg-muted/20">
                  <div>
                    <span className="font-semibold text-foreground block">Mode Anonim Otomatis</span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Sembunyikan identitas nama saat mengirimkan aduan ke publik (hanya admin/BPD yang melihat token anonim).
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
                    <span className="font-semibold text-foreground block">Notifikasi Email &amp; WhatsApp</span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Kirimkan pembaruan saat terjadi perubahan status dokumen atau klarifikasi baru.
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
                <KeyRound className="size-4 text-primary" />
                Ubah Kata Sandi
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
                  <Button size="sm" variant="outline" className="rounded-xl text-xs font-semibold">
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
