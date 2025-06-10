'use client'

import { useState } from 'react'
import ChatInterface from '@/components/ChatInterface'
import WelcomeScreen from '@/components/WelcomeScreen'

export default function HomePage() {
  const [hasStarted, setHasStarted] = useState(false)

  const handleStartScreening = () => {
    setHasStarted(true)
  }

  return (
    <main className="min-h-screen">
      {!hasStarted ? (
        <WelcomeScreen onStart={handleStartScreening} />
      ) : (
        <ChatInterface />
      )}
    </main>
  )
}