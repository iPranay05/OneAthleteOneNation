// Enhanced AI Assistant Service with fallbacks and error handling
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

class AIAssistantService {
  constructor() {
    this.isConfigured = false;
    this.retryCount = 0;
    this.maxRetries = 3;
    this.fallbackResponses = new Map();
    this.initializeFallbacks();
  }

  initialize() {
    this.isConfigured = !!GEMINI_API_KEY;
    
    if (!this.isConfigured) {
      console.warn('⚠️ Gemini API key not configured - using fallback responses');
    } else {
      console.log('✅ AI Assistant Service initialized with Gemini API');
    }
    
    return this.isConfigured;
  }

  initializeFallbacks() {
    // Fallback responses for common commands when API is unavailable
    this.fallbackResponses.set('workout', 'You can view your assigned workouts, start a new workout, or generate a custom workout plan.');
    this.fallbackResponses.set('progress', 'Check your progress to see workout statistics, step count, and achievement tracking.');
    this.fallbackResponses.set('profile', 'Your profile contains personal information and recent activity updates.');
    this.fallbackResponses.set('chatbot', 'The chatbot can help with training advice, nutrition guidance, and injury prevention.');
    this.fallbackResponses.set('marketplace', 'Browse adaptive sports equipment or list your own equipment for sale or rent.');
    this.fallbackResponses.set('knowledge', 'Access government schemes, athlete rights information, and tournament details.');
    this.fallbackResponses.set('funding', 'Explore funding opportunities, sponsorship advice, and financial guidance for athletes.');
    this.fallbackResponses.set('navigation', 'You can navigate to different sections using voice commands like "go to workouts" or "open profile".');
    this.fallbackResponses.set('help', 'I can help you navigate the app, read screen content, and access various features. Try saying "read screen" or "show workouts".');
    this.fallbackResponses.set('screen', 'This screen contains information and options relevant to your current activity.');
  }

  async processWithGemini(userInput, context = {}) {
    // Validate API configuration
    if (!this.isConfigured) {
      return this.getFallbackResponse(userInput, context);
    }

    const prompt = this.buildPrompt(userInput, context);

    try {
      const response = await this.callGeminiAPI(prompt);
      this.retryCount = 0; // Reset retry count on success
      return response;
    } catch (error) {
      console.error('Gemini API error:', error);
      
      // Retry logic
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(`🔄 Retrying Gemini API (${this.retryCount}/${this.maxRetries})`);
        
        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * this.retryCount));
        return this.processWithGemini(userInput, context);
      } else {
        console.log('📱 Falling back to local responses');
        this.retryCount = 0;
        return this.getFallbackResponse(userInput, context);
      }
    }
  }

  buildPrompt(userInput, context) {
    const contextInfo = [];
    
    if (context.screenName) {
      contextInfo.push(`Current screen: ${context.screenName}`);
    }
    
    if (context.screenData) {
      if (context.screenData.assignedWorkouts?.length) {
        contextInfo.push(`${context.screenData.assignedWorkouts.length} assigned workouts available`);
      }
      if (context.screenData.todaySteps) {
        contextInfo.push(`${context.screenData.todaySteps} steps completed today`);
      }
      if (context.screenData.currentTab) {
        contextInfo.push(`currently viewing ${context.screenData.currentTab} tab`);
      }
      if (context.screenData.messageCount) {
        contextInfo.push(`${context.screenData.messageCount} unread messages`);
      }
    }
    
    if (context.userProfile) {
      const profile = [];
      if (context.userProfile.sport) profile.push(`athlete sport: ${context.userProfile.sport}`);
      if (context.userProfile.disability) profile.push(`accessibility needs: ${context.userProfile.disability}`);
      if (context.userProfile.name) profile.push(`user name: ${context.userProfile.name}`);
      if (profile.length > 0) {
        contextInfo.push(`user info: ${profile.join(', ')}`);
      }
    }

    // Enhanced prompt for continuous, conversational assistance
    return `You are an AI voice assistant specifically designed for blind and visually impaired athletes using the OneNationOneAthlete app. You provide continuous, real-time assistance similar to how Google Assistant or Alexa works.

Your role:
- Act as a helpful, encouraging companion
- Provide clear, actionable guidance
- Be conversational and natural
- Focus on accessibility and ease of use
- Give specific instructions for navigation and app features

Current context: ${contextInfo.join('. ')}

User said: "${userInput}"

Provide a helpful, conversational response. Be specific about what they can do next. If they're asking about navigation, give clear step-by-step guidance. If they need information, read it clearly from the context.

Keep responses natural and under 60 words. Be encouraging and supportive.`;
  }

  async callGeminiAPI(prompt) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            maxOutputTokens: 150,
            temperature: 0.7
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response candidates from Gemini API');
      }

      const result = data.candidates[0]?.content?.parts[0]?.text;
      
      if (!result) {
        throw new Error('Empty response from Gemini API');
      }

      return result.trim();
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - API took too long to respond');
      }
      
      throw error;
    }
  }

  getFallbackResponse(userInput, context = {}) {
    const lowerInput = userInput.toLowerCase();
    
    // Try to match with fallback responses
    for (const [key, response] of this.fallbackResponses) {
      if (lowerInput.includes(key)) {
        return this.personalizeResponse(response, context);
      }
    }

    // Generate context-aware response
    if (context.screenName) {
      const screenResponses = {
        'Workout': 'You are on the workout screen. Here you can view assigned workouts, start exercises, or generate new workout plans.',
        'Progress': 'You are on the progress screen. This shows your workout statistics, step count, and fitness achievements.',
        'Profile': 'You are on your profile screen. You can view and edit your personal information and activity updates.',
        'Chatbot': 'You are on the chatbot screen. Ask me about training, nutrition, injury prevention, or career guidance.',
        'EquipmentMarketplace': 'You are on the equipment marketplace. Browse adaptive sports equipment or list items for sale.',
        'KnowledgeHub': 'You are on the knowledge hub. Access government schemes, athlete rights, and tournament information.',
        'FundingHub': 'You are on the funding hub. Explore financial opportunities and sponsorship advice for athletes.'
      };
      
      const screenResponse = screenResponses[context.screenName];
      if (screenResponse) {
        return screenResponse;
      }
    }

    // Generic helpful response
    return 'I\'m here to help you navigate the app and access information. Try asking about workouts, progress, or saying "read screen" for current content.';
  }

  personalizeResponse(response, context) {
    let personalizedResponse = response;
    
    // Add context-specific information
    if (context.screenData) {
      if (context.screenData.assignedWorkouts?.length) {
        personalizedResponse += ` You currently have ${context.screenData.assignedWorkouts.length} assigned workouts.`;
      }
      if (context.screenData.todaySteps) {
        personalizedResponse += ` You've taken ${context.screenData.todaySteps} steps today.`;
      }
    }
    
    return personalizedResponse;
  }

  // Quick response methods for common scenarios
  async getNavigationHelp(currentScreen) {
    const context = { screenName: currentScreen };
    return this.processWithGemini('help me navigate', context);
  }

  async getScreenDescription(screenName, screenData) {
    const context = { screenName, screenData };
    return this.processWithGemini('describe this screen', context);
  }

  async getWorkoutGuidance(userProfile) {
    const context = { userProfile };
    return this.processWithGemini('help me with my workout', context);
  }

  // Service status
  getStatus() {
    return {
      isConfigured: this.isConfigured,
      hasAPIKey: !!GEMINI_API_KEY,
      fallbackCount: this.fallbackResponses.size,
      retryCount: this.retryCount
    };
  }
}

export default new AIAssistantService();