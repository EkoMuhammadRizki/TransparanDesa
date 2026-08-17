import re
from typing import Dict, Any, List
import pdfplumber

class PDFExtractor:
    """
    Modul Ekstraksi Dokumen PDF APBDes menggunakan pdfplumber.
    Bertugas mengambil teks mentah, membersihkan noise (header/footer berulang),
    dan mengukur kualitas teks/OCR (S_ocr).
    """

    @staticmethod
    def extract_from_file(file_path: str) -> Dict[str, Any]:
        raw_pages_text: List[str] = []
        total_chars = 0
        total_tables = 0

        with pdfplumber.open(file_path) as pdf:
            page_count = len(pdf.pages)
            for i, page in enumerate(pdf.pages):
                page_text = page.extract_text() or ""
                raw_pages_text.append(page_text)
                total_chars += len(page_text)

                tables = page.extract_tables()
                if tables:
                    total_tables += len(tables)

        full_raw_text = "\n\n".join(raw_pages_text)
        cleaned_text = PDFExtractor.clean_and_normalize(full_raw_text)

        # Hitung skor kualitas ekstraksi teks / OCR (0 - 100)
        score_ocr = PDFExtractor.calculate_ocr_quality(total_chars, page_count)

        return {
            "page_count": page_count,
            "total_chars": total_chars,
            "total_tables": total_tables,
            "raw_text": full_raw_text,
            "cleaned_text": cleaned_text,
            "score_ocr": score_ocr,
            "is_scanned": total_chars < (page_count * 50)  # Kurang dari 50 char/halaman indikasi scan
        }

    @staticmethod
    def clean_and_normalize(text: str) -> str:
        """
        Membersihkan header berulang Siskeudes, spasi berlebih, dan baris kosong.
        """
        lines = text.split("\n")
        cleaned_lines = []

        for line in lines:
            trimmed = line.strip()
            if not trimmed:
                continue

            # Hapus baris nomor halaman berulang
            if re.search(r"Halaman\s+\d+\s+dari\s+\d+", trimmed, re.IGNORECASE):
                continue
            if re.search(r"Printed\s+on\s+\d{4}-\d{2}-\d{2}", trimmed, re.IGNORECASE):
                continue
            if re.search(r"Dicetak\s+pada\s+:", trimmed, re.IGNORECASE):
                continue

            # Rapikan multiple spasi/tabs
            trimmed = re.sub(r"[ \t]+", " ", trimmed)
            cleaned_lines.append(trimmed)

        return "\n".join(cleaned_lines)

    @staticmethod
    def calculate_ocr_quality(total_chars: int, page_count: int) -> int:
        """
        Estimasi skor kualitas teks OCR:
        - PDF digital standar Siskeudes biasanya memiliki > 1500 karakter per halaman.
        - PDF scan tanpa OCR memiliki 0 karakter.
        """
        if page_count == 0:
            return 0
        
        avg_chars_per_page = total_chars / page_count
        if avg_chars_per_page >= 1000:
            return 98
        elif avg_chars_per_page >= 500:
            return 85
        elif avg_chars_per_page >= 100:
            return 60
        elif avg_chars_per_page > 0:
            return 35
        else:
            return 10  # Scanned image, butuh fallback OCR Vision
