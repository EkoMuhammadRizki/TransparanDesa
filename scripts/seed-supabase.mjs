/**
 * Script Seeder Otomatis Supabase Database
 * Jalankan: node scripts/seed-supabase.mjs
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project')) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL dan API Key belum diset di .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Baca ground truth Karanganyar 2024
const gtPath = path.resolve('dataset/ground_truth/output_karanganyar_2024.json')
const groundTruthKaranganyar = JSON.parse(fs.readFileSync(gtPath, 'utf-8'))

async function seed() {
  console.log('🚀 Memulai proses seeding ke Supabase:', supabaseUrl)

  // 1. Seed Desa Karanganyar
  const { data: vRow, error: vErr } = await supabase
    .from('villages')
    .upsert(
      {
        slug: 'karanganyar',
        nama_desa: 'Desa Karanganyar',
        kode_kemendagri: '33.13.01.2001',
        kecamatan: 'Kecamatan Karanganyar',
        kabupaten: 'Kabupaten Karanganyar',
        provinsi: 'Jawa Tengah',
        penduduk: '6.420 jiwa',
        luas_wilayah: '482,50 Ha',
        idm_score: 0.842,
        idm_status: 'Mandiri',
        karakteristik: 'Desa Pertanian & Agroindustri',
      },
      { onConflict: 'slug' }
    )
    .select()
    .single()

  if (vErr) {
    console.error('❌ Gagal insert master desa:', vErr.message)
    return
  }
  console.log('✅ Master Desa Karanganyar tersimpan. ID:', vRow.id)

  // 2. Cek apakah dokumen APBDes 2024 sudah ada
  let docRow = null
  const { data: existingDoc } = await supabase
    .from('apbdes_documents')
    .select('*')
    .eq('village_id', vRow.id)
    .eq('tahun_anggaran', 2024)
    .maybeSingle()

  if (existingDoc) {
    const { data: updatedDoc, error: uErr } = await supabase
      .from('apbdes_documents')
      .update({
        total_pendapatan: 2029831300,
        total_belanja: 2120883519,
        total_pembiayaan: 91052219,
        confidence_score: 98.0,
        ocr_quality_score: 98.0,
        status: 'AUTO_APPROVED',
      })
      .eq('id', existingDoc.id)
      .select()
      .single()

    if (uErr) {
      console.error('❌ Gagal update dokumen APBDes:', uErr.message)
      return
    }
    docRow = updatedDoc
  } else {
    const { data: newDoc, error: iErr } = await supabase
      .from('apbdes_documents')
      .insert({
        village_id: vRow.id,
        tahun_anggaran: 2024,
        total_pendapatan: 2029831300,
        total_belanja: 2120883519,
        total_pembiayaan: 91052219,
        confidence_score: 98.0,
        ocr_quality_score: 98.0,
        status: 'AUTO_APPROVED',
      })
      .select()
      .single()

    if (iErr) {
      console.error('❌ Gagal insert dokumen APBDes:', iErr.message)
      return
    }
    docRow = newDoc
  }

  console.log('✅ Header Dokumen APBDes 2024 tersimpan. ID:', docRow.id)

  // 3. Seed Batch Budget Items (170+ pos belanja Siskeudes)
  const items = groundTruthKaranganyar.extracted_data.items
    .filter((it) => (it.kode_rekening || '').startsWith('5.'))
    .map((it) => ({
      document_id: docRow.id,
      kode_rekening: it.kode_rekening || '5.1.1',
      kategori: it.kategori || 'Infrastruktur',
      uraian: it.uraian || 'Pos Belanja',
      nominal_anggaran: it.nominal_anggaran || 0,
      nominal_realisasi: it.nominal_realisasi ?? it.nominal_anggaran ?? 0,
    }))

  console.log(`📦 Menyiapkan ${items.length} pos belanja Siskeudes untuk batch insert...`)

  // Hapus item lama jika ada
  await supabase.from('budget_items').delete().eq('document_id', docRow.id)

  // Batch insert per 50 item
  for (let i = 0; i < items.length; i += 50) {
    const chunk = items.slice(i, i + 50)
    const { error: bErr } = await supabase.from('budget_items').insert(chunk)
    if (bErr) {
      console.error(`❌ Gagal insert batch ${i}:`, bErr.message)
    } else {
      console.log(`   ➜ Berhasil insert baris ${i + 1} s/d ${Math.min(i + 50, items.length)}`)
    }
  }

  // 4. Seed Desa Tambahan (Bojonegoro & Tabanan & Bekasi)
  await supabase.from('villages').upsert([
    {
      slug: 'bojonegoro-nganti',
      nama_desa: 'Desa Nganti',
      kode_kemendagri: '35.22.01.2003',
      kecamatan: 'Kecamatan Ngraho',
      kabupaten: 'Kabupaten Bojonegoro',
      provinsi: 'Jawa Timur',
      penduduk: '4.890 jiwa',
      luas_wilayah: '380,20 Ha',
      idm_score: 0.796,
      idm_status: 'Maju',
      karakteristik: 'Desa Pertanian & Lumbung Pangan',
    },
    {
      slug: 'tabanan-bajera',
      nama_desa: 'Desa Bajera',
      kode_kemendagri: '51.02.01.2001',
      kecamatan: 'Kecamatan Selemadeg',
      kabupaten: 'Kabupaten Tabanan',
      provinsi: 'Bali',
      penduduk: '3.750 jiwa',
      luas_wilayah: '295,40 Ha',
      idm_score: 0.887,
      idm_status: 'Mandiri',
      karakteristik: 'Desa Wisata & Budaya Pertanian',
    },
    {
      slug: 'bekasi-sagaramakmur',
      nama_desa: 'Desa Sagara Makmur',
      kode_kemendagri: '32.16.01.2001',
      kecamatan: 'Kecamatan Tarumajaya',
      kabupaten: 'Kabupaten Bekasi',
      provinsi: 'Jawa Barat',
      penduduk: '12.800 jiwa',
      luas_wilayah: '610,00 Ha',
      idm_score: 0.812,
      idm_status: 'Maju',
      karakteristik: 'Desa Pesisir & Sentra Perikanan',
    },
  ], { onConflict: 'slug' })

  console.log('✅ Master Desa Bojonegoro, Tabanan, & Bekasi tersimpan.')
  console.log('\n🎉 SEEDING SUPABASE SELESAI 100% SUKSES! Database Supabase Anda telah terisi data riil!')
}

seed().catch(console.error)
