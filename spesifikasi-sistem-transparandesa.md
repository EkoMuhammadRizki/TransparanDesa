# Spesifikasi Sistem TransparanDesa

> Platform Transparansi Dana Desa Berbasis AI Document Parsing dan Deteksi Anomali Anggaran
> Dokumen ini adalah breakdown teknis rinci untuk kebutuhan implementasi sistem (dashboard, pipeline AI, rule engine, database, dsb).

---

## 1. Ringkasan Sistem

TransparanDesa mengubah dokumen APBDes (PDF hasil ekspor Siskeudes) menjadi visualisasi anggaran interaktif, membandingkan alokasi anggaran suatu desa terhadap kelompok desa sejenis untuk mendeteksi anomali, dan membuka kanal pelaporan warga berbasis bukti dengan mekanisme hak jawab dari pemerintah desa.

**Aktor sistem:**
| Peran | Akses |
|---|---|
| Warga/Pengunjung (tanpa login) | Lihat visualisasi APBDes semua desa |
| Warga Terverifikasi (login) | + Upload dokumen APBDes, kirim laporan ketidaksesuaian |
| BPD / Pemerintah Desa | + BenchmarkDesa, Hak Jawab atas laporan warga |
| Jurnalis / LSM / Peneliti Kebijakan | + Telusur & ekspor data agregat lintas desa |
| Administrator / Verifikator | + Moderasi laporan warga, review manual hasil ekstraksi AI, kelola integritas data |

---

## 2. Arsitektur Sistem (Three-Tier)

- **Presentasi**: Next.js 14 (App Router), Tailwind CSS, Recharts (chart), React-PDF viewer (preview dokumen sumber)
- **Logika/Aplikasi**:
  - Next.js API Routes → autentikasi & logika aplikasi utama
  - Layanan Python terpisah (FastAPI) → khusus pemrosesan dokumen PDF & pemanggilan LLM
- **Data**: PostgreSQL via Supabase (native Row-Level Security untuk isolasi data antar desa)

**Alur data end-to-end:**
```
Upload PDF APBDes
  → Ekstraksi teks & tabel (pdfplumber)
  → Parsing terstruktur via LLM (Gemini API)
  → Rule-Based Cross-Check / Guardrails (validasi matematis)
  → [Auto-Approved] atau [Antrean Review Manual]
  → Simpan ke database (PostgreSQL/Supabase)
  → Tampil sebagai visualisasi interaktif publik
  → Diproses modul analisis statistik (BenchmarkDesa) untuk pembandingan antar desa
```

---

## 3. Modul 1 — Landing Page & Akses Publik

**Tujuan:** Public-First Approach — data anggaran bisa diakses tanpa hambatan registrasi.

**Komponen:**
- Hero section: headline masalah ("Rp 71,9 T Dana Desa mengalir ke 74.961 desa tapi 73% warga tidak tahu ke mana uang itu pergi")
- Dua CTA utama: "Mulai Pantau Desa Anda" (search desa langsung) dan "Masuk ke Dashboard" (login)
- Search bar cepat untuk mencari nama desa/kode wilayah
- Navbar: Fitur, Data Nasional, Integrasi, tombol "Lapor Sekarang"
- Badge kredibilitas (mis. "GEMASTIK 2026")
- Footer info: "Gratis digunakan warga, data anggaran adalah hak publik"

---

## 4. Modul 2 — Dashboard Utama

**Komponen:**
- **Stat Card Nasional** (3 kartu):
  1. Total Dana Desa (mis. Rp 71,9 T) + indikator tren tahun ini
  2. Desa Terdaftar (mis. 74.961) + indikator pertumbuhan
  3. Laporan Warga Aktif (mis. 12.408) + label "Perlu perhatian" jika ada backlog
- **Grid Fitur Utama** (4 card navigasi):
  1. APBDes Visualizer — "Lihat rincian alokasi & realisasi APBDes per kategori, lengkap dengan timeline pencairan dana"
  2. BenchmarkDesa — "Bandingkan anggaran desa vs rata-rata desa serupa, termasuk deteksi anomali"
  3. Lapor Ketidaksesuaian — "Kirimkan laporan bila ada ketidaksesuaian penggunaan dana desa di lingkungan Anda"
  4. Upload APBDes — "Unggah dokumen PDF APBDes → AI akan mengekstrak data anggaran secara otomatis"
