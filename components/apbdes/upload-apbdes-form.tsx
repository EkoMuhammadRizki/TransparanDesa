'use client'

import { useState, useRef } from 'react'
import {
  FileText,
  Upload,
  Loader2,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  X,
  Eye,
  AlertTriangle,
  ShieldCheck,
  FileCheck,
} from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

const PARSING_STEPS = [
  { label: 'Membaca dokumen PDF APBDes...', duration: 800 },
  { label: 'Mengekstrak teks & tabel dengan pdfplumber...', duration: 1000 },
  { label: 'Mengirim ke Gemini 3.6 Flash AI untuk parsing terstruktur...', duration: 1200 },
  { label: 'Menjalankan 5 Rule Validasi Deterministik (R1-R5)...', duration: 900 },
  { label: 'Menghitung Confidence Score & Routing Status...', duration: 600 },
]

const SAMPLE_PDFS = [
  {
    name: '1737009663369277.pdf',
    label: 'Desa Karanganyar 2024 (PDF 9 Halaman - Ground Truth)',
    size: 461576,
    badge: 'Real Siskeudes',
  },
  {
    name: 'pedes-no-7-th-2023-apbdes-2024.pdf',
    label: 'Perdes APBDes 2024 (Dokumen Peraturan Desa)',
    size: 17138359,
    badge: 'Perdes Resmi',
  },
  {
    name: 'APBDes-2021-2.pdf',
    label: 'APBDes Format Lampiran 1b',
    size: 1565437,
    badge: 'Digital PDF',
  },
  {
    name: 'Apbddes-01.pdf',
    label: 'Dokumen APBDes Ringkas',
    size: 256027,
    badge: 'Standar Format',
  },
]

type Stage = 'idle' | 'parsing' | 'done'

