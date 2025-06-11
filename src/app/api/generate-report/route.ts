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

const REPORT_SYSTEM_PROMPT = `You are preparing a patient onboarding summary for Dr. Johnson's review at Strong Medicine. This report will help Dr. Johnson create a personalized treatment plan during the patient's consultation.

Create a comprehensive summary including:

1. PATIENT OVERVIEW
   - Demographics and contact information
   - Primary health concerns
   - Goals and expectations

2. CURRENT HEALTH STATUS
   - Presenting symptoms and duration
   - Impact on quality of life
   - Previous treatments attempted

3. MEDICAL BACKGROUND
   - Current medications and supplements
   - Past medical history
   - Family health history

4. LIFESTYLE ASSESSMENT
   - Sleep quality and patterns
   - Stress levels and management
   - Diet and nutrition habits
   - Exercise and movement
   - Work-life balance

5. FUNCTIONAL MEDICINE CONSIDERATIONS
   - Potential root causes to investigate
   - Systems that may need support
   - Lifestyle factors to address

6. RECOMMENDED CONSULTATION FOCUS
   - Priority areas for Dr. Johnson to address
   - Suggested testing or assessments
   - Potential treatment approaches

7. PATIENT ENGAGEMENT
   - Readiness for change
   - Support systems
   - Preferred communication style

Note: This is an internal document for Dr. Johnson's review to prepare for the patient consultation.`

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
    pdf.text('Patient Onboarding Summary', margin, 30)
    
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'normal')
    pdf.text('For Dr. Johnson - Strong Medicine', margin, 45)
    
    pdf.setFontSize(12)
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, margin, 55)

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
    const disclaimer = `This patient onboarding summary has been prepared for Dr. Johnson's review at Strong Medicine. The information contained in this report was collected through our AI-assisted onboarding process to help Dr. Johnson prepare for your personal consultation.

NEXT STEPS:
Dr. Johnson will review this information and contact you within 2-3 business days to schedule your consultation. During your consultation, Dr. Johnson will:

• Discuss your health concerns in detail
• Review potential treatment options
• Order any necessary testing
• Create your personalized treatment plan
• Answer all your questions

If you have urgent health concerns, please contact our office directly at (555) 123-4567.

We look forward to partnering with you on your health journey.

Strong Medicine - Where Healing Begins
strongmedicine.com`

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