- **Feed Aktivitas Terbaru** (real-time/log terbaru):
  - Format: [icon status] [deskripsi aktivitas] — [timestamp relatif]
  - Contoh entri: laporan warga diverifikasi, dokumen APBDes berhasil diekstrak AI, anomali alokasi terdeteksi
- Search/navigation hub ke halaman Profil Desa tertentu

---

## 5. Modul 3 — APBDes Visualizer

**Filter:** dropdown Tahun (2024 / 2025 / 2026)

**Komponen:**
- Card ringkasan (3 angka besar):
  - Total Anggaran Tahun berjalan
  - Total Realisasi
  - Persentase Serapan (realisasi/anggaran × 100%)
- **Pie/Donut Chart — Alokasi Anggaran per Kategori** (6 kategori baku):
  1. Infrastruktur
  2. Pendidikan
  3. Kesehatan
  4. Pemberdayaan Masyarakat
  5. Operasional Pemerintah Desa
  6. Lainnya
  - Tiap kategori: persentase + nominal
- **Progress Bar — Realisasi per Kategori**:
  - Per kategori tampilkan: nominal realisasi vs nominal anggaran, persentase progress bar
- **Timeline & Status Pencairan Dana**:
  - Tahap 1 / Tahap 2 / Tahap 3, masing-masing dengan status (Cair / Belum Cair), nominal per tahap, tanggal pencairan
  - Visual berupa stepper horizontal

---

## 6. Modul 4 — BenchmarkDesa (Hybrid 4-Layer Anomaly Detection Engine)

### 6.1 Filter & Kontrol
- Filter Provinsi (dropdown, default "Semua Provinsi")
- Filter Klasifikasi Desa (Desa Wisata/Mandiri, Agraris, Pesisir, dst.)
- **Simulasi Contextual Adjustment Filter** (checkbox, "Penyaring Kondisi Khusus Desa"):
  - Status Tanggap Bencana Alam
  - Pembangunan Fisik Multi-Tahun
  - Dana Bantuan Khusus Provinsi/Kabupaten

### 6.2 Visualisasi Utama
- Bar chart perbandingan: **Desa Target** vs **Rata-rata Desa Serupa** per kategori (Infrastruktur, Pemberdayaan, Pemerintahan, Pembinaan, Bencana/Darurat, dst.)
- Card "Hasil Analisis Hybrid" per kategori berisi:
  - Nominal alokasi + posisi dalam proporsi wajar kelompok (mis. median)
  - Badge status: **Anggaran Wajar** (hijau) / **Perlu Ditinjau** (kuning) / **Perlu Klarifikasi** (merah)
  - Ringkasan konteks (mis. "Konteks Khusus Terdeteksi: Pembangunan Fisik Multi-Tahun, Bantuan Keuangan Khusus Provinsi/Kabupaten — Skor anomali disesuaikan -60%")

### 6.3 Rincian 4 Layer Anomaly Engine

**Layer 1 — Robust MAD Stat (Modified Z-Score)**
- Tahan terhadap outlier, dihitung per kategori:
```
Z = (X − μ_kelompok) / σ_kelompok
```
- `X` = nilai alokasi desa target, `μ_kelompok` & `σ_kelompok` dihitung dari kelompok desa sejenis (peer group)
- Output contoh: "Mod-Z: 0.61", "Median: Rp 675 Jt"

**Layer 2 — Isolation Forest ML**
- Algoritma unsupervised multivariat untuk mendeteksi kombinasi pola alokasi yang tidak wajar (bukan per-kategori tunggal, tapi kombinasi seluruh kategori sekaligus)
- Output contoh: "Skor ML: 0.33", "Kombinasi proporsi anggaran sewajar"

**Layer 3 — Permendagri Rules Engine**
- Aturan deterministik: cek ambang batas (ceiling) sesuai regulasi Permendagri No. 20/2018 (mis. batas maksimal persentase operasional pemerintah desa terhadap total anggaran)
- Output contoh: "Skor Permendagri: 0", "Tidak ada pelanggaran"

