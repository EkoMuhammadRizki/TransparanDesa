"""
TransparanDesa — FastAPI PDF Extraction Service
================================================
Endpoint ini dipanggil oleh Next.js (teman Fullstack) untuk mengekstrak
dokumen PDF APBDes dan mengembalikan data terstruktur dalam format JSON.

Cara jalankan:
    pip install fastapi uvicorn python-multipart
    uvicorn pipeline.api:app --host 0.0.0.0 --port 8000 --reload

Cara test manual:
    curl -X POST http://localhost:8000/extract \
      -F "file=@dataset/pdf_apbdes/1737009663369277.pdf"
"""

import os
import uuid
import tempfile
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from pipeline.pdf_extractor import PDFExtractor
from pipeline.gemini_parser import GeminiAPBDesParser
from pipeline.rule_engine import RuleEngine
from pipeline.confidence_scorer import ConfidenceScorer
from pipeline.schemas import PipelineOutput

app = FastAPI(
    title="TransparanDesa PDF Extraction API",
    description="Layanan AI ekstraksi dokumen APBDes berbasis Gemini Flash + Rule Engine 5-Tingkat.",
    version="1.0.0",
)

# Izinkan request dari domain Next.js (sesuaikan origin jika sudah deploy)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://transparandesa.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inisialisasi parser sekali (reuse koneksi Gemini)
_parser = GeminiAPBDesParser()


@app.get("/", tags=["Health"])
def health_check():
    """Health check endpoint — digunakan untuk memverifikasi service aktif."""
    return {
        "status": "ok",
        "service": "TransparanDesa Extraction API",
        "gemini_connected": _parser.client is not None,
    }


@app.post("/extract", tags=["Extraction"], response_model=PipelineOutput)
async def extract_apbdes(file: UploadFile = File(...)):
    """
    Terima file PDF APBDes, jalankan pipeline AI + Rule Engine,
    dan kembalikan data terstruktur JSON.

    **Request:** multipart/form-data dengan field `file` berisi PDF.

    **Response:** JSON berisi:
    - `extracted_data`: Seluruh pos anggaran yang teridentifikasi
    - `validation_report`: Hasil 5 aturan validasi
    - `confidence_result`: Skor kepercayaan dan rekomendasi routing
    """
    # Validasi tipe file
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="File harus berformat PDF. Format lain tidak didukung."
        )

    # Batas ukuran file: 20 MB
    MAX_SIZE_BYTES = 20 * 1024 * 1024
    content = await file.read()
    if len(content) > MAX_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"Ukuran file ({len(content) / 1024 / 1024:.1f} MB) melebihi batas 20 MB."
        )

    # Simpan ke file sementara untuk diproses pdfplumber
    tmp_path = os.path.join(tempfile.gettempdir(), f"apbdes_{uuid.uuid4().hex}.pdf")
    try:
        with open(tmp_path, "wb") as f:
            f.write(content)

        # Jalankan 5-step pipeline
        extracted_pdf = PDFExtractor.extract_from_file(tmp_path)

        if extracted_pdf["is_scanned"] and extracted_pdf["score_ocr"] < 30:
            raise HTTPException(
                status_code=422,
                detail=(
                    "Dokumen terdeteksi sebagai scan gambar dengan kualitas rendah. "
                    "Mohon upload ulang versi digital (bukan foto/scan)."
                )
            )

        doc_data = _parser.parse(extracted_pdf["cleaned_text"], file.filename)
        val_report = RuleEngine.run_all_rules(doc_data)
        confidence_result = ConfidenceScorer.calculate(
            doc=doc_data,
            val_report=val_report,
            score_ocr=extracted_pdf["score_ocr"],
            score_llm=95 if _parser.client else 80,
        )

        result = PipelineOutput(
            file_name=file.filename,
            page_count=extracted_pdf["page_count"],
            extracted_data=doc_data,
            validation_report=val_report,
            confidence_result=confidence_result,
        )
        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Gagal memproses dokumen: {str(e)}"
        )
    finally:
        # Hapus file sementara
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
