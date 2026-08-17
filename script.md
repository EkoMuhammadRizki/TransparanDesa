# 🎙️ SCRIPT VIDEO DEMO & DOKUMENTASI SISTEM TRANSPARANDESA
> **File:** `script.md`  
> **Format:** Voice-Over Ready untuk **ElevenLabs** (Text-to-Speech) + Panduan Scene Visual Layar.  
> **Target Durasi:** ~3 - 5 Menit (Cocok untuk Presentasi Kompetisi / Demo Juri Gemastik).

---

## 🏛️ ANALISIS KEJURUSAN & ARSITEKTUR SISTEM (Deskripsi Jujur Sistem)

TransparanDesa adalah **platform tata kelola keuangan desa berbasis kecerdasan buatan (*AI-powered civic-tech platform*)** yang dirancang untuk mengatasi 3 masalah krusial di Indonesia:
1. **Dokumen APBDes Siskeudes yang rumit dan tidak ramah warga awam (*high barrier to entry*)**.
2. **Rentan korupsi dan manipulasi anggaran belanja desa akibat lemahnya pengawasan berkala**.
3. **Belum adanya ruang dialog dua arah yang berimbang antara aduan warga dan hak jawab klarifikasi pemerintah desa**.

### 🌟 3 Pilar Persona Pengguna dalam Ekosistem:
1. **👥 Warga Desa (*Citizen-Centric / Publik*)**: Persona inti. Memahami anggaran desa dalam format visual sederhana (*Zero-Jargon View*), memeriksa realisasi, dan mengirimkan laporan aduan dengan foto bukti secara anonim/terverifikasi.
2. **⚖️ BPD & Auditor (*Badan Permusyawaratan Desa / Inspektorat / LSM*)**: Lembaga pengawas resmi sesuai UU Desa No. 6/2014. Menggunakan modul **Hybrid Anomaly Detection** (Modified Z-Score / MAD + Isolation Forest) dan mengunduh lembar kerja audit.
3. **🏢 Admin / Perangkat Desa (*Kepala Desa / Sekdes / Bendahara*)**: Pihak pengunggah dokumen PDF Siskeudes resmi ke sistem AI, meninjau hasil validasi Rule Engine 5-Tingkat, dan memberikan **Hak Jawab Resmi (*Audi Alteram Partem*)** agar aduan warga tidak menjadi fitnah sepihak.

---

# 🎬 NASKAH VIDEO DEMO (ELEVENLABS VOICE-OVER SCRIPT)

---

### SCENE 1: PEMBUKAAN & LATAR BELAKANG MASALAH (00:00 - 00:35)
* **Visual di Layar:**
  * Buka Beranda TransparanDesa (`http://localhost:3000`).
  * Sorot animasi hero section yang dinamis, kartu total pagu anggaran nasional, dan live search autocomplete.
* **Teks Voice-Over (Salin ke ElevenLabs):**
```text
Setiap tahunnya, lebih dari tujuh puluh triliun rupiah Dana Desa dialokasikan ke puluhan ribu desa di seluruh Indonesia. Namun faktanya, dokumen anggaran APBDes yang dirilis dalam format Siskeudes sangat tebal, teknis, dan sulit dipahami oleh masyarakat awam. Akibatnya, pengawasan anggaran menjadi pasif, dan potensi ketidakwajaran sering kali luput dari perhatian.

Inilah TransparanDesa. Platform transparansi cerdas yang mengintegrasikan kecerdasan buatan, basis data cloud Supabase, dan model akuntansi desa untuk mewujudkan tata kelola anggaran yang transparan, akuntabel, dan partisipatif.
```

---

### SCENE 2: SISTEM AUTENTIKASI 3 PERAN RESMI (00:35 - 01:10)
* **Visual di Layar:**
  * Klik tombol **Masuk** di pojok kanan atas menuju halaman `/auth`.
  * Tunjukkan **Pintasi 1-Klik Akun Demo** dengan highlight aktif pada tombol **👥 Warga (Default)**, **⚖️ BPD / Auditor**, dan **🏢 Admin Desa**.
  * Klik tombol **MASUK SEKARANG**, perlihatkan pop-up **SweetAlert2 "Login Berhasil!"** berwarna hijau elegan yang mengonfirmasi identitas pengguna dan desa domisili, lalu otomatis mengarah ke dasbor.
* **Teks Voice-Over (Salin ke ElevenLabs):**
```text
TransparanDesa dirancang dengan sistem autentikasi multi-peran yang telah terdaftar resmi di Supabase Auth. Terdapat tiga persona utama: Warga Desa sebagai pengawas publik, Badan Permusyawaratan Desa atau Auditor sebagai pengawas lapangan, serta Perangkat Desa sebagai administrator data.

Mari kita masuk sebagai Warga Desa. Sistem langsung menyambut kita dengan notifikasi interaktif yang terverifikasi, memastikan setiap pengguna memiliki hak akses yang sesuai dengan fungsinya.
```

