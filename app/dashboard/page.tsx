'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  PieChart,
  BarChart3,
  Megaphone,
  Upload,
  MapPinned,
  Wallet,
  MessageSquareText,
  TrendingUp,
  LogOut,
  Bell,
  Search,
  ChevronRight,
  Leaf,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Building,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { AppHeader } from '@/components/app-header'
import { VILLAGES_DATABASE } from '@/lib/data/villages-store'

const user = {
  nama: 'Warga Pemantau',
  email: 'pemantau@transparandesa.id',
  peran: 'Warga & Auditor Publik',
}

const stats = [
  { icon: Wallet, label: 'Total Dana Desa Nasional', value: 'Rp 71,9 T', note: 'APBN 2024 tersalur', trend: '+4,2%', tone: 'lime' },
  { icon: MapPinned, label: 'Desa Terdata dalam Sistem', value: '75.261', note: 'Dataset Kemendagri & IDM', trend: 'Lengkap', tone: 'lime' },
  { icon: MessageSquareText, label: 'Laporan Warga Terverifikasi', value: '1.428', note: 'Ditindaklanjuti Pemdes', trend: 'Transparan', tone: 'terracotta' },
]

const quickActions = [
  {
    icon: PieChart,
    title: 'APBDes Visualizer',
    description: 'Lihat rincian 104 pos belanja APBDes Karanganyar & desa lainnya dengan visualisasi interaktif.',
    href: '/desa/karanganyar/apbdes',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: BarChart3,
    title: 'BenchmarkDesa',
    description: 'Bandingkan anggaran desa vs rata-rata 75k desa via Hybrid Anomaly AI Engine.',
    href: '/desa/karanganyar/benchmark',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: Megaphone,
    title: 'Lapor Ketidaksesuaian',
    description: 'Kirimkan laporan ketidaksesuaian pos belanja APBDes dengan bukti foto dan opsi anonim.',
    href: '/desa/karanganyar/lapor',
    color: 'bg-terracotta/10 text-terracotta',
  },
  {
    icon: Upload,
    title: 'AI Upload & Audit PDF',
    description: 'Unggah file PDF APBDes riil dari Siskeudes untuk diekstrak otomatis oleh Gemini & Rule Engine.',
    href: '/desa/karanganyar/upload',
    color: 'bg-primary/10 text-primary',
  },
]

const recentActivity = [
  { icon: ShieldCheck, text: 'Ekstraksi AI APBDes Karanganyar 2024 (104 Pos Belanja) tervalidasi 98% Auto-Approved', time: '10 menit lalu', tone: 'green' },
  { icon: FileText, text: 'Data SIKD Dana Desa Bojonegoro (420 desa) & Tabanan (133 desa) telah tersinkronisasi', time: '1 jam lalu', tone: 'green' },
  { icon: Bell, text: 'Diagnosis Hybrid Engine: Alokasi Infrastruktur Karanganyar dalam batas wajar toleransi', time: '3 jam lalu', tone: 'terracotta' },
]

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const villages = Object.values(VILLAGES_DATABASE)

  const filteredVillages = searchQuery.trim()
    ? villages.filter(
        (v) =>
          v.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.kabupaten.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.provinsi.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : villages

  return (
    <div className="min-h-dvh bg-surface flex flex-col">
      {/* Dashboard Header */}
      <AppHeader />

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 space-y-8">
        {/* Welcome Banner */}
        <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-background to-background p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Leaf className="size-5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">TransparanDesa Platform</span>
            </div>
            <h1 className="font-heading text-xl font-bold text-foreground sm:text-2xl">
              Selamat datang di Dasbor TransparanDesa 👋
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Portal akuntabilitas dana desa berbasis data riil Siskeudes, SIKD Kemendagri, dan AI Extraction Pipeline.
            </p>
          </div>
          <Link
            href="/desa/karanganyar"
            className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2.5 text-sm font-bold transition-all shadow-xs"
          >
            <MapPinned className="size-4" />
            Jelajahi Desa Karanganyar (Riil)
          </Link>
        </div>

        {/* Highlight Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((item, idx) => {
            const Icon = item.icon
            return (
              <div key={idx} className="rounded-2xl border border-border bg-card p-5 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                  <p className="mt-1 font-heading text-2xl font-bold text-foreground">{item.value}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.note}</p>
                </div>
                <div className="flex size-12 items-center justify-center rounded-xl bg-secondary text-primary">
                  <Icon className="size-6" />
                </div>
              </div>
            )
          })}
        </div>

        {/* Quick Features Grid */}
        <div>
          <h2 className="font-heading text-lg font-bold text-foreground mb-4">
            Fitur Utama Platform
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action, idx) => {
              const Icon = action.icon
              return (
                <Link
                  key={idx}
                  href={action.href}
                  className="group rounded-2xl border border-border bg-card p-5 shadow-xs transition-all hover:border-primary/40 hover:shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className={`flex size-11 items-center justify-center rounded-xl ${action.color} group-hover:scale-105 transition-transform mb-4`}>
                      <Icon className="size-6" />
                    </div>
                    <h3 className="font-heading text-base font-bold text-foreground group-hover:text-primary transition-colors">
                      {action.title}
                    </h3>
                    <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                      {action.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/50 flex items-center text-xs font-semibold text-primary group-hover:translate-x-1 transition-transform">
                    Buka Fitur <ChevronRight className="size-3.5 ml-1" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Desa Data Riil Catalog Section */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Building className="size-5 text-primary" />
                <h2 className="font-heading text-lg font-bold text-foreground">
                  Katalog Desa dengan Dataset APBDes &amp; SIKD Riil
                </h2>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Pilih desa untuk melihat rincian APBDes, benchmark statistik, dan laporan publik
              </p>
            </div>

            <div className="w-full sm:w-64">
              <Input
                type="text"
                placeholder="Cari desa / kabupaten..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 rounded-xl text-xs bg-surface"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {filteredVillages.map((v) => {
              const currentYearData = v.years[v.currentYear] || Object.values(v.years)[0]
              return (
                <Link
                  key={v.slug}
                  href={`/desa/${v.slug}`}
                  className="rounded-xl border border-border bg-surface p-4 hover:border-primary/40 hover:bg-secondary/40 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                        {v.isRealData ? 'Data Riil' : 'Simulasi'}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        IDM: {v.idmStatus}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                      {v.nama}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {v.kabupaten}, {v.provinsi}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Total Pagu:</span>
                    <span className="font-bold text-foreground">
                      Rp {(currentYearData.totalBelanja / 1000000000).toFixed(2)} M
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Recent Platform Activity */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
          <h2 className="font-heading text-lg font-bold text-foreground">
            Aktivitas &amp; Log Sistem AI Terkini
          </h2>
          <div className="space-y-3">
            {recentActivity.map((act, idx) => {
              const Icon = act.icon
              return (
                <div key={idx} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-surface border border-border text-xs">
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                      <Icon className="size-4" />
                    </div>
                    <span className="font-medium text-foreground">{act.text}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground shrink-0">{act.time}</span>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
