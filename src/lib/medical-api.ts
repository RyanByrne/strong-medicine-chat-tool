// Medical API Integration Layer
// This module provides integration with medical databases and APIs for enhanced screening

export interface MedicalCondition {
  name: string
  description: string
  symptoms: string[]
  category: string
  severity: 'low' | 'medium' | 'high'
}

export interface SpecialistRecommendation {
  specialty: string
  reason: string
  urgency: 'routine' | 'soon' | 'urgent'
  description: string
}

export interface MedicalInsight {
  condition: string
  likelihood: number
  reasoning: string
  recommendations: string[]
}

// Mock medical database for demonstration
const MEDICAL_CONDITIONS: MedicalCondition[] = [
  {
    name: "Thyroid Dysfunction",
    description: "Imbalance in thyroid hormone production affecting metabolism",
    symptoms: ["fatigue", "weight changes", "brain fog", "temperature sensitivity"],
    category: "Endocrine",
    severity: "medium"
  },
  {
    name: "Adrenal Fatigue",
    description: "Chronic stress leading to adrenal gland dysfunction",
    symptoms: ["fatigue", "stress", "anxiety", "sleep issues", "brain fog"],
    category: "Endocrine",
    severity: "medium"
  },
  {
    name: "Gut Dysbiosis",
    description: "Imbalance in gut microbiome affecting digestion and immunity",
    symptoms: ["bloating", "constipation", "diarrhea", "fatigue", "brain fog"],
    category: "Digestive",
    severity: "medium"
  },
  {
    name: "Chronic Inflammation",
    description: "Systemic inflammation affecting multiple body systems",
    symptoms: ["pain", "fatigue", "brain fog", "mood changes"],
    category: "Immune",
    severity: "high"
  },
  {
    name: "Nutrient Deficiencies",
    description: "Deficiencies in essential vitamins and minerals",
    symptoms: ["fatigue", "weakness", "brain fog", "mood changes"],
    category: "Nutritional",
    severity: "low"
  }
]

const SPECIALIST_DATABASE = {
  "Endocrine": {
    specialty: "Functional Medicine Endocrinologist",
    description: "Specialists in hormone optimization and metabolic health"
  },
  "Digestive": {
    specialty: "Gastroenterologist / Functional Medicine Practitioner",
    description: "Experts in gut health and digestive system disorders"
  },
  "Immune": {
    specialty: "Functional Medicine Practitioner / Rheumatologist",
    description: "Specialists in immune system dysfunction and autoimmune conditions"
  },
  "Nutritional": {
    specialty: "Functional Nutritionist / Registered Dietitian",
    description: "Experts in nutritional therapy and supplement protocols"
  },
  "Mental Health": {
    specialty: "Integrative Psychiatrist / Functional Medicine Practitioner",
    description: "Specialists in mental health with functional medicine approach"
  }
}

export class MedicalAPIService {
  private apiKey: string | undefined
  private baseUrl: string | undefined

  constructor() {
    this.apiKey = process.env.MEDICAL_API_KEY
    this.baseUrl = process.env.MEDICAL_API_URL
  }

  /**
   * Analyze symptoms and return potential conditions
   */
  async analyzeSymptoms(symptoms: string[]): Promise<MedicalInsight[]> {
    // In production, this would call a real medical API
    // For now, we'll use pattern matching with our mock database
    
    const insights: MedicalInsight[] = []
    
    MEDICAL_CONDITIONS.forEach(condition => {
      const matchingSymptoms = condition.symptoms.filter(symptom => 
        symptoms.some(userSymptom => 
          userSymptom.toLowerCase().includes(symptom.toLowerCase()) ||
          symptom.toLowerCase().includes(userSymptom.toLowerCase())
        )
      )
      
      if (matchingSymptoms.length > 0) {
        const likelihood = (matchingSymptoms.length / condition.symptoms.length) * 100
        
        insights.push({
          condition: condition.name,
          likelihood: Math.round(likelihood),
          reasoning: `Based on ${matchingSymptoms.length} matching symptoms: ${matchingSymptoms.join(', ')}`,
          recommendations: this.generateRecommendations(condition)
        })
      }
    })
    
    return insights.sort((a, b) => b.likelihood - a.likelihood)
  }

