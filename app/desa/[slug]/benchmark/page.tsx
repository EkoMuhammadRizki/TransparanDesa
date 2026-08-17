'use client'

import { useState, use, useMemo } from 'react'
import Link from 'next/link'
import {
  ChevronRight,
  BarChart3,
  Info,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Layers,
  MapPin,
  TrendingUp,
  Sliders,
  CheckCircle2,
} from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { BenchmarkBarChart, CategoryComparison } from '@/components/benchmark/benchmark-bar-chart'
import { BenchmarkFilter, FilterOptions } from '@/components/benchmark/benchmark-filter'
import { MetodologiModal } from '@/components/metodologi-modal'
import { runHybridAnomalyDetection, HybridAnomalyReport } from '@/lib/anomaly/hybrid-engine'
import { Badge } from '@/components/ui/badge'
import { getVillageBySlug, VILLAGES_DATABASE } from '@/lib/data/villages-store'
import { getBenchmarkForRegion } from '@/lib/data/benchmark-dataset'

const PROVINSI_LIST = ['Semua Provinsi', 'Jawa Tengah', 'Jawa Timur', 'Bali', 'Jawa Barat']
const KARAKTERISTIK_LIST = [
  'Semua Karakteristik',
  'Desa Pertanian & Agroindustri',
  'Desa Pertanian & Lumbung Pangan',
  'Desa Wisata & Budaya Pertanian',
  'Desa Pesisir & Sentra Perikanan',
  'Desa Berkembang',
]

interface PageProps {
  params: Promise<{ slug: string }>
}

