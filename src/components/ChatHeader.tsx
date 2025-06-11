'use client'

interface ChatHeaderProps {
  progress: number
  currentStage: string
  onGenerateReport: () => void
  showGenerateReport: boolean
}

export default function ChatHeader({ progress, currentStage, onGenerateReport, showGenerateReport }: ChatHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo and title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent to-primary-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-heading font-bold text-gray-900">
                Strong Medicine
              </h1>
              <p className="text-sm text-gray-600">Patient Onboarding</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Progress indicator */}
            <div className="hidden md:flex items-center gap-3">
              <span className="text-sm text-gray-600">Progress:</span>
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-accent to-primary-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm font-medium text-accent">{Math.round(progress)}%</span>
            </div>

            {/* Generate Report Button */}
            {showGenerateReport && (
              <button
                onClick={onGenerateReport}
                className="btn-primary text-sm px-4 py-2"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Report
              </button>
            )}

            {/* Return to main site */}
            <a
              href={process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'http://localhost:3000'}
              className="text-sm text-gray-600 hover:text-accent transition-colors"
            >
              ← Back to Strong Medicine
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}