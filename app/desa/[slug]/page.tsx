import Link from 'next/link'
import { ChevronRight, Wallet, PieChart, BarChart3, Megaphone, Upload, Building2, GraduationCap, Stethoscope, ShieldCheck, FileText, ArrowRight, CheckCircle2, MapPin } from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { DesaHeader } from '@/components/desa/desa-header'
import { RingkasanWarga, AlokasiRingkas } from '@/components/desa/ringkasan-warga'
import { KlarifikasiDesa } from '@/components/desa/klarifikasi-desa'
import { LaporanPublikList, type LaporanPublikItem } from '@/components/lapor/laporan-publik-list'
import { Badge } from '@/components/ui/badge'
import { getVillageBySlug, VILLAGES_DATABASE } from '@/lib/data/villages-store'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function ProfilDesaPage({ params }: PageProps) {
  const { slug } = await params
  const village = getVillageBySlug(slug)
  const currentData = village.years[village.currentYear] || Object.values(village.years)[0]

  const totalAnggaranMiliar = (currentData.totalBelanja / 1000000000).toFixed(2)
  const totalAnggaranStr = `Rp ${totalAnggaranMiliar} Miliar`

  const dataAlokasiWarga: AlokasiRingkas[] = currentData.alokasi.map((a) => ({
    kategori: a.kategori,
    nominal: a.nominal,
    persen: a.persen,
    color: a.color,
    iconType: a.iconType,
    deskripsi: a.deskripsi,
  }))

  const laporanPublik: LaporanPublikItem[] = (village.laporanPublik || []).map((lap) => ({
    id: lap.id,
    kategori: lap.kategori,
    ringkasan: lap.deskripsi,
    tanggal: lap.tanggal,
    status: lap.status === 'Selesai' || lap.status === 'Diverifikasi' ? 'verified' : 'pending',
    hasPhoto: true,
  }))

  const otherVillages = Object.values(VILLAGES_DATABASE).filter((v) => v.slug !== village.slug)

  return (
    <div className="min-h-dvh bg-surface">
      <AppHeader />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 space-y-10">
        {/* Breadcrumb & Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground transition-colors hover:text-primary">
                  Beranda
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="size-4 text-muted-foreground/60" />
              </li>
              <li>
                <span className="font-medium text-foreground" aria-current="page">
                  {village.nama}
                </span>
              </li>
            </ol>
          </nav>

          {/* Quick Village Switcher & Auditor Mode */}
          <div className="flex items-center gap-2 flex-wrap">
            {village.isRealData && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-1 text-xs font-semibold text-primary">
                <CheckCircle2 className="size-3" /> Data Riil Siskeudes ({village.dataSource})
              </span>
            )}
            <Link
              href="/auditor"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-1.5 text-xs font-bold text-muted-foreground hover:text-primary hover:border-primary/40 transition-all shadow-xs"
            >
              <BarChart3 className="size-3.5 text-primary" /> Mode Auditor &amp; Analytics <ArrowRight className="size-3" />
            </Link>
          </div>
        </div>

        {/* Quick Village Switcher Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs text-muted-foreground">
          <span className="font-medium shrink-0">Pilih Desa Data Riil:</span>
          {Object.values(VILLAGES_DATABASE).map((v) => (
            <Link
              key={v.slug}
              href={`/desa/${v.slug}`}
              className={`shrink-0 rounded-full px-3 py-1 font-medium transition-all ${
                v.slug === village.slug
                  ? 'bg-primary text-white font-bold shadow-xs'
                  : 'bg-card border border-border text-foreground hover:border-primary/40 hover:bg-secondary'
              }`}
            >
              <MapPin className="inline size-3 mr-1" />
              {v.nama} {v.isRealData ? '(Riil)' : ''}
            </Link>
          ))}
        </div>

        {/* Header Desa */}
        <DesaHeader
          nama={village.nama}
          kabupaten={village.kabupaten}
          provinsi={village.provinsi}
          penduduk={village.penduduk}
        />

        {/* Feature Navigation Cards (Visualizer, Benchmark, Lapor, Upload) */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <Link
            href={`/desa/${village.slug}/apbdes`}
            className="group rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
              <PieChart className="size-5" />
            </div>
            <h3 className="mt-3 font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
              APBDes Visualizer
            </h3>
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
              Visualisasi alokasi {currentData.items.length} pos anggaran &amp; realisasi multi-tahun.
            </p>
          </Link>

          <Link
            href={`/desa/${village.slug}/benchmark`}
            className="group rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-lime/10 text-lime-dark group-hover:scale-105 transition-transform">
              <BarChart3 className="size-5" />
            </div>
            <h3 className="mt-3 font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
              Benchmark &amp; Anomali
            </h3>
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
              Bandingkan pos belanja dengan rata-rata 75k desa via Hybrid AI Engine.
            </p>
          </Link>

          <Link
            href={`/desa/${village.slug}/lapor`}
            className="group rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-terracotta/10 text-terracotta group-hover:scale-105 transition-transform">
              <Megaphone className="size-5" />
            </div>
            <h3 className="mt-3 font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
              Laporan Partisipatif
            </h3>
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
              Laporkan anomali atau ketidaksesuaian pos anggaran dengan foto bukti.
            </p>
          </Link>

          <Link
            href={`/desa/${village.slug}/upload`}
            className="group rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-sage/20 text-brand-green group-hover:scale-105 transition-transform">
              <Upload className="size-5" />
            </div>
            <h3 className="mt-3 font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
              AI Upload &amp; Audit
            </h3>
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
              Uji coba ekstraksi PDF APBDes riil dengan Rule Engine 5-Tingkat.
            </p>
          </Link>
        </div>

        {/* SECTION 1: SIMPLIFIED CITIZEN DASHBOARD (Ringkasan Warga Desa) */}
        <section aria-label="Ringkasan Uang Desa untuk Warga">
          <RingkasanWarga
            totalAnggaran={totalAnggaranStr}
            tahun={village.currentYear}
            dataAlokasi={dataAlokasiWarga}
          />
        </section>

        {/* SECTION 2: KLARIFIKASI RESMI PERANGKAT DESA */}
        {village.klarifikasi && village.klarifikasi.length > 0 && (
          <section aria-label="Klarifikasi Resmi Perangkat Desa">
            <KlarifikasiDesa namaDesa={village.nama} dataKlarifikasi={village.klarifikasi} />
          </section>
        )}

        {/* SECTION 3: LAPORAN WARGA & CROWDSOURCED AUDIT */}
        <section aria-label="Laporan warga" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-xl font-bold tracking-tight text-foreground">
                Laporan Warga {village.nama}
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Laporan ketidaksesuaian anggaran yang telah diverifikasi oleh tim TransparanDesa.
              </p>
            </div>
            <Link
              href={`/desa/${village.slug}/lapor`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary/90 transition-colors shadow-xs"
            >
              + Buat Laporan Warga
            </Link>
          </div>

          <LaporanPublikList data={laporanPublik} namaDesa={village.nama} />
        </section>
      </main>
    </div>
  )
}