export default function BenchmarkDesaPage({ params }: PageProps) {
  const { slug } = use(params)
  const village = getVillageBySlug(slug)
  const currentData = village.years[village.currentYear] || Object.values(village.years)[0]

  const [filters, setFilters] = useState<FilterOptions>({
    provinsi: village.provinsi || 'Semua Provinsi',
    karakteristik: village.karakteristik || 'Desa Pertanian & Agroindustri',
  })

  const [contextFlags, setContextFlags] = useState({
    is_disaster_declared: false,
    is_multiyear_project: true,
    has_external_grant: true,
  })

  // Ambil benchmark dataset riil berdasarkan region
  const benchmarkStats = useMemo(() => {
    return getBenchmarkForRegion(filters.provinsi)
  }, [filters.provinsi])

  // Hitung pengeluaran desa dalam Juta Rupiah per kategori
  const villageCategoryAmountsJuta = useMemo(() => {
    const res: Record<string, number> = {
      Infrastruktur: 0,
      'Operasional Pemerintah Desa': 0,
      'Pemberdayaan Masyarakat': 0,
      Kesehatan: 0,
      Pendidikan: 0,
      Lainnya: 0,
    }

    currentData.alokasi.forEach((a) => {
      if (res[a.kategori] !== undefined) {
        res[a.kategori] = Math.round(a.nominal / 1000000)
      } else {
        res['Lainnya'] += Math.round(a.nominal / 1000000)
      }
    })

    return res
  }, [currentData])

  // Jalankan Hybrid Anomaly Detection Engine
  const hybridReportInfrastruktur: HybridAnomalyReport = useMemo(() => {
    const infraJuta = villageCategoryAmountsJuta['Infrastruktur'] || 781
    const totalAnggaran = currentData.totalBelanja
    const operasional = (villageCategoryAmountsJuta['Operasional Pemerintah Desa'] || 852) * 1000000
    const kesehatan = (villageCategoryAmountsJuta['Kesehatan'] || 116) * 1000000

    return runHybridAnomalyDetection(
      'Infrastruktur',
      infraJuta,
      benchmarkStats.peersInfrastrukturJuta,
      {
        r_infra: currentData.alokasi.find((a) => a.kategori === 'Infrastruktur')?.persen
          ? currentData.alokasi.find((a) => a.kategori === 'Infrastruktur')!.persen / 100
          : 0.38,
        r_pendidikan: 0.05,
        r_kesehatan: 0.08,
        r_pemberdayaan: 0.12,
        r_operasional: 0.35,
        r_darurat: 0.02,
        per_capita: 350000,
      },
      [
        { r_infra: 0.35, r_pendidikan: 0.06, r_kesehatan: 0.08, r_pemberdayaan: 0.14, r_operasional: 0.32, r_darurat: 0.05, per_capita: 320000 },
      ],
      totalAnggaran,
      operasional,
      kesehatan,
      25000000,
      infraJuta * 1000000 * 0.9,
      contextFlags,
      3
    )
  }, [villageCategoryAmountsJuta, benchmarkStats, currentData, contextFlags])

  const comparisonData: CategoryComparison[] = useMemo(() => {
    const categories = [
      { key: 'Infrastruktur', label: 'Infrastruktur', isMain: true },
      { key: 'Operasional Pemerintah Desa', label: 'Operasional Pemdes' },
      { key: 'Pemberdayaan Masyarakat', label: 'Pemberdayaan' },
      { key: 'Kesehatan', label: 'Kesehatan' },
      { key: 'Pendidikan', label: 'Pendidikan' },
      { key: 'Lainnya', label: 'Darurat & Lainnya' },
    ]

    return categories.map((cat) => {
      const desaIni = villageCategoryAmountsJuta[cat.key] || 0
      const rataRata = (benchmarkStats.categoryAveragesJuta as any)[cat.key] || 100
      const selisihPersen = rataRata > 0 ? Number((((desaIni - rataRata) / rataRata) * 100).toFixed(1)) : 0

      const isAnomali = cat.isMain ? hybridReportInfrastruktur.risk_level !== 'LOW' : Math.abs(selisihPersen) > 40

      return {
        kategori: cat.label,
        desaIni,
        rataRata,
        selisihPersen,
        isAnomali,
        anomaliMessage: cat.isMain ? hybridReportInfrastruktur.explanation : undefined,
      }
    })
  }, [villageCategoryAmountsJuta, benchmarkStats, hybridReportInfrastruktur])

  return (
    <div className="min-h-dvh bg-surface">
      <AppHeader />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 space-y-8">
        {/* Breadcrumb */}
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
                <Link href={`/desa/${village.slug}`} className="text-muted-foreground transition-colors hover:text-primary">
                  {village.nama}
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="size-4 text-muted-foreground/60" />
              </li>
              <li>
                <span className="font-medium text-foreground" aria-current="page">
                  Benchmark &amp; Anomali
                </span>
              </li>
            </ol>
          </nav>

          {/* Quick Village Switcher */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <span className="text-muted-foreground font-medium mr-1">Desa:</span>
            {Object.values(VILLAGES_DATABASE).map((v) => (
              <Link
                key={v.slug}
                href={`/desa/${v.slug}/benchmark`}
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

        {/* Page Title & Methodology Banner */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                BenchmarkDesa &amp; Deteksi Anomali
              </h1>
              <Badge className="bg-lime/15 text-lime-dark border-lime/30 font-medium inline-flex items-center gap-1 py-1">
                <Sparkles className="size-3.5" />
                <span>Hybrid Statistical &amp; Domain Engine</span>
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Membandingkan alokasi anggaran {village.nama} ({village.kabupaten}) terhadap data agregasi {benchmarkStats.region}.
            </p>
          </div>

          <MetodologiModal />
        </div>

        {/* Filter Wilayah & Karakteristik Peer Group */}
        <BenchmarkFilter
          filters={filters}
          onFilterChange={setFilters}
          provinsiList={PROVINSI_LIST}
          karakteristikList={KARAKTERISTIK_LIST}
        />

        {/* AI Hybrid Engine Context & Risk Banner */}
        <div
          className={`rounded-2xl border p-5 shadow-xs transition-all ${
            hybridReportInfrastruktur.risk_level === 'HIGH'
              ? 'border-terracotta/40 bg-terracotta/5 text-terracotta'
              : hybridReportInfrastruktur.risk_level === 'MEDIUM'
              ? 'border-amber-500/40 bg-amber-500/5 text-amber-900 dark:text-amber-300'
              : 'border-primary/20 bg-primary/5 text-primary'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-xl bg-card p-2 shadow-xs border border-border">
                {hybridReportInfrastruktur.risk_level === 'LOW' ? (
                  <CheckCircle2 className="size-5 text-primary" />
                ) : (
                  <AlertTriangle className="size-5 text-terracotta" />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-heading font-bold text-sm text-foreground">
                    Hasil Diagnosis Hybrid AI Engine: Pos Belanja {hybridReportInfrastruktur.category_name}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      hybridReportInfrastruktur.risk_level === 'LOW'
                        ? 'bg-primary/20 text-primary'
                        : 'bg-terracotta/20 text-terracotta'
                    }`}
                  >
                    Risk Level: {hybridReportInfrastruktur.risk_level} ({hybridReportInfrastruktur.risk_label})
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    Score: {(hybridReportInfrastruktur.cas_final * 100).toFixed(1)}/100
                  </span>
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed max-w-3xl">
                  {hybridReportInfrastruktur.explanation}
                </p>
              </div>
            </div>

            {/* Context Adjustment Toggles */}
            <div className="flex items-center gap-2 shrink-0 text-xs">
              <span className="text-muted-foreground font-medium flex items-center gap-1">
                <Sliders className="size-3" /> Konteks:
              </span>
              <button
                onClick={() =>
                  setContextFlags((prev) => ({
                    ...prev,
                    is_multiyear_project: !prev.is_multiyear_project,
                  }))
                }
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors ${
                  contextFlags.is_multiyear_project
                    ? 'bg-primary text-white border-primary font-bold'
                    : 'bg-card border-border text-muted-foreground'
                }`}
              >
                Proyek Multi-Tahun
              </button>
            </div>
          </div>
        </div>

        {/* Benchmark Bar Chart Comparison */}
        <section aria-label="Grafik Perbandingan Anggaran">
          <BenchmarkBarChart
            data={comparisonData}
            namaDesa={village.nama}
          />
        </section>

        {/* Peer Sample Statistics Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
            <p className="text-xs text-muted-foreground font-medium">Ukuran Sampel Peer Group</p>
            <p className="mt-1 font-heading text-xl font-bold text-foreground">
              {benchmarkStats.sampleSize.toLocaleString('id-ID')} Desa
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Database IDM &amp; SIKD Kemendagri</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
            <p className="text-xs text-muted-foreground font-medium">Rata-rata Pagu Anggaran Wilayah</p>
            <p className="mt-1 font-heading text-xl font-bold text-foreground">
              Rp {benchmarkStats.avgTotalBudgetJuta} Juta
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Pagu belanja APBDes tahunan</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
            <p className="text-xs text-muted-foreground font-medium">Status IDM Desa Terpilih</p>
            <p className="mt-1 font-heading text-xl font-bold text-primary">
              Desa {village.idmStatus} ({village.idmScore.toFixed(3)})
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{village.karakteristik}</p>
          </div>
        </div>
      </main>
    </div>
  )
}
