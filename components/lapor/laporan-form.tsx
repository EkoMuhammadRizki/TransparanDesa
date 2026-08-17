'use client'

import React, { useState } from 'react'
import { Upload, Camera, X, CheckCircle, ShieldCheck, User, Phone, Mail, FileText, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BudgetItem } from '@/lib/data/villages-store'

export const KATEGORI_APBDES_LIST = [
  'Infrastruktur',
  'Operasional Pemerintah Desa',
  'Pemberdayaan Masyarakat',
  'Kesehatan',
  'Pendidikan',
  'Lainnya / Bencana',
]

interface LaporanFormProps {
  namaDesa?: string
  desaSlug?: string
  budgetItems?: BudgetItem[]
}

export function LaporanForm({ namaDesa = 'Desa Karanganyar', desaSlug = 'karanganyar', budgetItems = [] }: LaporanFormProps) {
  const [kategori, setKategori] = useState<string>('')
  const [posBelanja, setPosBelanja] = useState<string>('')
  const [deskripsi, setDeskripsi] = useState<string>('')
  const [files, setFiles] = useState<File[]>([])
  const [isAnonim, setIsAnonim] = useState<boolean>(true)
  const [nama, setNama] = useState<string>('')
  const [kontak, setKontak] = useState<string>('')
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)

  // Filter items matching selected category
  const filteredBudgetItems = budgetItems.filter((i) => !kategori || i.kategori === kategori)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      setFiles((prev) => [...prev, ...selectedFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!kategori || !deskripsi.trim()) {
      alert('Harap isi kategori anggaran dan deskripsi laporan!')
      return
    }
    const randomTicket = `TD-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`
    window.location.href = `/lapor/${randomTicket}`
  }

  if (isSubmitted) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 text-center shadow-xs">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
          <CheckCircle className="size-8" />
        </div>
        <h3 className="font-heading text-xl font-bold text-foreground">
          Laporan Berhasil Terkirim!
        </h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          Terima kasih telah berpartisipasi menjaga transparansi {namaDesa}. Tim verifikasi kami akan meninjau laporan ini sebelum dipublikasikan secara transparan.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button
            onClick={() => {
              setIsSubmitted(false)
              setKategori('')
              setPosBelanja('')
              setDeskripsi('')
              setFiles([])
              setIsAnonim(true)
              setNama('')
              setKontak('')
            }}
            variant="outline"
            className="h-10 px-5 text-sm rounded-xl"
          >
            Buat Laporan Lain
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-6">
      <div className="border-b border-border pb-4">
        <h3 className="font-heading text-lg font-bold text-foreground">
          Form Pengaduan Partisipatif Warga — {namaDesa}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Laporan Anda dijamin kerahasiaannya dan akan langsung terhubung ke pos belanja APBDes.
        </p>
      </div>

      {/* 1. Dropdown Kategori Anggaran */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground flex items-center justify-between">
          <span>Kategori Anggaran APBDes <span className="text-terracotta">*</span></span>
        </label>
        <Select value={kategori} onValueChange={(val) => { if (val) { setKategori(val); setPosBelanja('') } }}>
          <SelectTrigger className="w-full h-11 bg-background text-sm rounded-xl">
            <SelectValue placeholder="Pilih Kategori Anggaran" />
          </SelectTrigger>
          <SelectContent>
            {KATEGORI_APBDES_LIST.map((cat) => (
              <SelectItem key={cat} value={cat} className="text-sm">
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 2. Optional Spesifik Pos Belanja */}
      {filteredBudgetItems.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground flex items-center justify-between">
            <span>Pos Belanja Terkait <span className="text-xs font-normal text-muted-foreground">(Opsional)</span></span>
          </label>
          <Select value={posBelanja} onValueChange={(val) => val && setPosBelanja(val)}>
            <SelectTrigger className="w-full h-11 bg-background text-sm rounded-xl">
              <SelectValue placeholder="Pilih Pos Belanja Spesifik dari APBDes" />
            </SelectTrigger>
            <SelectContent>
              {filteredBudgetItems.slice(0, 30).map((item, idx) => (
                <SelectItem key={idx} value={item.uraian} className="text-xs">
                  {item.kode_rekening} — {item.uraian} (Rp {(item.nominal_anggaran / 1000000).toFixed(1)} Jt)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* 3. Textarea Deskripsi Ketidaksesuaian */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">
          Deskripsi Laporan / Temuan Lapangan <span className="text-terracotta">*</span>
        </label>
        <textarea
          rows={4}
          value={deskripsi}
          onChange={(e) => setDeskripsi(e.target.value)}
          placeholder={`Contoh: Pembangunan jalan rabat beton di Dusun II tercatat Rp 120 juta di APBDes ${namaDesa}, namun kondisi di lapangan belum ada pengerjaan dan material belum dikirim...`}
          className="w-full rounded-xl border border-input bg-background p-3.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 outline-none transition-all"
        />
      </div>

      {/* 4. Upload Foto Bukti */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">
          Bukti Foto Lapangan / Dokumen <span className="text-xs font-normal text-muted-foreground">(Maks. 5 foto)</span>
        </label>

        <div className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
            <Camera className="size-6" />
          </div>
          <p className="text-sm font-medium text-foreground">Klik atau Tarik Foto Bukti Lapangan</p>
          <p className="text-xs text-muted-foreground mt-0.5">PNG, JPG atau WEBP (Maksimal 10MB)</p>
        </div>

        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {files.map((f, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground shadow-xs"
              >
                <FileText className="size-3.5 text-primary" />
                <span className="max-w-[150px] truncate">{f.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-muted-foreground hover:text-terracotta transition-colors ml-1"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Identitas Pelapor (Anonim Switcher) */}
      <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" />
            <div>
              <span className="text-sm font-bold text-foreground block">Laporkan Sebagai Anonim</span>
              <span className="text-xs text-muted-foreground">Identitas Anda tidak akan ditampilkan ke publik.</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={isAnonim}
            onChange={(e) => setIsAnonim(e.target.checked)}
            className="size-5 rounded accent-primary cursor-pointer"
          />
        </div>

        {!isAnonim && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Nama Lengkap</label>
              <Input
                type="text"
                placeholder="Nama Anda"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="h-10 rounded-xl text-xs bg-background"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Nomor WhatsApp / Kontak</label>
              <Input
                type="text"
                placeholder="0812xxxxxxx"
                value={kontak}
                onChange={(e) => setKontak(e.target.value)}
                className="h-10 rounded-xl text-xs bg-background"
              />
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        className="w-full h-12 rounded-xl text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs"
      >
        Kirim Laporan Pengaduan Warga
      </Button>
    </form>
  )
}
