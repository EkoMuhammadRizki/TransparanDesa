'use client'

import { useState, use, useMemo } from 'react'
import Link from 'next/link'
import {
  ChevronRight,
  Sparkles,
  PieChart as PieChartIcon,
  Wallet,
  TrendingUp,
  BarChart2,
  Calendar,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Building,
} from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AlokasiPieChart } from '@/components/apbdes/alokasi-pie-chart'
import { RealisasiProgressList, RealisasiItem } from '@/components/apbdes/realisasi-progress-list'
import { PencairanTimeline } from '@/components/apbdes/pencairan-timeline'
import { BudgetItemsTable } from '@/components/apbdes/budget-items-table'
import { getVillageBySlug, VILLAGES_DATABASE } from '@/lib/data/villages-store'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default function ApbdesVisualizerPage({ params }: PageProps) {
  const { slug } = use(params)
  const village = getVillageBySlug(slug)

  const availableYears = useMemo(() => {
    return Object.keys(village.years)
      .map(Number)
      .sort((a, b) => b - a)
      .map(String)
  }, [village])

  const [selectedYearStr, setSelectedYearStr] = useState<string>(String(village.currentYear || availableYears[0]))

  const selectedYear = Number(selectedYearStr)
  const currentData = village.years[selectedYear] || village.years[village.currentYear] || Object.values(village.years)[0]

  const formatMiliar = (val: number) => {
    if (val >= 1000000000) {
      return `Rp ${(val / 1000000000).toFixed(2)} Miliar`
    }
    return `Rp ${(val / 1000000).toFixed(0)} Juta`
  }

  // Format realisasi progress items
  const realisasiProgressData: RealisasiItem[] = currentData.alokasi.map((a) => {
    const matchingItems = currentData.items.filter((i) => i.kategori === a.kategori)
    const realisasiSum = matchingItems.reduce((acc, curr) => acc + (curr.nominal_realisasi || 0), 0)
    return {
      kategori: a.kategori,
      anggaran: a.nominal,
      realisasi: realisasiSum > 0 ? realisasiSum : Math.round(a.nominal * (currentData.persenRealisasi / 100)),
    }
  })

  // Format pie chart data
  const pieChartData = currentData.alokasi.map((a) => ({
    kategori: a.kategori,
    persen: a.persen,
    fill: a.color,
  }))

  const surplusDefisit = currentData.totalPendapatan - currentData.totalBelanja
  const isSurplus = surplusDefisit >= 0

  return (
    <div className="min-h-dvh bg-surface">
      <AppHeader />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 space-y-8">
        {/* Breadcrumb: Beranda > [Nama Desa] > APBDes Visualizer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground transition-colors hover:text-primary">
                  Beranda
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="size-4 text-muted-foreground/60" />
              </li>
              <li>
                <Link
                  href={`/desa/${village.slug}`}
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  {village.nama}
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="size-4 text-muted-foreground/60" />
              </li>
              <li>
                <span className="font-medium text-foreground" aria-current="page">
                  APBDes Visualizer
                </span>
              </li>
            </ol>
          </nav>

          {/* Quick Village Switcher Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <span className="text-muted-foreground font-medium mr-1">Desa:</span>
            {Object.values(VILLAGES_DATABASE).map((v) => (
              <Link
                key={v.slug}
                href={`/desa/${v.slug}/apbdes`}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  v.slug === village.slug
                    ? 'bg-primary text-white font-bold'
                    : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {v.nama}
              </Link>
            ))}
          </div>
        </div>

        {/* Page Header + Filter Tahun + AI Badge */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                APBDes Visualizer — {village.nama}
              </h1>
              {village.isRealData && (
                <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 font-medium inline-flex items-center gap-1.5 py-1">
                  <Sparkles className="size-3.5" />
                  <span>Data Riil Siskeudes ({currentData.items.length} Pos Belanja)</span>
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {village.kecamatan}, {village.kabupaten}, {village.provinsi} — Tahun Anggaran {selectedYearStr}
            </p>
          </div>

          {/* Filter Tahun Anggaran Dropdown */}
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">Tahun Anggaran:</span>
            <Select value={selectedYearStr} onValueChange={(val) => val && setSelectedYearStr(val)}>
              <SelectTrigger className="w-[130px] bg-card text-xs font-semibold rounded-xl">
                <SelectValue placeholder="Pilih Tahun" />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((t) => (
                  <SelectItem key={t} value={t} className="text-xs">
                    Tahun {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Highlight Anggaran Big Cards (Pendapatan, Belanja, Realisasi, Surplus/Defisit) */}
        <section aria-label="Ringkasan Anggaran Utama">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Pendapatan */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Pendapatan</p>
                <p className="mt-1 font-heading text-xl font-bold text-foreground sm:text-2xl">
                  {formatMiliar(currentData.totalPendapatan)}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Transfer DD, ADD &amp; PAD</p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Wallet className="size-5" />
              </div>
            </div>

            {/* Total Belanja */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Belanja Pagu</p>
                <p className="mt-1 font-heading text-xl font-bold text-foreground sm:text-2xl">
                  {formatMiliar(currentData.totalBelanja)}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Alokasi resmi {selectedYearStr}</p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-xl bg-sage/20 text-brand-green">
                <Building className="size-5" />
              </div>
            </div>

            {/* Total Realisasi & Serapan */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Serapan Realisasi</p>
                <p className="mt-1 font-heading text-xl font-bold text-primary sm:text-2xl">
                  {currentData.persenRealisasi}%
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{formatMiliar(currentData.totalRealisasi)}</p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-xl bg-lime/10 text-lime-dark">
                <TrendingUp className="size-5" />
              </div>
            </div>

            {/* Surplus / Defisit / Pembiayaan */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Surplus / Defisit</p>
                <p
                  className={`mt-1 font-heading text-xl font-bold sm:text-2xl ${
                    isSurplus ? 'text-primary' : 'text-terracotta'
                  }`}
                >
                  {isSurplus ? `+${formatMiliar(surplusDefisit)}` : formatMiliar(surplusDefisit)}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Pembiayaan SILPA: {formatMiliar(currentData.totalPembiayaan)}
                </p>
              </div>
              <div
                className={`flex size-11 items-center justify-center rounded-xl ${
                  isSurplus ? 'bg-primary/10 text-primary' : 'bg-terracotta/10 text-terracotta'
                }`}
              >
                <BarChart2 className="size-5" />
              </div>
            </div>
          </div>
        </section>

        {/* Grid 2 Kolom: Pie Chart Alokasi & Progress List Realisasi */}
        <section aria-label="Visualisasi Anggaran" className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Pie Chart Alokasi */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs lg:col-span-6 flex flex-col justify-between">
            <div>
              <h3 className="font-heading text-base font-bold text-foreground mb-1">
                Alokasi Anggaran per 6 Kategori Baku
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Proporsi belanja modal &amp; operasional dihitung dari pos belanja APBDes
              </p>
            </div>
            <AlokasiPieChart data={pieChartData} />
          </div>

          {/* Progress Realisasi */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs lg:col-span-6 flex flex-col justify-between">
            <div>
              <h3 className="font-heading text-base font-bold text-foreground mb-1">
                Progress Serapan Realisasi per Kategori
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Perbandingan target nominal anggaran terhadap pengeluaran aktual
              </p>
            </div>
            <RealisasiProgressList data={realisasiProgressData} />
          </div>
        </section>

        {/* Tabel Pos Belanja Siskeudes Riil */}
        <section aria-label="Tabel Rincian Pos Belanja">
          <BudgetItemsTable
            items={currentData.items}
            namaDesa={village.nama}
            tahun={selectedYear}
          />
        </section>

        {/* Horizontal Timeline Status Pencairan */}
        {currentData.pencairan && currentData.pencairan.length > 0 && (
          <section aria-label="Timeline Pencairan Dana">
            <PencairanTimeline tahapList={currentData.pencairan} />
          </section>
        )}

        {/* Bottom Action Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl border border-border bg-card shadow-xs">
          <div>
            <h4 className="font-bold text-sm text-foreground">Ingin membandingkan alokasi belanja ini dengan desa lain?</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Gunakan fitur Benchmark Desa untuk mendeteksi anomali anggaran secara saintifik.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/desa/${village.slug}/benchmark`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white hover:bg-primary/90 transition-all shadow-xs"
            >
              <BarChart2 className="size-4" /> Buka Benchmark &amp; Anomali <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
