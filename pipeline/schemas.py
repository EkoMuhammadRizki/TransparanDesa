from typing import List, Optional, Literal
from pydantic import BaseModel, Field

KategoriBakuType = Literal[
    "Infrastruktur",
    "Pendidikan",
    "Kesehatan",
    "Pemberdayaan Masyarakat",
    "Operasional Pemerintah Desa",
    "Lainnya"
]

class APBDesItem(BaseModel):
    kode_rekening: Optional[str] = Field(
        default=None,
        description="Kode rekening standar APBDes/Siskeudes (misal: 5.1.1, 5.2.1, 5.3.1)."
    )
    kategori: KategoriBakuType = Field(
        description="Salah satu dari 6 kategori baku: Infrastruktur, Pendidikan, Kesehatan, Pemberdayaan Masyarakat, Operasional Pemerintah Desa, Lainnya."
    )
    uraian: str = Field(
        description="Deskripsi atau uraian kegiatan belanja anggaran desa."
    )
    nominal_anggaran: int = Field(
        description="Nominal alokasi anggaran (pagu) dalam satuan Rupiah bulat murni tanpa titik/koma."
    )
    nominal_realisasi: Optional[int] = Field(
        default=None,
        description="Nominal realisasi penyerapan anggaran dalam satuan Rupiah (jika ada pada dokumen)."
    )

class APBDesDocument(BaseModel):
    nama_desa: str = Field(description="Nama desa yang tertera pada dokumen APBDes.")
    kabupaten: Optional[str] = Field(default=None, description="Nama kabupaten desa.")
    provinsi: Optional[str] = Field(default=None, description="Nama provinsi desa.")
    tahun_anggaran: int = Field(description="Tahun anggaran dokumen APBDes (misal: 2024, 2025).")
    total_pendapatan: Optional[int] = Field(
        default=0,
        description="Total akun pendapatan desa (kode 1.x atau 4.x)."
    )
    total_belanja: int = Field(
        description="Total akumulasi belanja desa (kode 5.x) yang tercantum di dokumen resmi."
    )
    total_pembiayaan: Optional[int] = Field(
        default=0,
        description="Total akun pembiayaan desa (kode 6.x jika ada)."
    )
    items: List[APBDesItem] = Field(
        description="Daftar seluruh rincian pos belanja anggaran desa."
    )

class ValidationLog(BaseModel):
    rule_code: Literal[
        "R1_FORMAT_RUPIAH",
        "R2_SUBTOTAL_CONSISTENCY",
        "R3_NEGATIVE_CHECK",
        "R4_DUPLICATE_ITEM",
        "R5_MISSING_FIELD"
    ]
    is_passed: bool
    penalty_score: float
    error_message: str
    affected_item_index: Optional[int] = None

class ValidationReport(BaseModel):
    is_valid: bool
    hard_violation_count: int
    warning_count: int
    total_penalty: float
    calculated_total_belanja: int
    document_total_belanja: int
    subtotal_difference: int
    logs: List[ValidationLog]

class ConfidenceResult(BaseModel):
    confidence_score: int  # 0 - 100
    score_validation: int
    score_llm: int
    score_ocr: int
    action: Literal["auto_approved", "needs_review", "rejected"]
    routing_reason: str

class PipelineOutput(BaseModel):
    file_name: str
    page_count: int
    extracted_data: APBDesDocument
    validation_report: ValidationReport
    confidence_result: ConfidenceResult
