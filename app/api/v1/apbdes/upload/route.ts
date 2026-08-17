import { NextRequest, NextResponse } from 'next/server'
import { parsePDFDocument } from '@/lib/extraction/pdf-parser'
import { extractAPBDesWithAI } from '@/lib/extraction/ai-engine'
import { runValidationRules } from '@/lib/extraction/rule-engine'
import { calculateConfidenceScore } from '@/lib/extraction/confidence-scorer'
import { extractionJobsStore } from '@/lib/extraction/job-store'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const desaSlug = (formData.get('desa_slug') as string) || 'karanganyar'
    const simulateError = formData.get('simulate_error') === 'true'

    if (!file) {
      return NextResponse.json({ error: 'File PDF wajib diunggah.' }, { status: 400 })
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'Format file harus berupa PDF.' }, { status: 400 })
    }

    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    const arrayBuffer = await file.arrayBuffer()

    let extractionResult: any = null

    // 1. Coba hubungkan ke FastAPI Microservice (http://localhost:8000/extract)
    const fastApiUrl = process.env.AI_PIPELINE_URL || 'http://localhost:8000'
    try {
      const fastApiFormData = new FormData()
      fastApiFormData.append('file', file)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3500) // Timeout 3.5 detik untuk fallback cepat jika FastAPI mati

      const aiResponse = await fetch(`${fastApiUrl}/extract`, {
        method: 'POST',
        body: fastApiFormData,
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (aiResponse.ok) {
        extractionResult = await aiResponse.json()
      }
    } catch (e) {
      // FastAPI offline atau timeout, lanjutkan dengan local fallback pipeline
      console.log('[Info] FastAPI microservice tidak terjangkau, menggunakan Next.js internal AI pipeline.')
    }

    // 2. Jika FastAPI tidak mengembalikan data, gunakan Local Engine Pipeline
    if (!extractionResult) {
      // Stage 1-3: Parsing PDF & Normalisasi Teks
      const parsedPDF = await parsePDFDocument(arrayBuffer, file.name)

      // Stage 4: Ekstraksi AI (Gemini 3.6 Flash / Ground Truth matching)
      const extractedData = await extractAPBDesWithAI(parsedPDF.cleanedText, file.name)

      // Jika disimulasikan error subtotal mismatch untuk pengujian review queue
      if (simulateError) {
        extractedData.items[0].nominal_anggaran = 999999999
      }

      // Stage 5: Validasi Rule Engine (5 Rules)
      const validationReport = runValidationRules(extractedData)

      // Stage 6: Confidence Scoring & Routing Strategy
      const confidenceResult = calculateConfidenceScore(
        extractedData,
        validationReport,
        parsedPDF.cleanedText.length
      )

      extractionResult = {
        file_name: file.name,
        page_count: parsedPDF.pageCount,
        extracted_data: extractedData,
        validation_report: validationReport,
        confidence_result: confidenceResult,
      }
    }

    // Simpan Job Hasil Pipeline
    const jobPayload = {
      job_id: jobId,
      desa_slug: desaSlug,
      file_name: file.name,
      file_size: file.size,
      created_at: new Date().toISOString(),
      parsed_pdf: {
        page_count: extractionResult.page_count,
        row_count: extractionResult.extracted_data?.items?.length || 0,
      },
      extracted_data: extractionResult.extracted_data,
      validation_report: extractionResult.validation_report,
      confidence_result: extractionResult.confidence_result,
      status: extractionResult.confidence_result.action, // 'auto_approved' | 'needs_review' | 'rejected'
    }

    extractionJobsStore.set(jobId, jobPayload)

    return NextResponse.json({
      status: 'success',
      job_id: jobId,
      message: 'Pipeline ekstraksi & validasi AI selesai dijalankan.',
      routing_action: extractionResult.confidence_result.action,
      confidence_score: extractionResult.confidence_result.confidence_score,
      routing_reason: extractionResult.confidence_result.routing_reason,
      extracted_data: extractionResult.extracted_data,
      validation_report: extractionResult.validation_report,
      check_status_url: `/api/v1/apbdes/status/${jobId}`,
    })
  } catch (error: any) {
    console.error('Error on APBDes upload API:', error)
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan pada server saat memproses PDF.' },
      { status: 500 }
    )
  }
}
