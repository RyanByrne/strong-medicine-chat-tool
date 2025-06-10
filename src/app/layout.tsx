import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Medical Screening Tool - Strong Medicine',
  description: 'Intelligent medical screening and assessment tool to help identify potential health concerns and connect you with the right specialists.',
  keywords: 'medical screening, health assessment, AI diagnosis, functional medicine, health analysis',
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