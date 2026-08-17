import { NextRequest, NextResponse } from 'next/server'
import { getVillageBySlug } from '@/lib/data/villages-store'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const village = getVillageBySlug(slug)

    if (!village) {
      return NextResponse.json({ error: 'Desa tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({
      status: 'success',
      data: village,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Gagal memuat profil desa' },
      { status: 500 }
    )
  }
}
