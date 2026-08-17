'use client'

import { useState, useMemo } from 'react'
import { Search, Filter, ArrowUpDown, ChevronDown, ChevronUp, CheckCircle, AlertCircle, FileSpreadsheet } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { BudgetItem } from '@/lib/data/villages-store'

interface BudgetItemsTableProps {
  items: BudgetItem[]
  namaDesa: string
  tahun: number
}

const CATEGORY_COLORS: Record<string, string> = {
  Infrastruktur: 'bg-primary/10 text-primary border-primary/20',
  'Operasional Pemerintah Desa': 'bg-sage/30 text-brand-green border-sage/40',
  'Pemberdayaan Masyarakat': 'bg-terracotta/10 text-terracotta border-terracotta/20',
  Kesehatan: 'bg-lime/20 text-lime-dark border-lime/30',
  Pendidikan: 'bg-emerald-600/10 text-emerald-700 border-emerald-600/20',
  Lainnya: 'bg-muted text-muted-foreground border-border',
}

export function BudgetItemsTable({ items, namaDesa, tahun }: BudgetItemsTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua')
  const [sortField, setSortField] = useState<'nominal_anggaran' | 'nominal_realisasi' | 'kode_rekening'>('nominal_anggaran')
  const [sortAsc, setSortAsc] = useState(false)

  // Unique categories list
  const categories = useMemo(() => {
    const set = new Set<string>()
    items.forEach((i) => set.add(i.kategori))
    return ['Semua', ...Array.from(set)]
  }, [items])

  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        const matchesCat = selectedCategory === 'Semua' || item.kategori === selectedCategory
        const matchesSearch =
          item.uraian.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.kode_rekening.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.kategori.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesCat && matchesSearch
      })
      .sort((a, b) => {
        const valA = a[sortField]
        const valB = b[sortField]
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortAsc ? valA - valB : valB - valA
        }
        return sortAsc
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA))
      })
  }, [items, searchTerm, selectedCategory, sortField, sortAsc])

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num)
  }

  const handleSort = (field: 'nominal_anggaran' | 'nominal_realisasi' | 'kode_rekening') => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(false)
    }
  }

  const totalFilteredAnggaran = useMemo(() => {
    return filteredItems.reduce((acc, curr) => acc + curr.nominal_anggaran, 0)
  }, [filteredItems])

  return (
    <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
      {/* Table Header & Controls */}
      <div className="p-5 border-b border-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="size-5 text-primary" />
              <h3 className="font-heading text-lg font-bold text-foreground">
                Rincian Pos Belanja APBDes {namaDesa}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Menampilkan {filteredItems.length} dari {items.length} pos anggaran resmi Siskeudes
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">Subtotal Filter:</span>
            <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
              {formatRupiah(totalFilteredAnggaran)}
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari uraian pos belanja (misal: siltap, jalan, posyandu, bibit)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 text-xs rounded-xl bg-surface"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-xl font-medium shrink-0 transition-all ${
                  selectedCategory === cat
                    ? 'bg-primary text-white font-bold shadow-xs'
                    : 'bg-surface border border-border text-muted-foreground hover:text-foreground hover:border-primary/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-secondary/80 backdrop-blur-md text-muted-foreground border-b border-border z-10">
            <tr>
              <th
                onClick={() => handleSort('kode_rekening')}
                className="py-3 px-4 font-semibold cursor-pointer hover:text-foreground transition-colors w-28"
              >
                <div className="flex items-center gap-1">
                  Kode Akun
                  <ArrowUpDown className="size-3" />
                </div>
              </th>
              <th className="py-3 px-4 font-semibold">Kategori Baku</th>
              <th className="py-3 px-4 font-semibold min-w-[240px]">Uraian Kegiatan / Pos Belanja</th>
              <th
                onClick={() => handleSort('nominal_anggaran')}
                className="py-3 px-4 font-semibold text-right cursor-pointer hover:text-foreground transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  Pagu Anggaran
                  <ArrowUpDown className="size-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('nominal_realisasi')}
                className="py-3 px-4 font-semibold text-right cursor-pointer hover:text-foreground transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  Realisasi
                  <ArrowUpDown className="size-3" />
                </div>
              </th>
              <th className="py-3 px-4 font-semibold text-center w-24">Serapan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted-foreground">
                  Tidak ditemukan pos belanja yang sesuai dengan kriteria pencarian.
                </td>
              </tr>
            ) : (
              filteredItems.map((item, idx) => {
                const percent =
                  item.nominal_anggaran > 0
                    ? Math.min(100, Math.round((item.nominal_realisasi / item.nominal_anggaran) * 100))
                    : 100
                const catBadgeClass = CATEGORY_COLORS[item.kategori] || CATEGORY_COLORS['Lainnya']

                return (
                  <tr key={`${item.kode_rekening}-${idx}`} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-muted-foreground">
                      {item.kode_rekening}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold border ${catBadgeClass}`}>
                        {item.kategori}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-foreground">
                      {item.uraian}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-foreground">
                      {formatRupiah(item.nominal_anggaran)}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-muted-foreground">
                      {formatRupiah(item.nominal_realisasi)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          percent >= 90
                            ? 'bg-primary/10 text-primary'
                            : percent >= 60
                            ? 'bg-lime/20 text-lime-dark'
                            : 'bg-terracotta/10 text-terracotta'
                        }`}
                      >
                        {percent}%
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
