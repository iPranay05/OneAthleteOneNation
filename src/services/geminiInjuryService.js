import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiInjuryService {
  constructor() {
    // Initialize Gemini Flash (you'll need to add your API key to .env)
    this.genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  /**
   * Analyze injury risk based on athlete data
   */
  async analyzeInjuryRisk(athleteData) {
    try {
      const prompt = `
        As a sports medicine AI assistant, analyze the injury risk for this athlete:
        
        Athlete Profile:
        - Name: ${athleteData.name}
        - Sport: ${athleteData.sport}
        - Disability: ${athleteData.disability}
        - Age: ${athleteData.age || 'Not specified'}
        - Training Intensity: ${athleteData.trainingIntensity || 'Moderate'}
        - Recent Performance: ${athleteData.performance}%
        - Workouts Completed: ${athleteData.workoutsCompleted}
        - Last Active: ${athleteData.lastActive}
        
        Previous Injuries: ${JSON.stringify(athleteData.previousInjuries || [])}
        Current Symptoms: ${JSON.stringify(athleteData.currentSymptoms || [])}
        Training Load: ${athleteData.trainingLoad || 'Normal'}
        
        Please provide:
        1. Overall injury risk level (Low/Medium/High)
        2. Specific risk factors identified
        3. Recommended prevention strategies
        4. Warning signs to monitor
        5. Suggested modifications to training
        
        Format as JSON with these keys: riskLevel, riskFactors, preventionStrategies, warningSigns, trainingModifications
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Try to parse JSON response, fallback to structured text
      try {
        return JSON.parse(text);
      } catch {
        return this.parseTextResponse(text);
      }
    } catch (error) {
      console.error('Gemini injury analysis error:', error);
      return this.getFallbackAnalysis(athleteData);
    }
  }

  /**
   * Generate injury prevention plan
   */
  async generatePreventionPlan(athleteData, riskAnalysis) {
    try {
      const prompt = `
        Create a comprehensive injury prevention plan for this athlete:
        
        Athlete: ${athleteData.name}
        Sport: ${athleteData.sport}
        Disability: ${athleteData.disability}
        Risk Level: ${riskAnalysis.riskLevel}
        
        Risk Factors: ${riskAnalysis.riskFactors?.join(', ')}
        
        Create a 4-week injury prevention plan including:
        1. Daily warm-up routines (5-10 minutes)
        2. Strength training exercises (2-3 times/week)
        3. Flexibility/mobility work (daily)
        4. Recovery protocols
        5. Nutrition recommendations
        6. Sleep optimization tips
        7. Disability-specific adaptations
        
        Format as JSON with weekly breakdown and daily activities.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        return JSON.parse(text);
      } catch {
        return this.parsePreventionPlan(text);
      }
    } catch (error) {
      console.error('Gemini prevention plan error:', error);
      return this.getFallbackPreventionPlan(athleteData);
    }
  }

  /**
   * Analyze injury symptoms and provide recommendations
   */
  async analyzeSymptoms(symptoms, athleteData) {
    try {
      const prompt = `
        As a sports medicine AI, analyze these symptoms for an athlete:
        
        Athlete: ${athleteData.name}
        Sport: ${athleteData.sport}
        Disability: ${athleteData.disability}
        
        Symptoms reported:
        ${symptoms.map(s => `- ${s.area}: ${s.description} (Severity: ${s.severity}/10, Duration: ${s.duration})`).join('\n')}
        
        Provide:
        1. Urgency level (Immediate/Urgent/Monitor/Normal)
        2. Possible conditions
        3. Immediate care recommendations
        4. When to seek medical attention
        5. Return-to-play guidelines
        6. Disability-specific considerations
        
        Format as JSON with keys: urgency, possibleConditions, immediateCare, seekMedicalAttention, returnToPlay, disabilityConsiderations
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        return JSON.parse(text);
      } catch {
        return this.parseSymptomAnalysis(text);
      }
    } catch (error) {
      console.error('Gemini symptom analysis error:', error);
      return this.getFallbackSymptomAnalysis(symptoms);
    }
  }

  /**
   * Generate recovery protocol
   */
  async generateRecoveryProtocol(injuryData, athleteData) {
    try {
      const prompt = `
        Create a recovery protocol for this injury:
        
        Athlete: ${athleteData.name}
        Sport: ${athleteData.sport}
        Disability: ${athleteData.disability}
        
        Injury Details:
        - Type: ${injuryData.type}
        - Severity: ${injuryData.severity}
        - Location: ${injuryData.location}
        - Date of Injury: ${injuryData.date}
        
        Create a phased recovery plan:
        Phase 1: Acute (Days 1-3)
        Phase 2: Early Recovery (Days 4-14)
        Phase 3: Progressive Loading (Weeks 2-4)
        Phase 4: Return to Sport (Weeks 4-6)
        
        Include for each phase:
        - Goals and objectives
        - Recommended activities
        - Restrictions
        - Progress markers
        - Disability adaptations
        
        Format as JSON with phase breakdown.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        return JSON.parse(text);
      } catch {
        return this.parseRecoveryProtocol(text);
      }
    } catch (error) {
      console.error('Gemini recovery protocol error:', error);
      return this.getFallbackRecoveryProtocol(injuryData);
    }
  }

  // Fallback methods for when Gemini is unavailable
  parseTextResponse(text) {
    return {
      riskLevel: 'Medium',
      riskFactors: ['Unable to analyze - please check with medical professional'],
      preventionStrategies: ['Regular warm-up', 'Proper hydration', 'Adequate rest'],
      warningSigns: ['Persistent pain', 'Swelling', 'Reduced range of motion'],
      trainingModifications: ['Reduce intensity by 20%', 'Focus on technique']
    };
  }

  getFallbackAnalysis(athleteData) {
    const riskLevel = athleteData.performance < 70 ? 'High' : 
                     athleteData.performance < 85 ? 'Medium' : 'Low';
    
    return {
      riskLevel,
      riskFactors: ['Performance decline detected', 'Training load assessment needed'],
      preventionStrategies: ['Regular monitoring', 'Proper warm-up protocols'],
      warningSigns: ['Pain during activity', 'Decreased performance'],
      trainingModifications: ['Monitor training intensity', 'Include recovery days']
    };
  }

  parsePreventionPlan(text) {
    return {
      week1: {
        warmUp: ['5-minute light cardio', 'Dynamic stretching'],
        strength: ['Bodyweight exercises', 'Core strengthening'],
        flexibility: ['Static stretching', 'Foam rolling'],
        recovery: ['Adequate sleep', 'Hydration']
      },
      week2: {
        warmUp: ['Progressive warm-up', 'Sport-specific movements'],
        strength: ['Resistance training', 'Functional exercises'],
        flexibility: ['Yoga or stretching routine'],
        recovery: ['Active recovery days']
      }
    };
  }

  getFallbackPreventionPlan(athleteData) {
    return {
      duration: '4 weeks',
      focus: 'Injury prevention and performance optimization',
      dailyRoutine: {
        warmUp: '10-minute dynamic warm-up',
        mainActivity: 'Sport-specific training with proper form',
        coolDown: '10-minute stretching and recovery'
      },
      weeklySchedule: {
        strength: '2-3 sessions per week',
        cardio: '3-4 sessions per week',
        recovery: '1-2 complete rest days'
      }
    };
  }

  parseSymptomAnalysis(text) {
    return {
      urgency: 'Monitor',
      possibleConditions: ['Overuse injury', 'Muscle strain'],
      immediateCare: ['Rest', 'Ice if swelling', 'Gentle movement'],
      seekMedicalAttention: 'If symptoms persist beyond 48 hours',
      returnToPlay: 'When pain-free and full range of motion restored'
    };
  }

  getFallbackSymptomAnalysis(symptoms) {
    const highSeverity = symptoms.some(s => s.severity >= 7);
    
    return {
      urgency: highSeverity ? 'Urgent' : 'Monitor',
      possibleConditions: ['Requires professional assessment'],
      immediateCare: ['Rest affected area', 'Apply ice if swelling'],
      seekMedicalAttention: highSeverity ? 'Seek immediate medical attention' : 'Monitor for 24-48 hours',
      returnToPlay: 'Only when cleared by medical professional'
    };
  }

  parseRecoveryProtocol(text) {
    return {
      phase1: {
        name: 'Acute Phase',
        duration: '1-3 days',
        goals: ['Reduce pain and inflammation'],
        activities: ['Rest', 'Ice therapy', 'Gentle range of motion']
      },
      phase2: {
        name: 'Early Recovery',
        duration: '4-14 days',
        goals: ['Restore range of motion'],
        activities: ['Progressive stretching', 'Light strengthening']
      }
    };
  }

  getFallbackRecoveryProtocol(injuryData) {
    return {
      totalDuration: '4-6 weeks',
      phases: [
        {
          name: 'Rest and Recovery',
          duration: '1 week',
          activities: ['Complete rest', 'Ice therapy', 'Medical consultation']
        },
        {
          name: 'Gradual Return',
          duration: '2-3 weeks',
          activities: ['Light activity', 'Physical therapy', 'Strength building']
        },
        {
          name: 'Return to Sport',
          duration: '1-2 weeks',
          activities: ['Sport-specific training', 'Performance testing', 'Full clearance']
        }
      ]
    };
  }
}

export default new GeminiInjuryService();
