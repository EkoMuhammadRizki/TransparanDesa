import Link from 'next/link'
import { ChevronRight, Megaphone, ShieldAlert } from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { LaporanForm } from '@/components/lapor/laporan-form'
import { getVillageBySlug } from '@/lib/data/villages-store'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function LaporanWargaPage({ params }: PageProps) {
  const { slug } = await params
  const village = getVillageBySlug(slug)
  const currentData = village.years[village.currentYear] || Object.values(village.years)[0]

  return (
    <div className="min-h-dvh bg-surface">
      <AppHeader />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10 space-y-6">
        {/* Breadcrumb: Beranda > [Nama Desa] > Lapor Ketidaksesuaian */}
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
                Lapor Ketidaksesuaian
              </span>
            </li>
          </ol>
        </nav>

        {/* Page Title & Subtitle */}
        <div>
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-terracotta/10 text-terracotta">
              <Megaphone className="size-6" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Laporkan Ketidaksesuaian Anggaran — {village.nama}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Setiap laporan warga akan diverifikasi oleh tim TransparanDesa sebelum diteruskan ke perangkat desa dan inspektorat daerah.
              </p>
            </div>
          </div>
        </div>

        {/* Form Pelaporan Warga */}
        <section aria-label="Form Pelaporan Warga">
          <LaporanForm
            namaDesa={village.nama}
            desaSlug={village.slug}
            budgetItems={currentData.items}
          />
        </section>
      </main>
    </div>
  )
}
