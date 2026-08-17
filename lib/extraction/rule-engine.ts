/**
 * Rule Engine Validasi Ekstraksi APBDes
 * 
 * Melakukan verifikasi deterministik terhadap data hasil ekstraksi AI/LLM
 * menggunakan 5 aturan validasi utama.
 */

export interface APBDesItemExtract {
  kode_rekening?: string
  kategori: string
  uraian: string
  nominal_anggaran: number
  nominal_realisasi?: number
}

export interface APBDesDocExtract {
  tahun_anggaran: number
  nama_desa: string
  total_pendapatan: number
  total_belanja: number
  total_pembiayaan?: number
  items: APBDesItemExtract[]
}

export interface ValidationLogItem {
  rule_code: 'R1_FORMAT_RUPIAH' | 'R2_SUBTOTAL_CONSISTENCY' | 'R3_NEGATIVE_CHECK' | 'R4_DUPLICATE_ITEM' | 'R5_MISSING_FIELD'
  is_passed: boolean
  penalty_score: number
  error_message: string
  affected_item_index?: number
}

export interface ValidationReport {
  is_valid: boolean
  hard_violation_count: number
  warning_count: number
  total_penalty: number
  logs: ValidationLogItem[]
}

/**
 * Levenshtein distance similarity helper (0.0 to 1.0)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim()
  const s2 = str2.toLowerCase().trim()
  if (s1 === s2) return 1.0
  if (!s1 || !s2) return 0.0

  const len1 = s1.length
  const len2 = s2.length
  const track = Array(len2 + 1).fill(null).map(() => Array(len1 + 1).fill(null))

  for (let i = 0; i <= len1; i += 1) track[0][i] = i
  for (let j = 0; j <= len2; j += 1) track[j][0] = j

  for (let j = 1; j <= len2; j += 1) {
    for (let i = 1; i <= len1; i += 1) {
      const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator // substitution
      )
    }
  }

  const distance = track[len2][len1]
  const maxLen = Math.max(len1, len2)
  return 1 - distance / maxLen
}

/**
 * Menjalankan 5 aturan validasi terhadap data APBDes
 */