---

### SCENE 3: DASBOR & PROFIL DESA DATA RIIL KARANGANYAR (01:10 - 01:50)
* **Visual di Layar:**
  * Di halaman `/dashboard`, klik kartu **Desa Karanganyar**.
  * Masuk ke halaman profil desa `/desa/karanganyar`.
  * Sorot Indeks Desa Membangun (IDM Mandiri 0.842), 3 alokasi pengeluaran terbesar (Pembangunan Jalan, BPJS & Siltap, Pelatihan Tani), serta komponen Donut Chart interaktif.
* **Teks Voice-Over (Salin ke ElevenLabs):**
```text
Di halaman profil Desa Karanganyar, data mentah anggaran yang rumit telah ditransformasikan menjadi visualisasi ramah publik yang bebas dari istilah teknis. 

Warga dapat melihat status Indeks Desa Membangun, total pendapatan desa sebesar dua koma nol tiga miliar rupiah, serta tiga pos belanja terbesar desa hanya dalam hitungan detik. Pendekatan ini membuat transparansi anggaran bukan lagi sekadar angka, melainkan informasi yang bermakna bagi masyarakat.
```

---

### SCENE 4: VISUALIZER APBDES MULTI-TAHUN & TABEL SISKEUDES (01:50 - 02:30)
* **Visual di Layar:**
  * Klik tab **Visualizer APBDes** (`/desa/karanganyar/apbdes`).
  * Klik tombol toggle tahun **2023, 2024, dan 2025** untuk menunjukkan transisi data multi-tahun yang dinamis.
  * Scroll ke bawah ke **Tabel Pos Belanja Siskeudes**. Coba ketik kata kunci "Paving" atau "Posyandu" pada kotak pencarian tabel untuk menunjukkan respons filter instan.
* **Teks Voice-Over (Salin ke ElevenLabs):**
```text
Pada modul Visualizer APBDes, masyarakat dapat meninjau alokasi belanja antar-tahun, mulai dari tahun dua ribu dua puluh tiga hingga proyeksi dua ribu dua puluh lima, lengkap dengan persentase serapan realisasi.

Di bagian bawah, tersedia tabel interaktif yang memuat lebih dari seratus tujuh puluh pos belanja riil Siskeudes. Warga dapat mencari rincian belanja secara spesifik, seperti pembangunan jalan paving maupun pengadaan sarana posyandu, lengkap dengan kode rekening akun resminya.
```

---

### SCENE 5: AI EXTRACTION HUB & VALIDASI 5-TINGKAT RULE ENGINE (02:30 - 03:20)
* **Visual di Layar:**
  * Beralih ke akun Admin Desa, lalu buka halaman Upload APBDes (`/desa/karanganyar/upload`).
  * Klik salah satu file sampel PDF riil Siskeudes (misal: `1737009663369277.pdf`).
  * Tunjukkan proses step loader AI pipeline berjalan.
  * Tunjukkan hasil evaluasi: **Confidence Score 98% (Auto-Approved)** dan kartu **Laporan Rule Engine (5 Aturan Validasi Akuntansi Desa)**:
    * `R1: Format Angka Valid`
    * `R2: Konsistensi Subtotal Valid`
    * `R3: Non-Negatif Valid`
    * `R4: Validasi Duplikasi Akun`
    * `R5: Kelengkapan Atribut Wajib`
* **Teks Voice-Over (Salin ke ElevenLabs):**
```text
Bagaimana data ini masuk ke dalam sistem? Melalui modul AI Extraction Pipeline. Perangkat desa cukup mengunggah file PDF APBDes resmi hasil ekspor Siskeudes. 

Sistem secara otomatis mengekstrak tabel PDF menggunakan multimodal AI dan mengujinya melalui Zero-Trust Rule Engine lima tingkat: memvalidasi format angka, memastikan penjumlahan subtotal bebas dari selisih matematis, mendeteksi potensi duplikasi akun ganda, hingga memeriksa kelengkapan atribut wajib.

Jika dokumen memenuhi skor kepercayaan di atas delapan puluh lima persen, sistem memberikan status Auto-Approved dan langsung mempublikasikannya ke database Supabase secara real-time.
```

---

### SCENE 6: PORTAL AUDITOR & DETEKSI ANOMALI HYBRID (03:20 - 04:00)
* **Visual di Layar:**
  * Buka halaman Benchmark & Deteksi Anomali (`/desa/karanganyar/benchmark`) atau Portal Auditor (`/auditor`).
  * Tunjukkan grafik perbandingan alokasi desa terhadap median peer group 75.261 desa se-Indonesia.
  * Tunjukkan indikator **Composite Anomaly Score (CAS)** dan penanda level risiko (*Low, Medium, High*).