  /**
   * Get specialist recommendations based on conditions
   */
  async getSpecialistRecommendations(insights: MedicalInsight[]): Promise<SpecialistRecommendation[]> {
    const recommendations: SpecialistRecommendation[] = []
    const categories = new Set<string>()
    
    // Find the categories of top conditions
    insights.slice(0, 3).forEach(insight => {
      const condition = MEDICAL_CONDITIONS.find(c => c.name === insight.condition)
      if (condition) {
        categories.add(condition.category)
      }
    })
    
    // Add general functional medicine recommendation
    recommendations.push({
      specialty: "Functional Medicine Practitioner",
      reason: "Comprehensive root-cause analysis and personalized treatment plan",
      urgency: "routine",
      description: "A functional medicine practitioner can provide a holistic assessment and create an integrated treatment approach addressing all your health concerns."
    })
    
    // Add category-specific specialists
    categories.forEach(category => {
      const specialist = SPECIALIST_DATABASE[category as keyof typeof SPECIALIST_DATABASE]
      if (specialist) {
        recommendations.push({
          specialty: specialist.specialty,
          reason: `Specialized care for ${category.toLowerCase()} conditions`,
          urgency: "soon",
          description: specialist.description
        })
      }
    })
    
    return recommendations
  }

  /**
   * Check for drug interactions (mock implementation)
   */
  async checkDrugInteractions(medications: string[]): Promise<string[]> {
    // In production, this would call a drug interaction API
    const warnings: string[] = []
    
    if (medications.length > 2) {
      warnings.push("Multiple medications detected - recommend reviewing with pharmacist for potential interactions")
    }
    
    return warnings
  }

  /**
   * Get lifestyle recommendations based on symptoms and conditions
   */
  async getLifestyleRecommendations(patientData: any): Promise<string[]> {
    const recommendations: string[] = []
    
    // Stress management
    if (patientData.lifestyle.stress_level === 'high' || 
        patientData.symptoms.includes('anxiety') || 
        patientData.symptoms.includes('stress')) {
      recommendations.push("Implement stress reduction techniques: meditation, deep breathing, or yoga")
      recommendations.push("Consider adaptogenic herbs like ashwagandha or rhodiola (consult practitioner)")
    }
    
    // Sleep optimization
    if (patientData.lifestyle.sleep_quality === 'poor' || 
        patientData.symptoms.includes('insomnia') ||
        patientData.symptoms.includes('fatigue')) {
      recommendations.push("Optimize sleep hygiene: consistent bedtime, dark room, no screens 2 hours before bed")
      recommendations.push("Consider magnesium supplementation for sleep support (consult practitioner)")
    }
    
    // Digestive health
    if (patientData.symptoms.some((s: string) => ['bloating', 'constipation', 'diarrhea'].includes(s))) {
      recommendations.push("Support digestive health with fermented foods and fiber-rich vegetables")
      recommendations.push("Consider elimination diet to identify food sensitivities")
      recommendations.push("Stay hydrated and consider digestive enzymes with meals")
    }
    
    // Energy and fatigue
    if (patientData.symptoms.includes('fatigue') || patientData.symptoms.includes('brain fog')) {
      recommendations.push("Support mitochondrial health with CoQ10 and B-complex vitamins")
      recommendations.push("Maintain stable blood sugar with balanced meals every 3-4 hours")
      recommendations.push("Get morning sunlight exposure to support circadian rhythm")
    }
    
    // General recommendations
    recommendations.push("Focus on nutrient-dense, whole foods diet")
    recommendations.push("Incorporate gentle movement like walking or swimming")
    recommendations.push("Stay hydrated with filtered water")
    
    return recommendations
  }

  private generateRecommendations(condition: MedicalCondition): string[] {
    const recommendations: string[] = []
    
    switch (condition.category) {
      case "Endocrine":
        recommendations.push("Comprehensive hormone panel testing")
        recommendations.push("Evaluate stress management and sleep quality")
        recommendations.push("Consider adaptogenic herb protocols")
        break
      case "Digestive":
        recommendations.push("Comprehensive stool analysis")
        recommendations.push("Food sensitivity testing")
        recommendations.push("Probiotic and prebiotic supplementation")
        break
      case "Immune":
        recommendations.push("Inflammatory marker testing (CRP, ESR)")
        recommendations.push("Autoimmune panel if indicated")
        recommendations.push("Anti-inflammatory diet protocol")
        break
      case "Nutritional":
        recommendations.push("Comprehensive nutrient panel")
        recommendations.push("Targeted supplementation protocol")
        recommendations.push("Dietary optimization consultation")
        break
    }
    
    return recommendations
  }
}

// Export singleton instance
export const medicalAPI = new MedicalAPIService()