export function runValidationRules(doc: APBDesDocExtract): ValidationReport {
  const logs: ValidationLogItem[] = []
  let hardViolationCount = 0
  let warningCount = 0
  let totalPenalty = 0

  // R1: Format Nominal Rupiah & Reasonable Bounds Check
  doc.items.forEach((item, idx) => {
    if (
      typeof item.nominal_anggaran !== 'number' ||
      isNaN(item.nominal_anggaran) ||
      item.nominal_anggaran < 0
    ) {
      logs.push({
        rule_code: 'R1_FORMAT_RUPIAH',
        is_passed: false,
        penalty_score: 0.25,
        error_message: `Item #${idx + 1} (${item.uraian || 'Tanpa Uraian'}): Nominal anggaran bukan format angka valid.`,
        affected_item_index: idx,
      })
      hardViolationCount++
      totalPenalty += 0.25
    } else if (item.nominal_anggaran > 10_000_000_000) {
      // Alert jika nominal di atas Rp 10 Miliar per item (melebihi pagu wajar desa)
      logs.push({
        rule_code: 'R1_FORMAT_RUPIAH',
        is_passed: false,
        penalty_score: 0.15,
        error_message: `Item #${idx + 1} (${item.uraian}): Nominal anggaran Rp ${item.nominal_anggaran.toLocaleString('id-ID')} melebihi ambang batas wajar desa (> 10 Miliar).`,
        affected_item_index: idx,
      })
      warningCount++
      totalPenalty += 0.15
    }
  })

  // R2: Konsistensi Subtotal & Total Belanja
  const calculatedTotalBelanja = doc.items.reduce((sum, item) => sum + (item.nominal_anggaran || 0), 0)
  const diffBelanja = Math.abs((doc.total_belanja || 0) - calculatedTotalBelanja)
  const TOLERANSI_SELISIH = 1000 // Rp 1.000 (toleransi pembulatan)

  if (diffBelanja > TOLERANSI_SELISIH) {
    logs.push({
      rule_code: 'R2_SUBTOTAL_CONSISTENCY',
      is_passed: false,
      penalty_score: 0.35,
      error_message: `Selisih Rp ${diffBelanja.toLocaleString('id-ID')} antara Total Belanja (${(doc.total_belanja || 0).toLocaleString('id-ID')}) dan penjumlahan rincian item (${calculatedTotalBelanja.toLocaleString('id-ID')}).`,
    })
    hardViolationCount++
    totalPenalty += 0.35
  } else {
    logs.push({
      rule_code: 'R2_SUBTOTAL_CONSISTENCY',
      is_passed: true,
      penalty_score: 0,
      error_message: `Konsistensi subtotal valid (Total Belanja: Rp ${calculatedTotalBelanja.toLocaleString('id-ID')}).`,
    })
  }

  // R3: Check Nilai Negatif
  doc.items.forEach((item, idx) => {
    if (item.nominal_anggaran < 0 || (item.nominal_realisasi !== undefined && item.nominal_realisasi < 0)) {
      logs.push({
        rule_code: 'R3_NEGATIVE_CHECK',
        is_passed: false,
        penalty_score: 0.30,
        error_message: `Item #${idx + 1} (${item.uraian}): Ditemukan nominal negatif.`,
        affected_item_index: idx,
      })
      hardViolationCount++
      totalPenalty += 0.30
    }
  })

  // R4: Duplicate Item Detection (Context-Aware Siskeudes)
  // Duplikasi SEJATI = (Kode Rekening sama DAN Nominal Anggaran sama DAN Uraian sama)
  const flaggedDuplicatePairs = new Set<string>()
  for (let i = 0; i < doc.items.length; i++) {
    for (let j = i + 1; j < doc.items.length; j++) {
      const itemA = doc.items[i]
      const itemB = doc.items[j]

      // Jika kode rekening berbeda, ini jelas pos sah di sub-bidang/kegiatan lain
      if (itemA.kode_rekening && itemB.kode_rekening && itemA.kode_rekening.trim() !== itemB.kode_rekening.trim()) {
        continue
      }

      const isSameAmount = itemA.nominal_anggaran === itemB.nominal_anggaran
      // Jika nominal berbeda, ini adalah pos belanja di kegiatan berbeda (misal belanja perlengkapan Posyandu vs Kantor)
      if (!isSameAmount) {
        continue
      }

      const similarity = calculateSimilarity(itemA.uraian || '', itemB.uraian || '')
      const isSameCode = Boolean(
        itemA.kode_rekening &&
        itemB.kode_rekening &&
        itemA.kode_rekening.trim() === itemB.kode_rekening.trim()
      )
      
      const pairKey = `${minIdx(i, j)}-${maxIdx(i, j)}`

      // Flag HANYA jika nominal sama DAN (kode rekening sama ATAU uraian identik persis >= 98%)
      if (!flaggedDuplicatePairs.has(pairKey) && isSameAmount && (isSameCode || similarity >= 0.98)) {
        flaggedDuplicatePairs.add(pairKey)
        logs.push({
          rule_code: 'R4_DUPLICATE_ITEM',
          is_passed: false,
          penalty_score: 0.05,
          error_message: `Potensi duplikasi antara Item #${i + 1} ("${itemA.uraian}") dan Item #${j + 1} ("${itemB.uraian}") dengan nominal Rp ${itemA.nominal_anggaran.toLocaleString('id-ID')}.`,
          affected_item_index: j,
        })
        warningCount++
        totalPenalty += 0.05
      }
    }
  }

  function minIdx(a: number, b: number) { return a < b ? a : b }
  function maxIdx(a: number, b: number) { return a > b ? a : b }

  // R5: Missing Field Detection
  doc.items.forEach((item, idx) => {
    const missing: string[] = []
    if (!item.kategori || !item.kategori.trim()) missing.push('kategori')
    if (!item.uraian || !item.uraian.trim()) missing.push('uraian')
    if (item.nominal_anggaran === undefined || item.nominal_anggaran === null) missing.push('nominal_anggaran')

    if (missing.length > 0) {
      logs.push({
        rule_code: 'R5_MISSING_FIELD',
        is_passed: false,
        penalty_score: 0.20,
        error_message: `Item #${idx + 1}: Atribut wajib tidak lengkap [${missing.join(', ')}].`,
        affected_item_index: idx,
      })
      warningCount++
      totalPenalty += 0.20
    }
  })

  return {
    is_valid: hardViolationCount === 0 && totalPenalty < 0.20,
    hard_violation_count: hardViolationCount,
    warning_count: warningCount,
    total_penalty: Math.min(1.0, totalPenalty),
    logs,
  }
}
