import difflib
from typing import List
from pipeline.schemas import APBDesDocument, ValidationReport, ValidationLog

class RuleEngine:
    """
    Rule Engine Validasi 5-Tingkat (Zero Trust Approach)
    Memverifikasi kebenaran matematis dan integritas data hasil ekstraksi AI.
    """

    TOLERANSI_SELISIH = 1000  # Rp 1.000 (toleransi pembulatan)

    @staticmethod
    def run_all_rules(doc: APBDesDocument) -> ValidationReport:
        logs: List[ValidationLog] = []
        hard_violations = 0
        warnings = 0
        total_penalty = 0.0

        # R1: Format Check & Reasonable Bounds (< Rp 10 Miliar per baris)
        for idx, item in enumerate(doc.items):
            if not isinstance(item.nominal_anggaran, int) or item.nominal_anggaran < 0:
                logs.append(ValidationLog(
                    rule_code="R1_FORMAT_RUPIAH",
                    is_passed=False,
                    penalty_score=0.25,
                    error_message=f"Item #{idx+1} ('{item.uraian}'): Nominal bukan integer non-negatif yang valid.",
                    affected_item_index=idx
                ))
                hard_violations += 1
                total_penalty += 0.25
            elif item.nominal_anggaran > 10_000_000_000:
                logs.append(ValidationLog(
                    rule_code="R1_FORMAT_RUPIAH",
                    is_passed=False,
                    penalty_score=0.15,
                    error_message=f"Item #{idx+1} ('{item.uraian}'): Nominal Rp {item.nominal_anggaran:,} melebihi batas wajar desa (> 10 Miliar).",
                    affected_item_index=idx
                ))
                warnings += 1
                total_penalty += 0.15

        # R2: Subtotal Consistency (Math Check: sum(items) == total_belanja)
        calculated_total = sum(item.nominal_anggaran for item in doc.items)
        diff_belanja = abs(doc.total_belanja - calculated_total)

        if diff_belanja > RuleEngine.TOLERANSI_SELISIH:
            logs.append(ValidationLog(
                rule_code="R2_SUBTOTAL_CONSISTENCY",
                is_passed=False,
                penalty_score=0.35,
                error_message=f"Selisih Rp {diff_belanja:,} antara Total Belanja Dokumen (Rp {doc.total_belanja:,}) dan Penjumlahan Rincian (Rp {calculated_total:,})."
            ))
            hard_violations += 1
            total_penalty += 0.35
        else:
            logs.append(ValidationLog(
                rule_code="R2_SUBTOTAL_CONSISTENCY",
                is_passed=True,
                penalty_score=0.0,
                error_message=f"Konsistensi subtotal valid (Total Belanja: Rp {calculated_total:,})."
            ))

        # R3: Non-Negative Check
        for idx, item in enumerate(doc.items):
            if item.nominal_anggaran < 0 or (item.nominal_realisasi is not None and item.nominal_realisasi < 0):
                logs.append(ValidationLog(
                    rule_code="R3_NEGATIVE_CHECK",
                    is_passed=False,
                    penalty_score=0.30,
                    error_message=f"Item #{idx+1} ('{item.uraian}'): Ditemukan nominal negatif.",
                    affected_item_index=idx
                ))
                hard_violations += 1
                total_penalty += 0.30

        # R4: Duplicate Check
        # Duplikasi NYATA = kode rekening identik, ATAU uraian identik persis (>= 0.97) + nominal sama
        # BUKAN duplikasi = jenis belanja sama tapi kegiatan berbeda (format: "Jenis Belanja - Kegiatan")
        r4_flagged_pairs = set()
        for i in range(len(doc.items)):
            for j in range(i + 1, len(doc.items)):
                item_a = doc.items[i]
                item_b = doc.items[j]

                # Cek kode rekening identik (hard duplicate)
                is_same_code = bool(
                    item_a.kode_rekening and item_b.kode_rekening and
                    len(item_a.kode_rekening.strip()) >= 6 and  # minimal kode level 4 (e.g., 5.1.1.01)
                    item_a.kode_rekening.strip() == item_b.kode_rekening.strip()
                )

                # Ambil bagian kegiatan jika ada format "Jenis Belanja - Kegiatan"
                def get_kegiatan(uraian: str) -> str:
                    parts = uraian.split(" - ", 1)
                    return parts[1].strip().lower() if len(parts) > 1 else ""

                kegiatan_a = get_kegiatan(item_a.uraian)
                kegiatan_b = get_kegiatan(item_b.uraian)

                # Jika kegiatan berbeda (dan bukan kosong), ini BUKAN duplikasi — skip
                if kegiatan_a and kegiatan_b and kegiatan_a != kegiatan_b:
                    continue

                # Hitung similarity uraian lengkap
                similarity = difflib.SequenceMatcher(
                    None, item_a.uraian.lower().strip(), item_b.uraian.lower().strip()
                ).ratio()

                is_same_amount = item_a.nominal_anggaran == item_b.nominal_anggaran
                pair_key = (min(i, j), max(i, j))

                if pair_key not in r4_flagged_pairs and (
                    is_same_code or (similarity >= 0.97 and is_same_amount)
                ):
                    r4_flagged_pairs.add(pair_key)
                    logs.append(ValidationLog(
                        rule_code="R4_DUPLICATE_ITEM",
                        is_passed=False,
                        penalty_score=0.15,
                        error_message=f"Potensi duplikasi antara Item #{i+1} ('{item_a.uraian}') dan Item #{j+1} ('{item_b.uraian}') dengan nominal Rp {item_a.nominal_anggaran:,}.",
                        affected_item_index=j
                    ))
                    warnings += 1
                    total_penalty += 0.15


        # R5: Missing Field Check
        for idx, item in enumerate(doc.items):
            missing_fields = []
            if not item.kategori or not item.kategori.strip():
                missing_fields.append("kategori")
            if not item.uraian or not item.uraian.strip():
                missing_fields.append("uraian")
            if item.nominal_anggaran is None:
                missing_fields.append("nominal_anggaran")

            if missing_fields:
                logs.append(ValidationLog(
                    rule_code="R5_MISSING_FIELD",
                    is_passed=False,
                    penalty_score=0.20,
                    error_message=f"Item #{idx+1}: Atribut wajib tidak lengkap [{', '.join(missing_fields)}].",
                    affected_item_index=idx
                ))
                warnings += 1
                total_penalty += 0.20

        is_valid = (hard_violations == 0) and (total_penalty < 0.20)

        return ValidationReport(
            is_valid=is_valid,
            hard_violation_count=hard_violations,
            warning_count=warnings,
            total_penalty=round(min(1.0, total_penalty), 2),
            calculated_total_belanja=calculated_total,
            document_total_belanja=doc.total_belanja,
            subtotal_difference=diff_belanja,
            logs=logs
        )
