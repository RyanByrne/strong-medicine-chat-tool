import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

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

const SYSTEM_PROMPT = `You are a professional medical screening assistant for Strong Medicine, a functional medicine clinic. Your role is to conduct a comprehensive health assessment through conversational questions.

IMPORTANT GUIDELINES:
1. You are NOT diagnosing or providing medical advice
2. You are collecting information for a health screening report
3. Ask follow-up questions based on responses to gather comprehensive information
4. Be empathetic, professional, and thorough
5. Focus on functional medicine approaches (root causes, lifestyle factors, etc.)
6. Progress through these stages: demographics → symptoms → medical history → lifestyle → analysis

STAGES:
- demographics: Age, gender, location, occupation
- symptoms: Current symptoms, duration, severity, patterns
- history: Medical history, family history, previous treatments
- lifestyle: Diet, exercise, sleep, stress, environment
- analysis: Summarize findings and prepare for report generation

RESPONSE FORMAT:
- Ask 1-2 focused questions at a time
- Show empathy for patient concerns
- Use natural, conversational language
- Guide towards the next stage when current stage is complete

Remember: You're gathering information for a comprehensive functional medicine assessment, not providing diagnoses.`

export async function POST(req: NextRequest) {
  try {
    const { message, patientData, messageHistory, currentStage } = await req.json()

    // Create conversation history for OpenAI
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messageHistory.slice(-10).map((msg: Message) => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: 'user', content: message }
    ]

    // Add context about current data and stage
    const contextMessage = `Current patient data: ${JSON.stringify(patientData)}
Current stage: ${currentStage}
Please continue the assessment, asking appropriate follow-up questions for the current stage or transitioning to the next stage if this one is complete.`
    
    messages.splice(-1, 0, { role: 'system', content: contextMessage })

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages as any,
      max_tokens: 300,
      temperature: 0.7,
    })

    const response = completion.choices[0]?.message?.content || "I'm having trouble processing that. Could you please rephrase?"

    // Parse user response and update patient data
    const updatedPatientData = await updatePatientData(message, patientData, currentStage)
    
    // Calculate progress and determine next stage
    const { progress, nextStage } = calculateProgress(updatedPatientData, currentStage)

    return NextResponse.json({
      message: response,
      updatedPatientData,
      progress,
      currentStage: nextStage
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

async function updatePatientData(userMessage: string, currentData: PatientData, stage: string): Promise<PatientData> {
  const updated = { ...currentData }
  
  // Use simple keyword extraction for demo (in production, use more sophisticated NLP)
  const lowerMessage = userMessage.toLowerCase()
  
  switch (stage) {
    case 'demographics':
      // Extract age
      const ageMatch = userMessage.match(/(\d{1,3})\s*(?:years?\s*old|yo|yrs?)?/i)
      if (ageMatch) {
        updated.demographics.age = parseInt(ageMatch[1])
      }
      
      // Extract gender
      if (lowerMessage.includes('male') && !lowerMessage.includes('female')) {
        updated.demographics.gender = 'male'
      } else if (lowerMessage.includes('female')) {
        updated.demographics.gender = 'female'
      } else if (lowerMessage.includes('man') || lowerMessage.includes('guy')) {
        updated.demographics.gender = 'male'
      } else if (lowerMessage.includes('woman') || lowerMessage.includes('lady')) {
        updated.demographics.gender = 'female'
      }
      break
      
    case 'symptoms':
      // Extract symptoms (simple keyword matching)
      const symptomKeywords = ['pain', 'fatigue', 'headache', 'nausea', 'dizzy', 'tired', 'ache', 'sore', 'hurt', 'sick', 'weak', 'anxiety', 'stress', 'depressed', 'bloating', 'constipation', 'diarrhea', 'insomnia', 'sleep', 'brain fog', 'memory']
      symptomKeywords.forEach(keyword => {
        if (lowerMessage.includes(keyword) && !updated.symptoms.includes(keyword)) {
          updated.symptoms.push(keyword)
        }
      })
      break
      
    case 'history':
      // Extract medical history
      const historyKeywords = ['diabetes', 'hypertension', 'thyroid', 'cancer', 'surgery', 'depression', 'anxiety', 'autoimmune', 'allergies', 'asthma', 'heart disease', 'stroke']
      historyKeywords.forEach(keyword => {
        if (lowerMessage.includes(keyword) && !updated.medicalHistory.includes(keyword)) {
          updated.medicalHistory.push(keyword)
        }
      })
      break
      
    case 'lifestyle':
      // Extract lifestyle information
      if (lowerMessage.includes('stress')) {
        if (lowerMessage.includes('high') || lowerMessage.includes('very') || lowerMessage.includes('lot')) {
          updated.lifestyle.stress_level = 'high'
        } else if (lowerMessage.includes('low') || lowerMessage.includes('little')) {
          updated.lifestyle.stress_level = 'low'
        } else {
          updated.lifestyle.stress_level = 'moderate'
        }
      }
      
      if (lowerMessage.includes('sleep')) {
        if (lowerMessage.includes('good') || lowerMessage.includes('well')) {
          updated.lifestyle.sleep_quality = 'good'
        } else if (lowerMessage.includes('poor') || lowerMessage.includes('bad') || lowerMessage.includes('terrible')) {
          updated.lifestyle.sleep_quality = 'poor'
        } else {
          updated.lifestyle.sleep_quality = 'fair'
        }
      }
      break
  }
  
  return updated
}

function calculateProgress(patientData: PatientData, currentStage: string): { progress: number, nextStage: string } {
  let progress = 0
  let nextStage = currentStage
  
  // Demographics (20%)
  if (patientData.demographics.age && patientData.demographics.gender) {
    progress += 20
    if (currentStage === 'demographics') nextStage = 'symptoms'
  }
  
  // Symptoms (25%)
  if (patientData.symptoms.length > 0) {
    progress += 25
    if (currentStage === 'symptoms') nextStage = 'history'
  }
  
  // Medical History (20%)
  if (patientData.medicalHistory.length > 0 || currentStage === 'history') {
    progress += 20
    if (currentStage === 'history') nextStage = 'lifestyle'
  }
  
  // Lifestyle (25%)
  if (Object.keys(patientData.lifestyle).length > 0 || currentStage === 'lifestyle') {
    progress += 25
    if (currentStage === 'lifestyle') nextStage = 'analysis'
  }
  
  // Analysis (10%)
  if (currentStage === 'analysis') {
    progress += 10
    nextStage = 'complete'
  }
  
  return { progress: Math.min(progress, 100), nextStage }
}