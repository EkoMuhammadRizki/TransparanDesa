import { NextRequest, NextResponse } from 'next/server'
import { getAllVillagesList, VILLAGES_DATABASE } from '@/lib/data/villages-store'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get('q') || '').toLowerCase().trim()

  const allVillages = Object.values(VILLAGES_DATABASE).map((v) => ({
    slug: v.slug,
    nama: v.nama,
    kecamatan: v.kecamatan,
    kabupaten: v.kabupaten,
    provinsi: v.provinsi,
    kodeKemendagri: v.kodeKemendagri,
    penduduk: v.penduduk,
    idmScore: v.idmScore,
    idmStatus: v.idmStatus,
    karakteristik: v.karakteristik,
    isRealData: v.isRealData,
    dataSource: v.dataSource,
    currentYear: v.currentYear,
    totalBelanja: v.years[v.currentYear]?.totalBelanja || 0,
    totalBelanjaFormatted: `Rp ${( (v.years[v.currentYear]?.totalBelanja || 0) / 1000000000).toFixed(2)} Miliar`,
  }))

  if (!q) {
    return NextResponse.json({
      status: 'success',
      count: allVillages.length,
      data: allVillages,
    })
  }

  const filtered = allVillages.filter(
    (v) =>
      v.nama.toLowerCase().includes(q) ||
      v.kabupaten.toLowerCase().includes(q) ||
      v.kecamatan.toLowerCase().includes(q) ||
      v.provinsi.toLowerCase().includes(q)
  )

  return NextResponse.json({
    status: 'success',
    count: filtered.length,
    data: filtered,
  })
}
