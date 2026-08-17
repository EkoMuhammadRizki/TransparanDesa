'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, ShieldCheck, Layers, MapPin, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PopularVillages } from '@/components/popular-villages'
import { VILLAGES_DATABASE } from '@/lib/data/villages-store'

export function HeroSection() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const allVillages = Object.values(VILLAGES_DATABASE)

  const filtered = query.trim()
    ? allVillages.filter(
        (v) =>
          v.nama.toLowerCase().includes(query.toLowerCase()) ||
          v.kabupaten.toLowerCase().includes(query.toLowerCase()) ||
          v.provinsi.toLowerCase().includes(query.toLowerCase())
      )
    : []

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (filtered.length > 0) {
      router.push(`/desa/${filtered[0].slug}`)
    } else {
      router.push('/desa/karanganyar')
    }
  }

  return (
    <section className="relative overflow-hidden">
      {/* soft field-toned backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-secondary/60 via-background to-background"
      />
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 md:py-16 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Left: copy + search */}
        <div className="flex flex-col">
          <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-secondary px-3 py-1.5 text-xs font-semibold text-primary">
            <Layers className="size-3.5" aria-hidden="true" />
            Terintegrasi Siskeudes &amp; 75.261 Data Desa Indonesia
          </span>

          <h1 className="text-balance font-heading text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
            Transparansi dana &amp; data desa,{' '}
            <span className="text-primary">dalam satu portal</span>
          </h1>

          <p className="mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
            Pantau penggunaan dana desa, telusuri APBDes riil dari Siskeudes, uji model ekstraksi AI Gemini, dan awasi bersama warga dengan deteksi anomali saintifik.
          </p>

          {/* Search bar with live suggestions */}
          <div className="relative mt-7">
            <form id="cari" onSubmit={handleSearchSubmit} className="flex flex-col gap-2.5 sm:flex-row" role="search">
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <label htmlFor="village-search" className="sr-only">
                  Cari nama desa, kecamatan, atau kabupaten
                </label>
                <Input
                  id="village-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setTimeout(() => setIsFocused(false), 250)}
                  placeholder="Cari desa (misal: Karanganyar, Bojonegoro, Tabanan)…"
                  className="h-12 rounded-xl bg-card pl-11 text-base shadow-xs"
                />
              </div>
              <Button type="submit" size="lg" className="h-12 rounded-xl px-6 text-base font-semibold shadow-xs">
                <Search className="size-4" aria-hidden="true" />
                Cari Desa
              </Button>
            </form>

            {/* Live Autocomplete Dropdown */}
            {isFocused && query.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 z-30 rounded-2xl border border-border bg-card shadow-lg overflow-hidden divide-y divide-border">
                {filtered.length > 0 ? (
                  filtered.map((v) => (
                    <Link
                      key={v.slug}
                      href={`/desa/${v.slug}`}
                      className="p-3 hover:bg-secondary flex items-center justify-between transition-colors text-left group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <MapPin className="size-4" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                            {v.nama}
                            {v.isRealData && (
                              <span className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.2 rounded-md">
                                Data Riil
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {v.kecamatan}, {v.kabupaten}, {v.provinsi}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </Link>
                  ))
                ) : (
                  <div className="p-4 text-xs text-muted-foreground text-center">
                    Tidak menemukan desa &ldquo;{query}&rdquo;. Menampilkan data default Desa Karanganyar.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 text-primary" aria-hidden="true" />
            Sumber data resmi APBDes Siskeudes &amp; Data Terbuka Kemendagri
          </div>

          {/* Quick filter */}
          <div className="mt-6">
            <PopularVillages />
          </div>
        </div>

        {/* Right: illustration */}
        <div className="relative">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-surface shadow-sm">
            <Image
              src="/images/hero-desa.png"
              alt="Ilustrasi warga desa dan petani di tengah sawah dengan rumah desa dan pepohonan"
              width={720}
              height={720}
              priority
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
