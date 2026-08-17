/**
 * Script Seeder Akun Supabase Auth (Warga, BPD, Admin)
 * Jalankan: node scripts/seed-users-supabase.mjs
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey || supabaseUrl.includes('your-project')) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY belum diset')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const DEMO_USERS = [
  {
    email: 'warga@demo.id',
    password: 'demo1234',
    email_confirm: true,
    user_metadata: {
      nama: 'Budi Santoso',
      role: 'warga',
      peran: 'Warga / Pemantau Publik',
      desa: 'Desa Karanganyar',
      telepon: '+62 812-3456-7890',
    },
  },
  {
    email: 'bpd@demo.id',
    password: 'demo1234',
    email_confirm: true,
    user_metadata: {
      nama: 'Drs. H. Mulyono',
      role: 'bpd',
      peran: 'BPD & Auditor Lapangan',
      desa: 'Desa Karanganyar',
      telepon: '+62 813-9876-5432',
    },
  },
  {
    email: 'admin@demo.id',
    password: 'demo1234',
    email_confirm: true,
    user_metadata: {
      nama: 'Endang Widyastuti, S.AP',
      role: 'admin',
      peran: 'Perangkat Desa / Administrator',
      desa: 'Desa Karanganyar',
      telepon: '+62 811-2233-4455',
    },
  },
]

async function seedUsers() {
  console.log('🚀 Mendaftarkan 3 Akun Demo Resmi ke Supabase Auth:', supabaseUrl)

  for (const user of DEMO_USERS) {
    // 1. Cek apakah user sudah ada
    const { data: listData, error: listError } = await supabase.auth.admin.listUsers()
    
    const existing = (listData?.users || []).find((u) => u.email === user.email)

    if (existing) {
      console.log(`ℹ️ User ${user.email} sudah terdaftar. Mengupdate metadata...`)
      const { error: updateError } = await supabase.auth.admin.updateUserById(existing.id, {
        password: user.password,
        user_metadata: user.user_metadata,
        email_confirm: true,
      })
      if (updateError) {
        console.error(`❌ Gagal update ${user.email}:`, updateError.message)
      } else {
        console.log(`✅ User ${user.email} (${user.user_metadata.role.toUpperCase()}) berhasil diperbarui. ID: ${existing.id}`)
      }
    } else {
      const { data, error } = await supabase.auth.admin.createUser(user)
      if (error) {
        console.error(`❌ Gagal membuat user ${user.email}:`, error.message)
      } else {
        console.log(`✅ Berhasil membuat user baru ${user.email} (${user.user_metadata.role.toUpperCase()}). ID: ${data.user.id}`)
      }
    }
  }

  console.log('\n🎉 SEMUA 3 AKUN DEMO RESMI (Warga, BPD, Admin) TELAH AKTIF DI SUPABASE AUTH!')
}

seedUsers().catch(console.error)
