'use client'

import { useState, useRef, useEffect } from 'react'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import ChatProgress from './ChatProgress'
import ChatHeader from './ChatHeader'

export interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  isLoading?: boolean
}

export interface PatientData {
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

const INITIAL_MESSAGE: Message = {
  id: '1',
  type: 'assistant',
  content: "Welcome! I'm your Strong Medicine onboarding assistant. I'll guide you through a personalized assessment that Dr. Johnson will review to create your custom health plan. This information helps us understand your unique needs and match you with the right approach. Let's start with the basics - what's your name, age, and gender?",
  timestamp: new Date()
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [patientData, setPatientData] = useState<PatientData>({
    demographics: {},
    symptoms: [],
    medicalHistory: [],
    currentMedications: [],
    lifestyle: {},
    concerns: []
  })
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStage, setCurrentStage] = useState('demographics')
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    // Add loading message
    const loadingMessage: Message = {
      id: Date.now().toString() + '_loading',
      type: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true
    }
    
    setMessages(prev => [...prev, loadingMessage])

    try {
      // Call AI API for response
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          patientData,
          messageHistory: messages,
          currentStage
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      
      // Remove loading message and add actual response
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isLoading)
        return [...filtered, {
          id: Date.now().toString(),
          type: 'assistant',
          content: data.message,
          timestamp: new Date()
        }]
      })

      // Update patient data and progress
      if (data.updatedPatientData) {
        setPatientData(data.updatedPatientData)
      }
      
      if (data.progress !== undefined) {
        setProgress(data.progress)
      }
      
      if (data.currentStage) {
        setCurrentStage(data.currentStage)
      }

    } catch (error) {
      console.error('Error sending message:', error)
      
      // Remove loading message and show error
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isLoading)
        return [...filtered, {
          id: Date.now().toString(),
          type: 'assistant',
          content: "I apologize, but I'm having trouble processing your response right now. Could you please try again?",
          timestamp: new Date()
        }]
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateReport = async () => {
    try {
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientData,
          messageHistory: messages
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate report')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = 'health-screening-report.pdf'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Failed to generate report. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30">
      <ChatHeader 
        progress={progress} 
        currentStage={currentStage}
        onGenerateReport={handleGenerateReport}
        showGenerateReport={progress >= 90}
      />
      
      <div className="container-custom py-8">
        <div className="max-w-4xl mx-auto">
          <ChatProgress progress={progress} currentStage={currentStage} />
          
          <div className="card mt-8 p-0 overflow-hidden">
            {/* Messages Container */}
            <div className="h-96 md:h-[500px] overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input Container */}
            <div className="border-t border-gray-200 p-6">
              <ChatInput 
                onSendMessage={handleSendMessage} 
                disabled={isLoading}
                placeholder={isLoading ? "Analyzing your response..." : "Type your response..."}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}