import Link from 'next/link'
import { ChevronRight, Upload, Sparkles, FileText, CheckCircle2 } from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { UploadApbdesForm } from '@/components/apbdes/upload-apbdes-form'
import { getVillageBySlug } from '@/lib/data/villages-store'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function UploadApbdesPage({ params }: PageProps) {
  const { slug } = await params
  const village = getVillageBySlug(slug)

  return (
    <div className="min-h-dvh bg-surface">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10 space-y-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm">
            <li>
              <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                Beranda
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="size-4 text-muted-foreground/60" />
            </li>
            <li>
              <Link href={`/desa/${village.slug}`} className="text-muted-foreground hover:text-primary transition-colors">
                {village.nama}
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="size-4 text-muted-foreground/60" />
            </li>
            <li>
              <span className="font-medium text-foreground" aria-current="page">
                Upload &amp; AI Extraction Hub
              </span>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div>
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Upload className="size-6" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Upload &amp; AI Extraction APBDes — {village.nama}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                AI Pipeline mengekstrak seluruh pos belanja PDF, memvalidasi dengan 5 Rule Engine, dan menghitung Confidence Score.
              </p>
            </div>
          </div>
        </div>

        {/* Info Pipeline */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
          <Sparkles className="size-5 text-primary shrink-0 mt-0.5" />
          <div className="text-xs text-foreground space-y-1">
            <p className="font-semibold text-sm">Alur AI Pipeline TransparanDesa (FastAPI + Gemini + Rule Engine)</p>
            <p className="text-muted-foreground leading-relaxed">
              PDF APBDes → <span className="font-medium text-foreground">pdfplumber text/table extractor</span> → 
              <span className="font-medium text-foreground"> Google Gemini 3.6 Flash</span> parsing JSON schema → 
              <span className="font-medium text-foreground"> 5-Tingkat Rule Engine Audit</span> (Format, Subtotal, Non-negatif, Duplikasi, 6 Kategori Baku) → 
              <span className="font-medium text-foreground"> Confidence Scorer &amp; Routing</span> (Auto Approved / Needs Review).
            </p>
          </div>
        </div>

        {/* Form Upload */}
        <UploadApbdesForm desaSlug={village.slug} />
      </main>
    </div>
  )
}
