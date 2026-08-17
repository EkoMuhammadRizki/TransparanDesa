# 📋 Panduan Integrasi & Roadmap Pengembangan Web TransparanDesa
> **Untuk: Fullstack Web Developer**  
> **Dari: AI & Dataset Engineer**  
> **Status Backend AI: Ready & Tested (FastAPI + Google Gemini Flash + Rule Engine 5-Tingkat)**

---

## 📌 Ringkasan Status Saat Ini
Modul AI Pipeline untuk parsing dan validasi PDF APBDes telah selesai dibangun secara modular di direktori `pipeline/`. Modul ini siap dihubungkan ke Frontend Next.js melalui REST API FastAPI yang menyala di `http://localhost:8000`.

---

## 🛠️ TAHAP 1: Setup Lingkungan Lokal (Prerequisites)

### 1. Menjalankan Backend AI (FastAPI)
```bash
# Pastikan sudah berada di root repository
pip install -r requirements.txt

# Pastikan file .env sudah memiliki GEMINI_API_KEY
# Jalankan service FastAPI di port 8000
uvicorn pipeline.api:app --host 0.0.0.0 --port 8000 --reload
```
> *Verifikasi: Buka browser di `http://localhost:8000/docs` untuk melihat Swagger UI interaktif.*

### 2. Menjalankan Frontend Web (Next.js)
```bash
npm install
npm run dev
```
> *Frontend berjalan di `http://localhost:3000`.*

---

## 🗄️ TAHAP 2: Skema Database (Supabase / PostgreSQL)

Buat tabel-tabel berikut di database untuk menampung hasil ekstraksi AI dan interaksi warga:

```sql
-- 1. Master Data Desa
CREATE TABLE villages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_kemendagri VARCHAR(50) UNIQUE,
    nama_desa VARCHAR(100) NOT NULL,
    kecamatan VARCHAR(100),
    kabupaten VARCHAR(100),
    provinsi VARCHAR(100),
    idm_score FLOAT,
    idm_status VARCHAR(50), -- Mandiri / Maju / Berkembang / Tertinggal
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Header Dokumen APBDes
CREATE TABLE apbdes_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    village_id UUID REFERENCES villages(id) ON DELETE CASCADE,
    tahun_anggaran INT NOT NULL,
    file_url TEXT NOT NULL, -- URL di Supabase Storage
    total_pendapatan BIGINT NOT NULL,
    total_belanja BIGINT NOT NULL,
    total_pembiayaan BIGINT DEFAULT 0,
    confidence_score FLOAT NOT NULL, -- Skor 0 - 100
    ocr_quality_score FLOAT NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING_REVIEW', -- AUTO_APPROVED / NEEDS_REVIEW / REJECTED / PUBLISHED
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Rincian Pos Anggaran (Hasil Ekstraksi AI)
CREATE TABLE budget_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES apbdes_documents(id) ON DELETE CASCADE,
    kode_rekening VARCHAR(50),
    kategori VARCHAR(100) NOT NULL, -- Infrastruktur / Pendidikan / Kesehatan / Pemberdayaan Masyarakat / Operasional Pemerintah Desa / Lainnya
    uraian TEXT NOT NULL,
    nominal_anggaran BIGINT NOT NULL,
    nominal_realisasi BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Log Audit Validasi Rule Engine
CREATE TABLE validation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES apbdes_documents(id) ON DELETE CASCADE,
    rule_code VARCHAR(50) NOT NULL, -- R1_FORMAT / R2_SUBTOTAL / R3_NEGATIVE / R4_DUPLICATE / R5_MISSING
    is_passed BOOLEAN NOT NULL,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Laporan / Aduan Warga
CREATE TABLE citizen_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_item_id UUID REFERENCES budget_items(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id), -- Nullable jika pelapor anonim
    kategori_laporan VARCHAR(100) NOT NULL, -- e.g. Proyek Fiktif, Mark-up Anggaran, Mangkrak
    deskripsi TEXT NOT NULL,
    foto_bukti_url TEXT,
    status VARCHAR(50) DEFAULT 'MENUNGGU_VERIFIKASI', -- MENUNGGU_VERIFIKASI / DIPROSES / DITOLAK / SELESAI
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🔌 TAHAP 3: Integrasi API Upload & Parsing di Next.js

Hubungkan route handler upload di Next.js (`app/api/v1/apbdes/upload/route.ts`) ke endpoint FastAPI `POST http://localhost:8000/extract`:

```typescript
// app/api/v1/apbdes/upload/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "File PDF wajib diunggah" }, { status: 400 });
    }

    // 1. Kirim file PDF ke FastAPI Microservice
    const fastApiFormData = new FormData();
    fastApiFormData.append("file", file);

    const fastApiUrl = process.env.AI_PIPELINE_URL || "http://localhost:8000";
    const aiResponse = await fetch(`${fastApiUrl}/extract`, {
      method: "POST",
      body: fastApiFormData,
    });

    if (!aiResponse.ok) {
      const errorData = await aiResponse.json();
      return NextResponse.json({ error: errorData.detail }, { status: aiResponse.status });
    }

    const extractionResult = await aiResponse.json();
    /*
      Struktur Response dari FastAPI:
      {
        file_name: string,
        page_count: number,
        extracted_data: {
          nama_desa: string,
          tahun_anggaran: number,
          total_pendapatan: number,
          total_belanja: number,
          total_pembiayaan: number,
          items: Array<{ kode_rekening, kategori, uraian, nominal_anggaran, nominal_realisasi }>
        },
        validation_report: {
          is_valid: boolean,
          hard_violation_count: number,
          calculated_total_belanja: number,
          subtotal_difference: number,
          logs: Array<{ rule_code, is_passed, error_message }>
        },
        confidence_result: {
          confidence_score: number, // e.g. 98
          action: 'auto_approved' | 'needs_review' | 'rejected',
          routing_reason: string
        }
      }
    */

    // 2. TODO: Simpan file ke Supabase Storage (bucket: apbdes-raw-pdfs)
    // 3. TODO: Simpan header ke tabel apbdes_documents
    // 4. TODO: Batch insert items ke tabel budget_items
    // 5. TODO: Simpan log ke tabel validation_logs

    return NextResponse.json({
      success: true,
      data: extractionResult,
      action: extractionResult.confidence_result.action
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
```

---

## 🎨 TAHAP 4: Halaman & Komponen Frontend (UI/UX)

1. **Halaman Upload PDF (`/upload` atau `/admin/upload`)**:
   - Area Drag-and-Drop file PDF.
   - Stepper animasi saat proses berjalan (*"Ekstraksi teks..."* ➔ *"Analisis Gemini..."* ➔ *"Validasi Rule Engine..."*).
   - Tinjauan pratinjau hasil parsing sebelum disimpan ke database publik.

2. **Dashboard Publik APBDes (`/` atau `/desa/[id]`)**:
   - **Kartu Metrik Utama**: Total Pendapatan, Total Belanja, Surplus/Defisit.
   - **Diagram Alokasi Anggaran**: Visualisasi donat/bar untuk 6 kategori belanja baku (Infrastruktur, Pendidikan, Kesehatan, dll).
   - **Tabel Rincian Anggaran**: Dilengkapi fitur pencarian pos belanja, filter kategori, dan sortir nominal.
   - **Badge Transparansi**: Menampilkan status verifikasi dan Confidence Score (misal: *"Terverifikasi Otomatis 98%"*).

3. **Portal Verifikasi Admin (`/admin/review/[documentId]`)**:
   - Khusus menangani dokumen dengan status `NEEDS_REVIEW` (Confidence Score < 85%).
   - Tampilan Split-View (kiri: PDF preview, kanan: form data yang bisa diedit/dikoreksi oleh admin).
   - Aksi: Tombol **"Setujui & Publikasikan"** atau **"Tolak Dokumen"**.

4. **Fitur Pelaporan Partisipatif Warga (`/lapor` atau Tombol di Tiap Baris Pos Anggaran)**:
   - Form pelaporan dugaan anomali di lapangan untuk pos belanja tertentu.
   - Fitur upload foto bukti lapangan dari warga.

---

## 🔒 TAHAP 5: Autentikasi & Otorisasi (RBAC)

- **Warga Umum**: Akses baca data publik desa yang berstatus `AUTO_APPROVED` / `PUBLISHED`, serta hak kirim laporan aduan.
- **Admin Desa**: Hak upload PDF APBDes desa miliknya dan melihat status pemrosesan.
- **Auditor / Inspektorat Daerah**: Hak akses peninjauan (*moderation/review*), persetujuan manual, dan penanganan laporan warga.

---

## 🚀 TAHAP 6: Checklist Deployment

- **Backend AI (Python FastAPI)**: Deploy ke **Railway**, **Render**, atau **Fly.io** (set environment variable `GEMINI_API_KEY`).
- **Frontend (Next.js)**: Deploy ke **Vercel** (set environment variable `AI_PIPELINE_URL` mengarah ke URL FastAPI).

---
*Dokumentasi detail spesifikasi format JSON juga dapat dibaca di: `pipeline/README.md`.*