**Layer 4 — Historical YoY Pattern Analysis**
- Bandingkan alokasi tahun ini vs tahun-tahun sebelumnya untuk desa yang sama, deteksi lonjakan/penurunan ekstrem
- Output contoh: "YoY Change: +100%", "Penurunan anggaran drastis sebesar -100.0% dibandingkan tahun sebelumnya"

### 6.4 Contextual Adjustment Filter (Penyaring Kondisi Khusus)
- Fitur otomatis untuk menyaring false positive akibat kondisi sah:
  - Status Tanggap Bencana Alam
  - Pembangunan Fisik Multi-Tahun
  - Dana Bantuan Khusus Pemerintah
- Ketika kondisi ini aktif untuk suatu desa, skor anomali dari 4 layer di atas dikurangi/disesuaikan (bukan dihapus total) agar tidak mencemarkan nama baik perangkat desa

### 6.5 Composite Anomaly Score (CAS)
- Menggabungkan skor dari 4 layer menjadi 1 skor akhir
- Diklasifikasikan ke 3 label netral (bukan tuduhan hukum):
  - **Anggaran Wajar**
  - **Perlu Ditinjau**
  - **Perlu Klarifikasi**
- Sertakan link/expand panel "Metodologi & Transparansi Algoritma" yang menjelaskan cara kerja sistem ke publik (agar tidak jadi black-box)

> **Catatan implementasi penting:** hasil deteksi anomali WAJIB diberi label "indikatif, bukan kesimpulan hukum" di UI — bukan tuduhan korupsi, hanya sinyal awal untuk tindak lanjut oleh Inspektorat/BPK/KPK.

---

## 7. Modul 5 — LaporanWarga (Lapor Ketidaksesuaian)

### 7.1 Form Pelaporan
Field:
- Kategori Anggaran APBDes (dropdown, terhubung ke pos anggaran desa terkait)
- Deskripsi Ketidaksesuaian (textarea, dengan placeholder contoh: "Anggaran perbaikan jalan desa Rp 120 juta sudah dicairkan di Tahap 1, namun kondisi fisik jalan Dusun 3 masih berlubang dan belum ada pengerjaan...")
- Upload Bukti Foto/Dokumen (drag & drop, format PNG/JPG/PDF, maks ukuran file)
- Toggle "Kirim sebagai Anonim" (proteksi identitas pelapor)
- Tombol "Kirim Laporan"

### 7.2 Sistem Tiket & Alur Status
- Setiap laporan otomatis dapat **Nomor Tiket** unik (format: `#TD-[TAHUN]-[NOMOR]`, mis. `#TD-2026-00647`)
- Timeline/riwayat dialog per tiket (log kronologis, tiap entri ada aktor & timestamp):
  1. Laporan Kepedulian Warga Dikirim (dilengkapi foto bukti) — pelapor warga
  2. Lolos Moderasi Awal & Notifikasi Diteruskan ke Pemdes — moderator platform
  3. Tanggapan Resmi & Dokumen Bukti Pemdes Diterbitkan — sekretaris/perangkat desa
  4. Status Tiket Diperbarui: Terverifikasi & Selesai — sistem
- Status badge: **Terverifikasi Publik**, **Menunggu Tindak Lanjut**, dsb.

### 7.3 Fitur Hak Jawab (Counter-Claim) Desa
- Panel khusus untuk akun peran BPD/Pemerintah Desa untuk menjawab resmi laporan yang masuk terhadap desanya
- Bisa melampirkan dokumen bukti (mis. Surat BAST Penyedia, foto material)
- Jawaban tampil berdampingan (side-by-side) dengan laporan warga asli agar dua sisi informasi terlihat

### 7.4 Moderasi
- Setiap laporan warga wajib melewati moderasi admin sebelum tayang publik
- Admin bisa: setujui tayang, tolak, minta klarifikasi tambahan

---

## 8. Modul 6 — Upload APBDes (AI Extraction Pipeline)

### 8.1 UI Upload
- Drag & drop atau klik untuk pilih file
- Format diterima: PDF (hasil ekspor Siskeudes / dokumen APBDes resmi)
- Info "Cara kerja AI Pipeline TransparanDesa" ditampilkan ke pengguna: `PDF APBDes → pdfplumber ekstraksi teks → Gemini API parsing terstruktur → data JSON → Visualisasi Interaktif`

