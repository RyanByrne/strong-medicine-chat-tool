import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import jsPDF from 'jspdf'
import { medicalAPI } from '@/lib/medical-api'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface PatientData {
  demographics: {
    age?: number
    gender?: string
    location?: string
  }
  symptoms: string[]
  medicalHistory: string[]
  currentMedications: string[]
  lifestyle: {
    stress_level?: string
    sleep_quality?: string
    exercise_frequency?: string
    diet_type?: string
  }
  concerns: string[]
}

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const REPORT_SYSTEM_PROMPT = `You are a functional medicine practitioner generating a comprehensive health screening report. Based on the patient data and conversation, create a detailed analysis with:

1. PATIENT SUMMARY
2. SYMPTOMS ANALYSIS
3. POTENTIAL ROOT CAUSES (functional medicine perspective)
4. LIFESTYLE FACTORS
5. RECOMMENDED SPECIALISTS
6. NEXT STEPS
7. LIFESTYLE RECOMMENDATIONS

Focus on functional medicine principles:
- Root cause analysis
- Systems thinking
- Personalized approach
- Lifestyle medicine

IMPORTANT: This is a screening report, NOT a diagnosis. Always include appropriate disclaimers.

Format the response in clear sections with headers. Be thorough but accessible to patients.`

export async function POST(req: NextRequest) {
  try {
    const { patientData, messageHistory } = await req.json()

    // Use medical API for enhanced analysis
    const medicalInsights = await medicalAPI.analyzeSymptoms(patientData.symptoms)
    const specialistRecommendations = await medicalAPI.getSpecialistRecommendations(medicalInsights)
    const lifestyleRecommendations = await medicalAPI.getLifestyleRecommendations(patientData)
    const drugInteractions = await medicalAPI.checkDrugInteractions(patientData.currentMedications)

    // Generate AI analysis with enhanced data
    const analysisPrompt = `Generate a comprehensive functional medicine health screening report based on this patient data:

Patient Data: ${JSON.stringify(patientData, null, 2)}

Medical Insights: ${JSON.stringify(medicalInsights, null, 2)}

Specialist Recommendations: ${JSON.stringify(specialistRecommendations, null, 2)}

Lifestyle Recommendations: ${JSON.stringify(lifestyleRecommendations, null, 2)}

Drug Interaction Warnings: ${JSON.stringify(drugInteractions, null, 2)}

Conversation Summary: ${messageHistory.slice(-20).map((msg: Message) => 
  `${msg.type}: ${msg.content}`
).join('\n')}

Please provide a detailed functional medicine analysis incorporating the medical insights and recommendations provided.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: REPORT_SYSTEM_PROMPT },
        { role: 'user', content: analysisPrompt }
      ],
      max_tokens: 2000,
      temperature: 0.3,
    })

    const analysis = completion.choices[0]?.message?.content || "Unable to generate analysis"

    // Generate PDF report
    const pdf = new jsPDF()
    const pageWidth = pdf.internal.pageSize.getWidth()
    const margin = 20
    const maxWidth = pageWidth - (margin * 2)

    // Header
    pdf.setFontSize(20)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Strong Medicine Health Screening Report', margin, 30)
    
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, margin, 45)

    let yPosition = 65

    // Patient Demographics
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Patient Information', margin, yPosition)
    yPosition += 15

    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'normal')
    
    if (patientData.demographics.age) {
      pdf.text(`Age: ${patientData.demographics.age}`, margin, yPosition)
      yPosition += 12
    }
    
    if (patientData.demographics.gender) {
      pdf.text(`Gender: ${patientData.demographics.gender}`, margin, yPosition)
      yPosition += 12
    }

    yPosition += 10

    // Symptoms
    if (patientData.symptoms.length > 0) {
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Reported Symptoms', margin, yPosition)
      yPosition += 15

      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'normal')
      patientData.symptoms.forEach((symptom: string) => {
        pdf.text(`• ${symptom}`, margin, yPosition)
        yPosition += 12
      })
      yPosition += 10
    }

    // Medical History
    if (patientData.medicalHistory.length > 0) {
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Medical History', margin, yPosition)
      yPosition += 15

      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'normal')
      patientData.medicalHistory.forEach((item: string) => {
        pdf.text(`• ${item}`, margin, yPosition)
        yPosition += 12
      })
      yPosition += 10
    }

    // Lifestyle Factors
    const lifestyleEntries = Object.entries(patientData.lifestyle).filter(([key, value]) => value)
    if (lifestyleEntries.length > 0) {
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Lifestyle Factors', margin, yPosition)
      yPosition += 15

      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'normal')
      lifestyleEntries.forEach(([key, value]) => {
        const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        pdf.text(`${label}: ${value}`, margin, yPosition)
        yPosition += 12
      })
      yPosition += 15
    }

    // Add new page for analysis
    pdf.addPage()
    yPosition = 30

    // AI Analysis
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Functional Medicine Analysis', margin, yPosition)
    yPosition += 20

    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'normal')

    // Split analysis into paragraphs and wrap text
    const paragraphs = analysis.split('\n\n')
    
    paragraphs.forEach((paragraph) => {
      if (paragraph.trim()) {
        // Check if it's a header (contains uppercase words or starts with numbers)
        if (paragraph.match(/^[A-Z\s]+$/) || paragraph.match(/^\d+\./) || paragraph.includes(':')) {
          pdf.setFont('helvetica', 'bold')
          pdf.setFontSize(12)
        } else {
          pdf.setFont('helvetica', 'normal')
          pdf.setFontSize(11)
        }

        const lines = pdf.splitTextToSize(paragraph.trim(), maxWidth)
        
        // Check if we need a new page
        if (yPosition + (lines.length * 12) > pdf.internal.pageSize.getHeight() - margin) {
          pdf.addPage()
          yPosition = margin
        }

        lines.forEach((line: string) => {
          pdf.text(line, margin, yPosition)
          yPosition += 12
        })
        
        yPosition += 8 // Extra space between paragraphs
      }
    })

    // Add disclaimer
    pdf.addPage()
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Important Disclaimer', margin, 30)

    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'normal')
    const disclaimer = `This health screening report is for informational purposes only and is not intended to replace professional medical advice, diagnosis, or treatment. The analysis provided is based on functional medicine principles and the information you provided during the screening.

This report does not constitute a medical diagnosis. Always seek the advice of your physician or other qualified healthcare provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read in this report.

Strong Medicine functional medicine practitioners are available for comprehensive consultations to develop personalized treatment plans based on these findings.

For appointments and consultations, please visit: strongmedicine.com`

    const disclaimerLines = pdf.splitTextToSize(disclaimer, maxWidth)
    let disclaimerY = 50

    disclaimerLines.forEach((line: string) => {
      pdf.text(line, margin, disclaimerY)
      disclaimerY += 12
    })

    // Generate PDF buffer
    const pdfBuffer = pdf.output('arraybuffer')

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="health-screening-report.pdf"',
      },
    })

  } catch (error) {
    console.error('Report generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}