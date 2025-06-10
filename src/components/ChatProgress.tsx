'use client'

interface ChatProgressProps {
  progress: number
  currentStage: string
}

const STAGES = [
  { key: 'demographics', label: 'Basic Info', icon: '👤' },
  { key: 'symptoms', label: 'Symptoms', icon: '🩺' },
  { key: 'history', label: 'Medical History', icon: '📋' },
  { key: 'lifestyle', label: 'Lifestyle', icon: '🏃‍♂️' },
  { key: 'analysis', label: 'Analysis', icon: '🔬' },
  { key: 'complete', label: 'Complete', icon: '✅' }
]

export default function ChatProgress({ progress, currentStage }: ChatProgressProps) {
  const currentStageIndex = STAGES.findIndex(stage => stage.key === currentStage)
  
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-heading font-semibold text-gray-900">
          Health Screening Progress
        </h3>
        <span className="text-sm font-medium text-accent">
          {Math.round(progress)}% Complete
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
        <div 
          className="bg-gradient-to-r from-accent to-primary-600 h-3 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Stage indicators */}
      <div className="flex justify-between items-center">
        {STAGES.map((stage, index) => {
          const isCompleted = index < currentStageIndex
          const isCurrent = index === currentStageIndex
          const isUpcoming = index > currentStageIndex
          
          return (
            <div key={stage.key} className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium mb-2 transition-all duration-300 ${
                isCompleted 
                  ? 'bg-accent text-white' 
                  : isCurrent 
                    ? 'bg-primary-100 text-accent ring-2 ring-accent' 
                    : 'bg-gray-200 text-gray-400'
              }`}>
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  stage.icon
                )}
              </div>
              <span className={`text-xs font-medium ${
                isCurrent ? 'text-accent' : 'text-gray-500'
              }`}>
                {stage.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}