### 8.2 Progress Indicator Real-time (5 tahap, tampilkan checklist berjalan)
1. Membaca dokumen PDF APBDes...
2. Mengekstrak teks & tabel dengan pdfplumber...
3. Mengirim ke Gemini API untuk parsing terstruktur...
4. Menjalankan 5 Rule Validasi Deterministik...
5. Menghitung Confidence Score & Routing Status...

### 8.3 Pipeline Ekstraksi (Backend, Python/FastAPI)
1. **Ekstraksi awal**: `pdfplumber` untuk mengambil struktur tabel & teks mentah dari PDF
2. **Parsing semantik**: teks terstruktur dikirim ke **Gemini API (varian Flash)** via prompt engineering khusus untuk mengenali struktur baku APBDes/Siskeudes (kategori pendapatan, belanja, pembiayaan) dan memetakan ke kode rekening standar Kemenkeu/Kemendes PDTT
3. Output LLM berupa **JSON terstruktur**
4. Alasan pilihan pdfplumber+LLM dibanding vision-based (LayoutLM dsb.): lebih adaptif terhadap variasi format tabel Siskeudes antarwilayah

### 8.4 Rule-Based Cross-Check / LLM Guardrails
- Sistem menghitung akumulasi seluruh rincian sub-belanja dan mencocokkan dengan total pagu anggaran pada dokumen asli
- Jika terjadi selisih hitung → sistem otomatis melakukan **fallback parsing** berbasis aturan tabel fisik sebelum data disimpan

### 8.5 Rule Engine Validasi 5-Tingkat (Zero Trust Approach)
Dijalankan otomatis terhadap setiap hasil ekstraksi AI:
1. **Format Check** — konsistensi penulisan nominal Rupiah (desimal, pemisah ribuan)
2. **Math Consistency Check** — penjumlahan rincian pos belanja harus sama persis dengan akumulasi total belanja dokumen
3. **Non-Negative Check** — tolak nilai nominal anggaran negatif
4. **Duplicate Check** — identifikasi & eliminasi duplikasi entri pos anggaran
5. **Missing Field Check** — pastikan atribut wajib terisi (kode rekening, kategori, uraian, nominal)

### 8.6 Confidence Scoring & Auto-Routing
Formula skor kepercayaan dokumen:
```
CS_doc = 0.50 × S_val + 0.30 × S_llm + 0.20 × S_ocr
```
- `S_val` = skor hasil Rule Engine validasi (5 aturan di atas)
- `S_llm` = skor kepercayaan output parsing LLM
- `S_ocr` = skor kualitas ekstraksi teks/OCR dari dokumen sumber

**Routing:**
- `CS_doc ≥ 85%` → **Auto-Approved**, langsung diterbitkan ke database publik
- `CS_doc < 85%` atau ada pelanggaran Rule Engine (mis. selisih subtotal) → **Needs Review**, dirutekan ke Antrean Review Manual

### 8.7 Antrean Review Manual (Human-in-the-Loop)
UI untuk admin/verifikator:
- Daftar tiket menunggu review, tampilkan `job_id`, nama desa, skor confidence
- Breakdown skor: Rule Validation (%), skor LLM JSON (%), skor OCR/Teks (%)
- Laporan pelanggaran rule engine spesifik (mis. "REJ_SUBTOTAL_CONSISTENCY PENALTY -35%: Selisih Rp 150.000.000 antara Total Belanja dan penjumlahan rincian item")
- Tabel koreksi data ekstraksi yang **bisa diedit langsung** per baris (kode, kategori, uraian kegiatan, anggaran BPD) + tombol tambah item + tombol hapus baris
- Ringkasan pengecekan: Total Belanja Dokumen vs Hasil Penjumlahan Rincian vs Selisih
- Kolom "Catatan Verifikator Admin" (free text)
- Tombol "Setujui & Simpan ke Database Publik"

---

## 9. Modul 7 — Autentikasi & Manajemen Peran

