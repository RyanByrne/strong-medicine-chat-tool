import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Patient Onboarding - Strong Medicine',
  description: 'Begin your personalized health journey with Strong Medicine. Our AI assistant helps Dr. Johnson understand your unique needs to create a custom treatment plan.',
  keywords: 'patient onboarding, functional medicine, personalized health, Dr. Johnson, Strong Medicine',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30">
          {children}
        </div>
      </body>
    </html>
  )
}