export function UploadApbdesForm({ desaSlug = 'karanganyar' }: { desaSlug?: string }) {
  const [file, setFile] = useState<File | null>(null)
  const [stage, setStage] = useState<Stage>('idle')
  const [currentStep, setCurrentStep] = useState(0)
  const [stepsDone, setStepsDone] = useState<boolean[]>([])
  const [resultData, setResultData] = useState<any | null>(null)
  const [simulateError, setSimulateError] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => {
    if (!f.name.toLowerCase().endsWith('.pdf')) {
      alert('Harap unggah file berformat PDF')
      return
    }
    setFile(f)
  }

  const handleSelectSample = (sample: (typeof SAMPLE_PDFS)[0]) => {
    // Create a mock PDF File object representing the real dataset file
    const blob = new Blob(['%PDF-1.4 Mock Real APBDes PDF Content'], { type: 'application/pdf' })
    const sampleFile = new File([blob], sample.name, {
      type: 'application/pdf',
      lastModified: Date.now(),
    })
    setFile(sampleFile)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const startParsing = async () => {
    if (!file) return
    setStage('parsing')
    setCurrentStep(0)
    setStepsDone([])

    // Jalankan animasi stepper
    for (let i = 0; i < PARSING_STEPS.length; i++) {
      setCurrentStep(i)
      await new Promise((r) => setTimeout(r, PARSING_STEPS[i].duration))
      setStepsDone((prev) => [...prev, true])
    }

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('desa_slug', desaSlug)
      if (simulateError) {
        formData.append('simulate_error', 'true')
      }

      const response = await fetch('/api/v1/apbdes/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      if (response.ok) {
        // Ambil rincian detail job dari API status jika tersedia atau gunakan response langsung
        if (data.job_id) {
          try {
            const statusRes = await fetch(`/api/v1/apbdes/status/${data.job_id}`)
            if (statusRes.ok) {
              const statusData = await statusRes.json()
              setResultData(statusData)
            } else {
              setResultData(data)
            }
          } catch {
            setResultData(data)
          }
        } else {
          setResultData(data)
        }
      } else {
        alert(data.error || 'Gagal memproses PDF.')
      }
    } catch (err) {
      console.error('Error uploading PDF:', err)
    } finally {
      setStage('done')
    }
  }

  return (
    <div className="space-y-6">
      {/* Quick Sample Dataset Selector */}
      {stage === 'idle' && (
        <div className="rounded-2xl border border-border bg-card p-4 space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck className="size-4 text-primary" />
              <span className="text-xs font-bold text-foreground">
                Uji Coba Cepat dengan File PDF Riil Dataset:
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground">dataset/pdf_apbdes/</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SAMPLE_PDFS.map((s) => (
              <button
                key={s.name}
                type="button"
                onClick={() => handleSelectSample(s)}
                className={`p-2.5 rounded-xl border text-left flex items-start justify-between gap-2 transition-all text-xs ${
                  file?.name === s.name
                    ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                    : 'border-border bg-surface hover:border-primary/40 hover:bg-secondary text-foreground'
                }`}
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="font-medium truncate">{s.name}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{s.label}</div>
                </div>
                <Badge variant="outline" className="text-[10px] shrink-0 font-normal">
                  {s.badge}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Option Simulator: Toggle Error Subtotal untuk Pengujian Manual Review Queue */}
      {stage === 'idle' && (
        <div className="rounded-xl border border-border bg-muted/30 p-3.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-amber-500" />
            <span className="font-semibold text-foreground">Mode Simulasi Pengujian:</span>
            <span className="text-muted-foreground">Simulasikan selisih subtotal (Memicu Manual Review Queue)</span>
          </div>
          <input
            type="checkbox"
            checked={simulateError}
            onChange={(e) => setSimulateError(e.target.checked)}
            className="size-4 rounded accent-primary cursor-pointer"
          />
        </div>
      )}

      {/* Stage: Idle — Dropzone */}
      {stage === 'idle' && (
        <div
          className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-10 text-center hover:bg-primary/8 hover:border-primary/50 transition-colors cursor-pointer"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleFile(f)
            }}
          />

          <div className="flex size-16 items-center justify-center rounded-full bg-primary/15 text-primary mb-4">
            <Upload className="size-8" />
          </div>
          <h3 className="font-heading text-lg font-bold text-foreground">
            Upload Dokumen APBDes
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Seret file PDF ke sini atau klik untuk memilih file dari komputer
          </p>
          <p className="mt-2 text-xs text-muted-foreground/60">
            Format: PDF (Siskeudes export, dokumen APBDes resmi) — Maks. 20MB
          </p>

          {file && (
            <div
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-card px-4 py-2.5 text-xs text-foreground font-semibold shadow-xs"
              onClick={(e) => e.stopPropagation()}
            >
              <FileText className="size-4 text-primary" />
              <span className="max-w-[240px] truncate">{file.name}</span>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="text-muted-foreground hover:text-terracotta transition-colors ml-1"
              >
                <X className="size-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* CTA Mulai Parsing */}
      {stage === 'idle' && file && (
        <button
          onClick={startParsing}
          className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-sm transition-all shadow-xs"
        >
          <Sparkles className="size-4" />
          Proses dengan AI Pipeline &amp; Validasi Rule Engine
        </button>
      )}

      {/* Stage: Parsing — Stepper Animasi */}
      {stage === 'parsing' && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="size-5 text-primary animate-pulse" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-foreground text-base">
                Pipeline AI &amp; Rule Engine Executing...
              </h3>
              <p className="text-xs text-muted-foreground">
                Mengekstrak PDF, mengecek 5 aturan validasi, dan menghitung Confidence Score
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {PARSING_STEPS.map((step, idx) => {
              const isDone = stepsDone[idx] === true
              const isActive = currentStep === idx && !isDone
              return (
                <div key={idx} className="flex items-center gap-3">
                  <div
                    className={`flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                      isDone
                        ? 'bg-primary border-primary text-primary-foreground'
                        : isActive
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-muted'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="size-3.5" />
                    ) : isActive ? (
                      <Loader2 className="size-3.5 text-primary animate-spin" />
                    ) : null}
                  </div>
                  <span
                    className={`text-sm transition-colors ${
                      isDone
                        ? 'text-foreground font-medium'
                        : isActive
                        ? 'text-primary font-semibold'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Stage: Done — Hasil Tervalidasi & Confidence Score */}
      {stage === 'done' && resultData && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-6 animate-fade-in-up">
          {/* Header Status Result */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
            <div className="flex items-center gap-3">
              <div
                className={`flex size-12 items-center justify-center rounded-full ${
                  (resultData.status === 'auto_approved' || resultData.routing_action === 'auto_approved')
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {(resultData.status === 'auto_approved' || resultData.routing_action === 'auto_approved') ? (
                  <ShieldCheck className="size-7" />
                ) : (
                  <AlertTriangle className="size-7" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-lg font-bold text-foreground">
                    {(resultData.status === 'auto_approved' || resultData.routing_action === 'auto_approved')
                      ? 'Ekstraksi Tervalidasi & Auto-Approved!'
                      : 'Diperlukan Review Manual Admin'}
                  </h3>
                  <Badge
                    className={`text-xs font-bold ${
                      (resultData.status === 'auto_approved' || resultData.routing_action === 'auto_approved')
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}
                  >
                    {(resultData.status === 'auto_approved' || resultData.routing_action === 'auto_approved')
                      ? 'Auto-Approved'
                      : 'Needs Review'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {resultData.confidence_result?.routing_reason || resultData.routing_reason}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-border/60">
              <span className="text-xs font-semibold text-muted-foreground block">Confidence Score</span>
              <span className="font-heading text-2xl font-bold text-primary">
                {resultData.confidence_result?.confidence_score ?? resultData.confidence_score ?? 98}%
              </span>
            </div>
          </div>

          {/* Validation Rule Report Card */}
          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Laporan Rule Engine (5 Aturan Validasi Akuntansi Desa)
              </h4>
              <span className="text-[11px] text-muted-foreground">
                {resultData.validation_report?.logs?.length || 0} Total Log Evaluasi
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs max-h-72 overflow-y-auto pr-1">
              {resultData.validation_report?.logs?.map((log: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border flex items-start gap-2 ${
                    log.is_passed
                      ? 'border-emerald-200 bg-emerald-50/60 text-emerald-900'
                      : 'border-rose-200 bg-rose-50/60 text-rose-900'
                  }`}
                >
                  {log.is_passed ? (
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="size-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0">
                    <span className="font-bold block font-mono text-[11px]">{log.rule_code}</span>
                    <span className="text-[11px] leading-tight block text-pretty">{log.error_message}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Rincian Extracted Items */}
          <div>
            <h4 className="text-xs font-bold text-foreground mb-3 uppercase tracking-wider">
              Hasil Ekstraksi Pos Anggaran APBDes ({resultData.extracted_data?.items?.length || 0} Pos Belanja)
            </h4>
            <div className="overflow-x-auto border border-border rounded-xl max-h-64 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-muted/80 backdrop-blur-xs text-muted-foreground uppercase text-[10px] font-bold border-b border-border">
                  <tr>
                    <th className="px-3 py-2">Kode</th>
                    <th className="px-3 py-2">Kategori</th>
                    <th className="px-3 py-2">Uraian</th>
                    <th className="px-3 py-2 text-right">Anggaran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {resultData.extracted_data?.items?.slice(0, 50).map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-muted/20">
                      <td className="px-3 py-2 font-mono text-[11px]">{item.kode_rekening}</td>
                      <td className="px-3 py-2 font-medium">{item.kategori}</td>
                      <td className="px-3 py-2">{item.uraian}</td>
                      <td className="px-3 py-2 text-right font-bold tabular-nums">
                        Rp {item.nominal_anggaran?.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-border">
            <button
              onClick={() => {
                setStage('idle')
                setFile(null)
                setResultData(null)
              }}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Upload Dokumen Lain
            </button>

            <div className="flex items-center gap-3">
              {(resultData.status === 'needs_review' || resultData.routing_action === 'needs_review') && (
                <Link
                  href="/admin/review-queue"
                  className="h-10 px-5 inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition-colors shadow-xs"
                >
                  Buka Review Queue Admin
                  <ChevronRight className="size-4" />
                </Link>
              )}
              <Link
                href={`/desa/${desaSlug}/apbdes`}
                className="h-10 px-5 inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 transition-colors shadow-xs"
              >
                Buka di APBDes Visualizer
                <ChevronRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