- Registrasi/login (email/password minimal; opsional OAuth)
- 4 role utama: `warga_terverifikasi`, `bpd_pemdes`, `jurnalis_lsm_peneliti`, `admin_verifikator`
- Guest/publik (tanpa akun) tetap bisa akses mode view-only
- Row-Level Security (RLS) di level PostgreSQL/Supabase:
  - Warga hanya bisa CRUD laporan miliknya sendiri
  - Pemdes hanya bisa menjawab (hak jawab) laporan terkait desanya
  - Admin punya akses penuh ke seluruh baris untuk moderasi

---

## 10. Desain Basis Data (Entitas Utama)

### `Desa`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID | PK |
| nama | text | |
| kode_wilayah | text | kode resmi Kemendagri |
| provinsi | text | |
| kabupaten | text | |
| jumlah_penduduk | integer | |
| klasifikasi | enum | rural / urban, atau Wisata/Agraris/Pesisir dsb. |
| idm | numeric | Indeks Desa Membangun (untuk clustering benchmark) |
| status_kondisi_khusus | jsonb/array | bencana alam, dsb. |

### `APBDes`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID | PK |
| desa_id | UUID | FK → Desa |
| tahun_anggaran | integer | |
| kategori | enum | 6 kategori baku |
| kode_rekening | text | |
| uraian_kegiatan | text | |
| jumlah_anggaran | numeric | |
| jumlah_realisasi | numeric | |
| tahap_pencairan | jsonb | array {tahap, nominal, tanggal, status} |
| sumber_dokumen | text | nama file PDF asal |
| confidence_score | numeric | dari pipeline AI |
| status_verifikasi | enum | auto_approved / needs_review / approved_manual |

### `LaporanWarga`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID | PK |
| nomor_tiket | text | unik, format #TD-YYYY-NNNNN |
| pelapor_id | UUID (nullable) | FK → Pengguna, null jika anonim |
| apbdes_id | UUID | FK → APBDes (pos anggaran terkait) |
| kategori_anggaran | text | |
| deskripsi | text | |
| lampiran_foto | text[]/jsonb | url ke storage |
| is_anonim | boolean | |
| status_verifikasi | enum | menunggu_moderasi / diteruskan / dijawab / selesai |
| hak_jawab | jsonb | {oleh, isi, lampiran, tanggal} |
| log_riwayat | jsonb | array {aktor, aksi, timestamp} |

### `Pengguna`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID | PK |
| nama | text | |
| email | text | |
| role | enum | warga_terverifikasi / bpd_pemdes / jurnalis_lsm_peneliti / admin_verifikator |
| desa_id | UUID (nullable) | FK → Desa, relevan untuk role bpd_pemdes |

---

## 11. Kebutuhan Non-Fungsional

- **Kinerja**: ekstraksi 1 dokumen APBDes < 2 menit
- **Keamanan**: TLS/HTTPS di seluruh jalur komunikasi, RLS di level database, moderasi berjenjang untuk laporan warga
- **Usability**: antarmuka sederhana, minim istilah teknis, dirancang untuk pengguna dengan literasi digital terbatas, responsif mobile-first
- **Skalabilitas**: arsitektur harus bisa berkembang horizontal dari skala pilot ke 74.961 desa tanpa perombakan skema data
- **Keandalan**: ketersediaan data konsisten khususnya pada modul visualisasi publik

---

## 12. Tech Stack Ringkas

| Layer | Teknologi |
|---|---|
| Frontend | Next.js 14 (App Router), Tailwind CSS, Recharts, React-PDF viewer |
| Backend utama | Next.js API Routes (autentikasi & logika aplikasi) |
| Backend pemrosesan dokumen | Python + FastAPI + pdfplumber |
| AI/LLM | Gemini API (varian Flash) — parsing dokumen terstruktur |
| Database | PostgreSQL via Supabase (dengan Row-Level Security) |
| Analisis statistik | Z-Score (Robust MAD) + Isolation Forest (ML) untuk deteksi anomali |
| Data seed awal | Import dari data.go.id (portal data terbuka pemerintah) |

---

## 13. Indikator Keberhasilan Implementasi

- Jumlah desa yang berhasil diproses & divisualisasikan datanya
- Tingkat akurasi hasil ekstraksi AI dibandingkan pemeriksaan manual
- Rata-rata waktu pemrosesan per dokumen
- Jumlah & kualitas laporan warga yang berhasil diverifikasi
- Tingkat kepuasan pengguna dari sesi User Acceptance Testing (UAT)
