# TransparanDesa — Python AI Pipeline

Modul Python untuk ekstraksi otomatis dokumen PDF APBDes menggunakan **Google Gemini Flash** + **Rule Engine 5-Tingkat**.

---

## Struktur Modul

```
pipeline/
├── schemas.py          # Pydantic models — kontrak data JSON
├── pdf_extractor.py    # Pembaca PDF (pdfplumber) & penghitung skor OCR
├── gemini_parser.py    # Klien Google Gemini Flash (Structured Output)
├── rule_engine.py      # 5-Level deterministic validator (R1–R5)
├── confidence_scorer.py# Formula CS = 0.5×S_val + 0.3×S_llm + 0.2×S_ocr
├── run_pipeline.py     # CLI runner — test 1 file PDF
└── api.py              # FastAPI service — endpoint untuk Next.js
```

---

## Cara Setup (Pertama Kali)

### 1. Install Dependency
```bash
pip install -r requirements.txt
```

### 2. Konfigurasi API Key
Buat file `.env` di root folder proyek:
```env
GEMINI_API_KEY=AIzaSy...   # Dapatkan di https://aistudio.google.com/app/apikey
```

---

## Cara Jalankan FastAPI Service

```bash
# Jalankan dari root folder TransparanDesa-1/
uvicorn pipeline.api:app --host 0.0.0.0 --port 8000 --reload
```

Service akan berjalan di: **http://localhost:8000**

### Dokumentasi API Interaktif (Swagger UI)
Buka browser: **http://localhost:8000/docs**

---

## Endpoint untuk Next.js (Fullstack Integration)

### `POST /extract`

Terima PDF APBDes, kembalikan data terstruktur JSON.

**Request:**
```
Content-Type: multipart/form-data
Field: file  (file PDF, maks 20 MB)
```

**Contoh dari Next.js:**
```typescript
const formData = new FormData();
formData.append('file', pdfFile);

const res = await fetch('http://localhost:8000/extract', {
  method: 'POST',
  body: formData,
});
const data = await res.json();
```

**Response JSON:**
```json
{
  "file_name": "apbdes_karanganyar.pdf",
  "page_count": 9,
  "extracted_data": {
    "nama_desa": "Karanganyar",
    "tahun_anggaran": 2024,
    "total_pendapatan": 1991831300,
    "total_belanja": 2120883519,
    "items": [
      {
        "kode_rekening": "5.1.1.01.",
        "kategori": "Infrastruktur",
        "uraian": "Belanja Modal Jalan - Upah Tenaga Kerja",
        "nominal_anggaran": 97532758,
        "nominal_realisasi": 82902844
      }
      // ... item lainnya
    ]
  },
  "validation_report": {
    "is_valid": true,
    "hard_violation_count": 0,
    "calculated_total_belanja": 2120883519,
    "subtotal_difference": 0
  },
  "confidence_result": {
    "confidence_score": 98,
    "action": "auto_approved",
    "routing_reason": "Confidence Score tinggi (98%)..."
  }
}
```

**Status Codes:**
| Code | Keterangan |
|------|-----------|
| `200` | Berhasil — data JSON dikembalikan |
| `400` | File bukan PDF |
| `413` | File terlalu besar (> 20 MB) |
| `422` | PDF scan kualitas rendah — tidak dapat diproses |
| `500` | Error internal pipeline |

### `GET /`
Health check — cek apakah service aktif dan Gemini terhubung.

---

## Cara Test CLI (Tanpa Next.js)

```bash
# Test 1 file PDF
python -m pipeline.run_pipeline --file dataset/pdf_apbdes/1737009663369277.pdf

# Dengan output JSON custom
python -m pipeline.run_pipeline \
  --file dataset/pdf_apbdes/1737009663369277.pdf \
  --output dataset/ground_truth/output_test.json
```

---

## Alur Kerja Pipeline

```
PDF File → PDFExtractor → GeminiParser → RuleEngine → ConfidenceScorer → JSON Output
             (pdfplumber)   (Gemini AI)   (5 rules)    (routing logic)
```

### Routing Berdasarkan Confidence Score:
| Score | Action | Keterangan |
|-------|--------|-----------|
| ≥ 85% | `auto_approved` | Langsung dipublikasikan |
| 60–84% | `needs_review` | Perlu verifikasi admin |
| < 60% | `rejected` | Tolak, minta upload ulang |
