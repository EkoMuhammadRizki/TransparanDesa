import os
import sys
import json
import argparse

# Atur stdout agar mendukung UTF-8 pada Windows console
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from pipeline.pdf_extractor import PDFExtractor
from pipeline.gemini_parser import GeminiAPBDesParser
from pipeline.rule_engine import RuleEngine
from pipeline.confidence_scorer import ConfidenceScorer
from pipeline.schemas import PipelineOutput

def process_apbdes_pdf(file_path: str, output_json_path: str = None) -> PipelineOutput:
    file_name = os.path.basename(file_path)
    print(f"\n{'='*70}")
    print(f">> MEMULAI PIPELINE EKSTRAKSI AI & RULE ENGINE: {file_name}")
    print(f"{'='*70}")

    # 1. Ekstraksi PDF & Normalisasi Teks
    print("\n[Step 1/5] Membaca dan mengekstrak dokumen PDF dengan pdfplumber...")
    extracted_pdf = PDFExtractor.extract_from_file(file_path)
    print(f"  [+] Halaman: {extracted_pdf['page_count']} | Karakter: {extracted_pdf['total_chars']:,} | Tabel: {extracted_pdf['total_tables']}")
    print(f"  [+] Skor OCR: {extracted_pdf['score_ocr']}%")

    if extracted_pdf['is_scanned']:
        print("  [!] PERINGATAN: Dokumen ini terdeteksi sebagai scan gambar (minim lapisan teks).")

    # 2. Parsing dengan Gemini API (atau Smart Fallback)
    print("\n[Step 2/5] Mengirim teks terstruktur ke Gemini Flash API...")
    parser = GeminiAPBDesParser()
    doc_data = parser.parse(extracted_pdf['cleaned_text'], file_name)
    print(f"  [+] Desa Teridentifikasi : {doc_data.nama_desa}")
    print(f"  [+] Tahun Anggaran       : {doc_data.tahun_anggaran}")
    print(f"  [+] Total Belanja Dokumen: Rp {doc_data.total_belanja:,}")
    print(f"  [+] Total Item Belanja   : {len(doc_data.items)} rincian pos")

    # 3. Validasi dengan Rule Engine (5-Tingkat)
    print("\n[Step 3/5] Menjalankan 5 Aturan Validasi Deterministik (Rule Engine)...")
    val_report = RuleEngine.run_all_rules(doc_data)
    print(f"  [+] Status Validasi     : {'LULUS' if val_report.is_valid else 'TIDAK LULUS / WARNING'}")
    print(f"  [+] Hard Violations     : {val_report.hard_violation_count}")
    print(f"  [+] Total Belanja Rincian: Rp {val_report.calculated_total_belanja:,}")
    print(f"  [+] Selisih Subtotal    : Rp {val_report.subtotal_difference:,}")

    # Tampilkan log pelanggaran jika ada
    for log in val_report.logs:
        status_icon = "[OK]" if log.is_passed else "[FAIL]"
        if not log.is_passed:
            print(f"    {status_icon} [{log.rule_code}] {log.error_message}")

    # 4. Confidence Scoring & Routing
    print("\n[Step 4/5] Menghitung Confidence Score Dokumen...")
    confidence_result = ConfidenceScorer.calculate(
        doc=doc_data,
        val_report=val_report,
        score_ocr=extracted_pdf['score_ocr'],
        score_llm=95 if parser.client else 80
    )
    print(f"  [*] FINAL CONFIDENCE SCORE: {confidence_result.confidence_score}%")
    print(f"  [*] ROUTING ACTION        : [{confidence_result.action.upper()}]")
    print(f"  [*] ALASAN                : {confidence_result.routing_reason}")

    # 5. Susun Output Pipeline
    pipeline_result = PipelineOutput(
        file_name=file_name,
        page_count=extracted_pdf['page_count'],
        extracted_data=doc_data,
        validation_report=val_report,
        confidence_result=confidence_result
    )

    if output_json_path:
        os.makedirs(os.path.dirname(os.path.abspath(output_json_path)), exist_ok=True)
        with open(output_json_path, "w", encoding="utf-8") as f:
            f.write(pipeline_result.model_dump_json(indent=2))
        print(f"\n[Step 5/5] Hasil ekstraksi berhasil disimpan ke: {output_json_path}")

    print(f"\n{'='*70}")
    print("[SUCCESS] PIPELINE SELESAI DIEKSEKUSI!")
    print(f"{'='*70}\n")

    return pipeline_result

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="TransparanDesa AI Extraction Pipeline")
    parser.add_argument(
        "--file",
        type=str,
        default="dataset/pdf_apbdes/1737009663369277.pdf",
        help="Path ke file PDF APBDes"
    )
    parser.add_argument(
        "--output",
        type=str,
        default="dataset/ground_truth/output_karanganyar_2024.json",
        help="Path file output JSON"
    )
    args = parser.parse_args()

    process_apbdes_pdf(args.file, args.output)