* **Teks Voice-Over (Salin ke ElevenLabs):**
```text
Bagi BPD dan Auditor Inspektorat, TransparanDesa menyediakan modul Deteksi Anomali Hybrid. Modul ini membandingkan nominal anggaran belanja desa terhadap statistik median dari tujuh puluh lima ribu desa di seluruh Indonesia menggunakan metode Modified Z-Score dan algoritma Isolation Forest.

Dengan Composite Anomaly Score, pengawas dapat dengan cepat mendeteksi jika terjadi lonjakan belanja yang tidak wajar pada sektor tertentu, sehingga langkah pencegahan dan audit lapangan dapat dilakukan lebih dini.
```

---

### SCENE 7: LAPORAN WARGA, HAK JAWAB RESMI & PROFIL PENGGUNA (04:00 - 04:40)
* **Visual di Layar:**
  * Buka form pengiriman aduan di `/desa/karanganyar/lapor`.
  * Buka contoh tiket laporan publik di `/lapor/LAP-2024-001` yang menampilkan layout sejajar **Laporan Warga** di sisi kiri vs **Hak Jawab Resmi Pemdes** di sisi kanan.
  * Klik avatar profil di navbar untuk membuka halaman Profil Pengguna (`/profil`).
* **Teks Voice-Over (Salin ke ElevenLabs):**
```text
TransparanDesa juga memfasilitasi partisipasi warga secara konstruktif melalui fitur Lapor Partisipatif. Warga dapat menyampaikan temuan proyek di lapangan secara anonim ataupun terverifikasi KTP digital.

Yang membedakan platform ini adalah adanya mekanisme Hak Jawab Resmi. Pemerintah Desa memiliki ruang sah untuk melampirkan berita acara, nota fisik, dan klarifikasi resmi. Hal ini menciptakan ruang dialog publik yang sehat, transparan, dan menjauhkan platform dari fitnah yang tidak berdasar.

Seluruh riwayat partisipasi dan kredensial pengguna tersimpan aman di halaman profil pengguna.
```

---

### SCENE 8: PENUTUP (04:40 - 05:00)
* **Visual di Layar:**
  * Kembali ke halaman utama (`/`).
  * Sorot logo TransparanDesa dengan latar belakang pedesaan yang asri dan modern.
* **Teks Voice-Over (Salin ke ElevenLabs):**
```text
TransparanDesa bukan sekadar aplikasi tampilan anggaran, melainkan jembatan digital yang menghubungkan keterbukaan pemerintah desa, ketajaman audit kecerdasan buatan, dan kekuatan partisipasi masyarakat. 

Mari bersama kawal dana desa untuk Indonesia yang lebih maju, adil, dan transparan. Terima kasih.
```

---

## 🛠️ Ringkasan Endpoint & Halaman Utama untuk Rekaman Demo

| Fitur / Halaman | URL Lokal | Deskripsi yang Ditonjolkan |
| :--- | :--- | :--- |
| **Beranda & Pencarian** | `http://localhost:3000` | Animasi modern, live autocomplete search, statistik desa se-Indonesia. |
| **Autentikasi & Akun Demo** | `http://localhost:3000/auth` | 3 Akun resmi Supabase (Warga, BPD, Admin) + SweetAlert2 popup. |
| **Profil Desa Karanganyar** | `http://localhost:3000/desa/karanganyar` | Zero-Jargon View, Ringkasan Warga, IDM Mandiri. |
| **Visualizer APBDes** | `http://localhost:3000/desa/karanganyar/apbdes` | Toggle multi-tahun (2023-2025) & Tabel 170+ pos belanja Siskeudes. |
| **AI Upload Hub** | `http://localhost:3000/desa/karanganyar/upload` | 1-Click PDF sampel Siskeudes, ekstraksi AI & audit Rule Engine 5-Tingkat. |
| **Benchmark & Anomali** | `http://localhost:3000/desa/karanganyar/benchmark` | Hybrid Anomaly Engine (MAD / Modified Z-Score vs 75k desa). |
| **Portal Auditor** | `http://localhost:3000/auditor` | Monitoring multi-desa & ekspor lembar audit CSV. |
| **Lapor & Hak Jawab** | `http://localhost:3000/lapor/LAP-2024-001` | Dialog konstruktif 2 arah (Aduan Warga vs Hak Jawab Resmi Pemdes). |
| **Profil Pengguna** | `http://localhost:3000/profil` | Identitas, kredensial, riwayat partisipasi sesuai role login. |
