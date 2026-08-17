from pipeline.schemas import APBDesDocument, ValidationReport, ConfidenceResult

class ConfidenceScorer:
    """
    Kalkulator Confidence Score Dokumen APBDes & Auto-Routing Strategy.
    
    Formula:
    CS_doc = 0.50 * S_val + 0.30 * S_llm + 0.20 * S_ocr
    """

    @staticmethod
    def calculate(
        doc: APBDesDocument,
        val_report: ValidationReport,
        score_ocr: int = 95,
        score_llm: int = 95
    ) -> ConfidenceResult:
        # 1. Skor Validasi Rule Engine (0 - 100)
        score_val = max(0, int((1.0 - val_report.total_penalty) * 100))

        # 2. Formula Gabungan
        raw_confidence = (0.50 * score_val) + (0.30 * score_llm) + (0.20 * score_ocr)
        final_score = min(100, max(0, int(round(raw_confidence))))

        # 3. Penentuan Tindakan Routing
        if val_report.hard_violation_count > 0 or val_report.subtotal_difference > 1000:
            action = "needs_review"
            routing_reason = (
                f"Terdapat selisih subtotal (Rp {val_report.subtotal_difference:,}) atau pelanggaran aturan validasi. "
                f"Dirutekan ke Antrean Review Manual."
            )
        elif final_score >= 85:
            action = "auto_approved"
            routing_reason = (
                f"Confidence Score tinggi ({final_score}%) dan seluruh 5 aturan validasi lulus. "
                f"Auto-Approved langsung diterbitkan ke publik."
            )
        else:
            action = "needs_review"
            routing_reason = (
                f"Confidence Score ({final_score}%) di bawah ambang batas 85%. "
                f"Memerlukan verifikasi oleh admin verifikator."
            )

        return ConfidenceResult(
            confidence_score=final_score,
            score_validation=score_val,
            score_llm=score_llm,
            score_ocr=score_ocr,
            action=action,
            routing_reason=routing_reason
        )
