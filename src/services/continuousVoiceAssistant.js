// Continuous Voice Assistant Service for Blind Users
// Always-on voice companion that provides real-time assistance
// Uses text input fallback when native voice recognition is unavailable

import { Alert, PermissionsAndroid, Platform } from 'react-native';
import ttsService from './tts';
import aiAssistant from './aiAssistant';
import permissionService from './permissions';

// Try to import Voice, but handle gracefully if not available
let Voice = null;
let voiceImportError = null;
let voiceLibraryAvailable = false;

try {
  console.log('🔍 DEBUG: Attempting to import @react-native-voice/voice');
  const VoiceModule = require('@react-native-voice/voice');
  console.log('🔍 DEBUG: Voice module imported successfully:', !!VoiceModule);
  console.log('🔍 DEBUG: Voice module type:', typeof VoiceModule);
  
  if (VoiceModule) {
    console.log('🔍 DEBUG: Voice module keys:', Object.keys(VoiceModule || {}));
    
    // Try to access the default export
    Voice = VoiceModule.default || VoiceModule;
    console.log('🔍 DEBUG: Voice default export exists:', !!Voice);
    console.log('🔍 DEBUG: Voice type:', typeof Voice);
    
    if (Voice && typeof Voice === 'object') {
      console.log('🔍 DEBUG: Voice object methods:', Object.keys(Voice));
      
      // Check if critical methods exist
      const criticalMethods = ['isAvailable', 'start', 'stop', 'destroy'];
      const methodsExist = criticalMethods.map(method => ({
        method,
        exists: typeof Voice[method] === 'function'
      }));
      console.log('🔍 DEBUG: Critical methods check:', methodsExist);
      
      // Test if Voice is truly functional
      if (typeof Voice.isAvailable === 'function') {
        console.log('🔍 DEBUG: Voice.isAvailable method found');
        voiceLibraryAvailable = true;
      } else {
        console.log('❌ DEBUG: Voice.isAvailable method missing');
        Voice = null;
      }
    } else {
      console.log('❌ DEBUG: Voice object is not valid');
      Voice = null;
    }
  } else {
    console.log('❌ DEBUG: VoiceModule is null/undefined');
  }
} catch (error) {
  voiceImportError = error;
  console.log('⚠️ Voice library import failed - using fallback mode');
  console.log('🔍 DEBUG: Voice import error:', error.message);
  console.log('🔍 DEBUG: Error stack:', error.stack);
}

class ContinuousVoiceAssistantService {
  constructor() {
    this.isActive = false;
    this.isListening = false;
    this.hasPermission = false;
    this.isInitialized = false;
    this.currentNavigation = null;
    this.currentScreen = '';
    this.userProfile = null;
    this.screenData = {};
    
    // Wake words and activation phrases
    this.wakeWords = ['hey assistant', 'voice assistant', 'help me', 'please'];
    this.navigationCommands = new Map();
    this.setupNavigationCommands();
    
    // Conversation state
    this.isInConversation = false;
    this.lastInteractionTime = 0;
    this.conversationTimeout = 30000; // 30 seconds
    
    // Voice settings optimized for continuous use
    this.voiceSettings = {
      language: 'en-US',
      rate: 0.7,
      pitch: 1.0
    };
  }

  setupNavigationCommands() {
    // Direct navigation commands
    this.navigationCommands.set('go to workout', 'Workout');
    this.navigationCommands.set('go to workouts', 'Workout');
    this.navigationCommands.set('open workout', 'Workout');
    this.navigationCommands.set('workout screen', 'Workout');
    
    this.navigationCommands.set('go to progress', 'Progress');
    this.navigationCommands.set('show progress', 'Progress');
    this.navigationCommands.set('progress screen', 'Progress');
    
    this.navigationCommands.set('go to profile', 'Profile');
    this.navigationCommands.set('open profile', 'Profile');
    this.navigationCommands.set('profile screen', 'Profile');
    this.navigationCommands.set('go home', 'Profile');
    
    this.navigationCommands.set('go to chatbot', 'Chatbot');
    this.navigationCommands.set('open chatbot', 'Chatbot');
    this.navigationCommands.set('chat screen', 'Chatbot');
    this.navigationCommands.set('talk to ai', 'Chatbot');
    
    this.navigationCommands.set('go to marketplace', 'EquipmentMarketplace');
    this.navigationCommands.set('open marketplace', 'EquipmentMarketplace');
    this.navigationCommands.set('equipment screen', 'EquipmentMarketplace');
    
    this.navigationCommands.set('go to knowledge', 'KnowledgeHub');
    this.navigationCommands.set('knowledge hub', 'KnowledgeHub');
    this.navigationCommands.set('learning screen', 'KnowledgeHub');
    
    this.navigationCommands.set('go to funding', 'FundingHub');
    this.navigationCommands.set('funding screen', 'FundingHub');
    this.navigationCommands.set('money help', 'FundingHub');
    
    this.navigationCommands.set('go back', 'BACK');
    this.navigationCommands.set('previous screen', 'BACK');
  }

  async initialize(navigation, userProfile) {
    try {
      console.log('🤖 Initializing Continuous Voice Assistant...');
      console.log('🔍 DEBUG: Voice library status:', Voice ? 'Available' : 'NULL');
      
      this.currentNavigation = navigation;
      this.userProfile = userProfile;
      
      // Request microphone permissions first
      console.log('🔍 DEBUG: Requesting microphone permissions...');
      const hasPermission = await this.requestMicrophonePermission();
      console.log('🔍 DEBUG: Permission result:', hasPermission);
      
      if (!hasPermission) {
        console.log('❌ DEBUG: Permission denied - showing error');
        await ttsService.speakError('Microphone permission is required for voice assistance. Please enable it in settings.');
        return false;
      }
      
      // Initialize services
      console.log('🔍 DEBUG: Initializing TTS and AI services...');
      await ttsService.initialize();
      aiAssistant.initialize();
      
      // Setup voice recognition (may fail on some devices)
      console.log('🔍 DEBUG: Setting up voice recognition...');
      const voiceAvailable = await this.setupVoiceRecognition();
      console.log('🔍 DEBUG: Voice setup result:', voiceAvailable);
      
      this.isInitialized = true;
      
      // Welcome the user
      console.log('🔍 DEBUG: Welcoming user...');
      await this.welcomeUser();
      
      // Only start continuous mode if voice is available
      if (voiceAvailable) {
        console.log('🔍 DEBUG: Starting continuous listening mode...');
        // Start continuous listening
        await this.startContinuousMode();
        console.log('✅ Continuous Voice Assistant ready!');
      } else {
        console.log('⚠️ Voice Assistant ready in manual mode only');
        await ttsService.speak('Voice assistant ready in manual mode. Use the voice button to speak commands.');
      }
      
      return true;
      
    } catch (error) {
      console.error('❌ Failed to initialize Continuous Voice Assistant:', error);
      console.error('🔍 DEBUG: Full error stack:', error.stack);
      await ttsService.speakError('Voice assistant setup failed. Using basic mode.');
      return false;
    }
  }

  async requestMicrophonePermission() {
    try {
      console.log('🔍 DEBUG: Requesting microphone permission...');
      
      // Use the existing permission service for better UX
      const hasPermission = await permissionService.requestPermissionWithExplanation();
      
      if (!hasPermission) {
        console.log('❌ DEBUG: Permission denied through permission service');
        this.hasPermission = false;
        return false;
      }
      
      // Double-check with direct Android API for confirmation
      if (Platform.OS === 'android') {
        const directCheck = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        );
        
        console.log('🔍 DEBUG: Direct permission check result:', directCheck);
        this.hasPermission = directCheck;
        
        if (!directCheck) {
          console.warn('⚠️ Permission service says granted but Android check failed');
          // Try one more direct request
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            {
              title: 'Voice Assistant Microphone Permission',
              message: 'Voice assistant needs microphone access to listen for commands and help you navigate the app.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          
          this.hasPermission = granted === PermissionsAndroid.RESULTS.GRANTED;
          console.log('🔍 DEBUG: Direct request result:', this.hasPermission);
        }
      } else {
        // iOS permissions are handled by Voice library
        this.hasPermission = true;
      }
      
      console.log(`🎤 Final microphone permission status: ${this.hasPermission ? 'Granted' : 'Denied'}`);
      return this.hasPermission;
      
    } catch (error) {
      console.error('❌ Permission request failed:', error);
      console.error('🔍 DEBUG: Permission error stack:', error.stack);
      this.hasPermission = false;
      
      // Show user-friendly error message
      Alert.alert(
        'Permission Error',
        'There was an issue requesting microphone permission. Voice features will use text input instead.',
        [{ text: 'OK' }]
      );
      
      return false;
    }
  }

  async setupVoiceRecognition() {
    try {
      console.log('🔍 DEBUG: Starting setupVoiceRecognition');
      console.log('🔍 DEBUG: voiceLibraryAvailable:', voiceLibraryAvailable);
      console.log('🔍 DEBUG: Voice object exists:', !!Voice);
      
      // Check if Voice library is available
      if (!voiceLibraryAvailable || !Voice) {
        console.log('📱 Voice library not available - using text input mode');
        if (voiceImportError) {
          console.log('🔍 DEBUG: Original import error:', voiceImportError.message);
        }
        return false;
      }
      
      console.log('🔍 DEBUG: Voice library exists, setting up event handlers');
      
      // Double-check Voice object before setting event handlers
      if (typeof Voice !== 'object' || !Voice) {
        console.error('❌ DEBUG: Voice object became null during setup');
        return false;
      }
      
      // Set up Voice library event handlers with error checking
      try {
        Voice.onSpeechStart = this.onSpeechStart.bind(this);
        Voice.onSpeechRecognized = this.onSpeechRecognized.bind(this);
        Voice.onSpeechEnd = this.onSpeechEnd.bind(this);
        Voice.onSpeechError = this.onSpeechError.bind(this);
        Voice.onSpeechResults = this.onSpeechResults.bind(this);
        console.log('🔍 DEBUG: Event handlers set successfully');
      } catch (handlerError) {
        console.error('❌ DEBUG: Failed to set event handlers:', handlerError);
        return false;
      }
      
      console.log('🔍 DEBUG: Checking voice availability...');
      console.log('🔍 DEBUG: Voice.isAvailable type:', typeof Voice.isAvailable);
      
      // Extra safety check before calling isAvailable
      if (typeof Voice.isAvailable !== 'function') {
        console.error('❌ DEBUG: Voice.isAvailable is not a function:', typeof Voice.isAvailable);
        return false;
      }
      
      // Check if voice recognition is available with extra safety
      let available = false;
      try {
        console.log('🔍 DEBUG: Calling Voice.isAvailable()...');
        
        // Extra safety check - test if Voice has the native binding
        if (Voice._nativeModule || Voice.NativeVoice) {
          console.log('🔍 DEBUG: Native voice module detected');
          available = await Voice.isAvailable();
        } else {
          console.log('⚠️ DEBUG: No native voice module - likely Expo Go environment');
          throw new Error('Native voice module not available');
        }
        
        console.log(`🎯 Voice recognition available: ${available}`);
      } catch (availabilityError) {
        console.log('⚠️ DEBUG: Voice.isAvailable() failed (expected in Expo Go):', availabilityError.message);
        console.log('📱 DEBUG: Falling back to text input mode');
        available = false;
      }
      
      if (!available) {
        console.warn('⚠️ Voice recognition not available on this device');
        return false;
      }
      
      console.log('✅ DEBUG: Voice setup completed successfully');
      return available;
    } catch (error) {
      console.error('❌ Voice setup error:', error);
      console.error('🔍 DEBUG: Voice setup error stack:', error.stack);
      console.error('🔍 DEBUG: Voice object type:', typeof Voice);
      console.error('🔍 DEBUG: Voice object keys:', Voice ? Object.keys(Voice) : 'N/A');
      console.error('🔍 DEBUG: voiceLibraryAvailable:', voiceLibraryAvailable);
      return false;
    }
  }

  async welcomeUser() {
    console.log('🎯 DEBUG: Checking voice availability for welcome message');
    console.log('🔍 DEBUG: Voice object exists:', !!Voice);
    console.log('🔍 DEBUG: voiceLibraryAvailable:', voiceLibraryAvailable);
    
    let isVoiceAvailable = false;
    
    // Use our safer voice availability check
    if (voiceLibraryAvailable && Voice) {
      try {
        console.log('🔍 DEBUG: Attempting to check voice availability safely...');
        if (typeof Voice.isAvailable === 'function') {
          // Extra safety check for native module
          if (Voice._nativeModule || Voice.NativeVoice) {
            console.log('🔍 DEBUG: Native module available, checking voice...');
            isVoiceAvailable = await Voice.isAvailable();
            console.log('🔍 DEBUG: Voice.isAvailable() result:', isVoiceAvailable);
          } else {
            console.log('📱 DEBUG: No native module - using fallback mode');
            isVoiceAvailable = false;
          }
        } else {
          console.log('🔍 DEBUG: Voice.isAvailable is not a function');
          isVoiceAvailable = false;
        }
      } catch (error) {
        console.log('📱 DEBUG: Voice availability check failed (expected in Expo Go):', error.message);
        isVoiceAvailable = false;
      }
    } else {
      console.log('🔍 DEBUG: Voice library not available - using fallback mode');
      isVoiceAvailable = false;
    }
    
    let welcomeMessage;
    if (isVoiceAvailable) {
      welcomeMessage = `Hello! I'm your voice assistant. I'm here to help you navigate the app. 
      You can say things like "go to workout screen", "read my progress", or "help me" at any time. 
      I'm listening continuously to assist you.`;
      console.log('✅ DEBUG: Using voice recognition mode');
    } else {
      welcomeMessage = `Hello! I'm your voice assistant. Voice recognition is not available in this environment, 
      but I can still help you! Tap the voice button to access quick commands and navigate the app easily. 
      I'll guide you with speech and provide the same helpful assistance.`;
      console.log('📱 DEBUG: Using text input fallback mode');
    }
    
    await ttsService.speak(welcomeMessage, { rate: 0.6 });
  }

  async startContinuousMode() {
    if (this.isActive) {
      console.log('⚠️ Continuous mode already active');
      return;
    }
    
    this.isActive = true;
    console.log('🔄 Starting continuous listening mode...');
    
    // Start the listening loop
    this.continuousListeningLoop();
  }

  async continuousListeningLoop() {
    if (!this.isActive) return;
    
    try {
      console.log('🔄 DEBUG: Starting continuous listening loop');
      console.log('🔍 DEBUG: voiceLibraryAvailable:', voiceLibraryAvailable);
      console.log('🔍 DEBUG: Voice exists:', !!Voice);
      
      // Check if Voice library is available
      if (!voiceLibraryAvailable || !Voice) {
        console.warn('⚠️ Voice library unavailable - using manual input mode');
        await ttsService.speak('Voice recognition unavailable. Use the voice button for manual input.');
        this.isActive = false; // Disable continuous mode
        return;
      }
      
      console.log('🔍 DEBUG: Checking voice availability in loop...');
      
      // Check if Voice is available before attempting to start
      let isAvailable = false;
      try {
        if (typeof Voice.isAvailable === 'function') {
          isAvailable = await Voice.isAvailable();
          console.log('🔍 DEBUG: Voice available in loop:', isAvailable);
        } else {
          console.error('❌ DEBUG: Voice.isAvailable not a function in loop');
          throw new Error('Voice.isAvailable is not available');
        }
      } catch (availError) {
        console.error('❌ DEBUG: Error checking availability in loop:', availError);
        console.warn('⚠️ Voice recognition not available, falling back to manual mode');
        await ttsService.speak('Voice recognition not available. Use the voice button for manual input.');
        this.isActive = false; // Disable continuous mode
        return;
      }
      
      if (!isAvailable) {
        console.warn('⚠️ Voice recognition not available, falling back to manual mode');
        await ttsService.speak('Voice recognition not available on this device. Use the voice button for manual input.');
        this.isActive = false; // Disable continuous mode
        return;
      }
      
      if (!this.isListening && this.hasPermission) {
        console.log('👂 Starting voice recognition...');
        this.isListening = true;
        
        try {
          // Use correct Voice API method
          await Voice.start('en-US');
          console.log('✅ DEBUG: Voice.start() successful');
          
          // Set timeout for this listening session
          setTimeout(() => {
            if (this.isListening) {
              this.restartListening();
            }
          }, 5000); // Listen for 5 seconds then restart
        } catch (startError) {
          console.error('❌ DEBUG: Voice.start() failed:', startError);
          this.isListening = false;
          throw startError;
        }
      }
    } catch (error) {
      console.error('❌ Continuous listening error:', error);
      this.isListening = false;
      
      // Check if this is a persistent Voice API issue
      if (error.message && (error.message.includes('null') || error.message.includes('isSpeechAvailable') || error.message.includes('isAvailable'))) {
        console.warn('⚠️ Voice API permanently unavailable - disabling continuous mode');
        await ttsService.speak('Voice recognition is not available in this environment. Use the voice button for manual text input.');
        this.isActive = false;
        return;
      }
      
      // For other errors, retry after a delay but limit retries
      if (!this.retryCount) this.retryCount = 0;
      this.retryCount++;
      
      if (this.retryCount < 3) {
        console.log(`🔄 DEBUG: Retrying continuous listening (attempt ${this.retryCount}/3)`);
        setTimeout(() => {
          if (this.isActive) {
            this.continuousListeningLoop();
          }
        }, 3000 * this.retryCount); // Exponential backoff
      } else {
        console.error('❌ Too many retry attempts - disabling continuous mode');
        await ttsService.speak('Voice recognition encountered too many errors. Use the voice button for manual input.');
        this.isActive = false;
      }
    }
  }

  async restartListening() {
    try {
      if (!Voice) {
        console.log('📱 Voice library not available');
        return;
      }
      
      if (this.isListening) {
        await Voice.stop();
      }
      this.isListening = false;
      
      // Restart after a brief pause
      setTimeout(() => {
        if (this.isActive) {
          this.continuousListeningLoop();
        }
      }, 1000);
      
    } catch (error) {
      console.error('❌ Restart listening error:', error);
      this.isListening = false;
    }
  }

  // Voice event handlers
  onSpeechStart(e) {
    console.log('🎤 Speech detection started');
  }

  onSpeechRecognized(e) {
    console.log('✅ Speech recognized');
  }

  onSpeechEnd(e) {
    console.log('🎤 Speech detection ended');
    this.isListening = false;
    
    // Restart listening loop
    setTimeout(() => {
      if (this.isActive) {
        this.continuousListeningLoop();
      }
    }, 1000);
  }

  onSpeechError(e) {
    console.error('❌ Speech error:', e.error);
    this.isListening = false;
    
    // Don't restart immediately on error, wait longer
    setTimeout(() => {
      if (this.isActive) {
        this.continuousListeningLoop();
      }
    }, 3000);
  }

  async onSpeechResults(e) {
    if (e.value && e.value.length > 0) {
      const transcript = e.value[0].toLowerCase().trim();
      console.log('🗣️ User said:', transcript);
      
      // Update last interaction time
      this.lastInteractionTime = Date.now();
      this.isInConversation = true;
      
      // Process the voice input
      await this.processVoiceInput(transcript);
      
      // Set conversation timeout
      setTimeout(() => {
        if (Date.now() - this.lastInteractionTime >= this.conversationTimeout) {
          this.isInConversation = false;
          console.log('💤 Conversation timeout - returning to passive listening');
        }
      }, this.conversationTimeout);
    }
  }

  async processVoiceInput(transcript) {
    try {
      // Check for wake words if not in conversation
      if (!this.isInConversation && !this.containsWakeWord(transcript)) {
        console.log('💤 No wake word detected, ignoring...');
        return;
      }
      
      // Remove wake words from transcript
      const cleanTranscript = this.removeWakeWords(transcript);
      
      // Check for direct navigation commands first
      const navigationHandled = await this.handleNavigationCommand(cleanTranscript);
      
      if (navigationHandled) {
        return; // Don't process with AI if navigation was handled
      }
      
      // Check for screen reading commands
      if (this.isScreenReadingCommand(cleanTranscript)) {
        await this.readCurrentScreen();
        return;
      }
      
      // Check for help commands
      if (this.isHelpCommand(cleanTranscript)) {
        await this.provideHelp();
        return;
      }
      
      // Process with AI for conversational responses
      await this.processWithAI(cleanTranscript);
      
    } catch (error) {
      console.error('❌ Voice processing error:', error);
      await ttsService.speakError('Sorry, I had trouble understanding that. Could you try again?');
    }
  }

  containsWakeWord(transcript) {
    return this.wakeWords.some(word => transcript.includes(word)) || 
           transcript.includes('please') ||
           transcript.includes('assistant');
  }

  removeWakeWords(transcript) {
    let cleaned = transcript;
    this.wakeWords.forEach(word => {
      cleaned = cleaned.replace(word, '').trim();
    });
    return cleaned.replace(/^please\s+/, '').trim();
  }

  async handleNavigationCommand(transcript) {
    console.log('🧭 Checking for navigation command:', transcript);
    
    // Check for exact matches first
    for (const [command, screen] of this.navigationCommands) {
      if (transcript.includes(command)) {
        if (screen === 'BACK') {
          this.currentNavigation.goBack();
          await ttsService.speakNavigation('Going back to previous screen');
        } else {
          this.currentNavigation.navigate(screen);
          await ttsService.speakNavigation(`Navigating to ${screen.replace(/([A-Z])/g, ' $1').trim()} screen`);
        }
        return true;
      }
    }
    
    return false;
  }

  isScreenReadingCommand(transcript) {
    return transcript.includes('read screen') || 
           transcript.includes('what\'s on screen') || 
           transcript.includes('describe screen') ||
           transcript.includes('where am i');
  }

  async readCurrentScreen() {
    await ttsService.readScreenData(this.screenData, this.currentScreen);
  }

  isHelpCommand(transcript) {
    return transcript.includes('help') || 
           transcript.includes('what can i do') || 
           transcript.includes('commands') ||
           transcript.includes('how to use');
  }

  async provideHelp() {
    const helpMessage = `I can help you navigate the app with voice commands. 
    Try saying: "go to workout screen", "read my progress", "open chatbot", 
    "read screen", or "go back". I'm always listening to assist you.`;
    
    await ttsService.speakInstruction(helpMessage);
  }

  async processWithAI(transcript) {
    try {
      console.log('🧠 Processing with AI:', transcript);
      
      const context = {
        screenName: this.currentScreen,
        userProfile: this.userProfile,
        screenData: this.screenData,
        navigation: this.currentNavigation,
        isBlindUser: true,
        isContinuousMode: true
      };
      
      const response = await aiAssistant.processWithGemini(transcript, context);
      
      // Speak the AI response
      await ttsService.speak(response, { rate: 0.6 });
      
    } catch (error) {
      console.error('❌ AI processing error:', error);
      await ttsService.speakError('I\'m having trouble processing that request. Please try rephrasing.');
    }
  }

  // Update context when screen changes
  updateContext(navigation, screenName, userProfile, screenData) {
    this.currentNavigation = navigation;
    this.currentScreen = screenName;
    this.userProfile = userProfile;
    this.screenData = screenData;
    
    // Announce screen change if assistant is active
    if (this.isActive) {
      setTimeout(async () => {
        await ttsService.announceScreen(screenName);
      }, 800); // Small delay to let screen transition complete
    }
  }

  async stopContinuousMode() {
    try {
      this.isActive = false;
      this.isInConversation = false;
      
      if (this.isListening && Voice) {
        await Voice.stop();
        this.isListening = false;
      }
      
      await ttsService.speak('Voice assistant paused. Tap the voice button to reactivate.');
      console.log('⏸️ Continuous voice assistant stopped');
      
    } catch (error) {
      console.error('❌ Error stopping continuous mode:', error);
    }
  }

  async toggleContinuousMode() {
    if (this.isActive) {
      await this.stopContinuousMode();
    } else {
      await this.startContinuousMode();
    }
  }

  // Emergency stop for when user needs silence
  async emergencyStop() {
    try {
      if (Voice) {
        await Voice.stop();
      }
      await ttsService.stop();
      
      this.isActive = false;
      this.isListening = false;
      this.isInConversation = false;
      
      console.log('🛑 Emergency stop activated');
      
    } catch (error) {
      console.error('❌ Emergency stop error:', error);
    }
  }

  // Status and control methods
  getStatus() {
    return {
      isActive: this.isActive,
      isListening: this.isListening,
      hasPermission: this.hasPermission,
      isInitialized: this.isInitialized,
      isInConversation: this.isInConversation,
      currentScreen: this.currentScreen,
      lastInteraction: this.lastInteractionTime
    };
  }

  isAssistantActive() {
    return this.isActive;
  }

  // Manual voice input for when continuous mode fails
  async startManualListening() {
    try {
      console.log('🔍 DEBUG: startManualListening called');
      
      if (!this.hasPermission) {
        console.log('❌ DEBUG: No microphone permission');
        await ttsService.speakError('Microphone permission required.');
        return false;
      }

      // Check if Voice API is available with enhanced debugging
      if (!voiceLibraryAvailable || !Voice) {
        console.log('📱 Voice library not available - using text input');
        return this.showTextInputFallback();
      }

      console.log('🔍 DEBUG: Checking voice availability for manual listening...');
      let isAvailable = false;
      try {
        if (typeof Voice.isAvailable === 'function') {
          // Extra safety check for native module
          if (Voice._nativeModule || Voice.NativeVoice) {
            console.log('🔍 DEBUG: Native module available for manual listening');
            isAvailable = await Voice.isAvailable();
            console.log('🔍 DEBUG: Manual voice available:', isAvailable);
          } else {
            console.log('📱 DEBUG: No native module for manual listening');
            throw new Error('Native voice module not available');
          }
        } else {
          console.log('❌ DEBUG: Voice.isAvailable not a function in manual mode');
          throw new Error('Voice API not functional');
        }
      } catch (availError) {
        console.log('📱 DEBUG: Voice availability check failed in manual mode (expected in Expo Go):', availError.message);
        return this.showTextInputFallback();
      }
      
      if (!isAvailable) {
        console.log('📱 Voice not available - fallback to text input');
        console.log('🔍 DEBUG: Microphone granted but Voice API unavailable (Expo Go)');
        return this.showTextInputFallback();
      }

      if (this.isListening) {
        console.log('🔍 DEBUG: Already listening, informing user');
        await ttsService.speak('Already listening...');
        return true;
      }

      console.log('🎙️ Starting manual voice input...');
      console.log('🔍 DEBUG: Permission status:', this.hasPermission);
      console.log('🔍 DEBUG: Voice available:', isAvailable);
      console.log('🔍 DEBUG: Voice library available:', voiceLibraryAvailable);
      
      this.isListening = true;
      
      try {
        console.log('🔍 DEBUG: Attempting Voice.start with en-US...');
        
        // Additional Android permission check for native module
        if (Platform.OS === 'android' && Voice._nativeModule) {
          try {
            console.log('🔍 DEBUG: Checking Android native module permissions...');
            // Some Android environments need explicit native permission check
            if (typeof Voice._nativeModule.checkPermission === 'function') {
              const nativePermission = await Voice._nativeModule.checkPermission();
              console.log('🔍 DEBUG: Native module permission check:', nativePermission);
            }
          } catch (nativeError) {
            console.log('📱 DEBUG: Native permission check failed (expected in some environments):', nativeError.message);
          }
        }
        
        await Voice.start('en-US');
        console.log('✅ DEBUG: Voice.start() successful - microphone should be active');
        await ttsService.speak('I\'m listening. Please speak your command.');
        console.log('✅ DEBUG: Manual voice listening started successfully');
      } catch (startError) {
        console.error('❌ DEBUG: Failed to start manual voice:', startError);
        console.error('🔍 DEBUG: Start error type:', typeof startError);
        console.error('🔍 DEBUG: Start error message:', startError.message);
        this.isListening = false;
        
        // Check if this is a permission issue
        if (startError.message && (startError.message.includes('permission') || startError.message.includes('Permission'))) {
          console.log('❌ DEBUG: Permission issue detected in Voice.start()');
          await ttsService.speakError('Microphone permission issue. Please check device settings.');
        } else {
          console.log('📱 DEBUG: Voice.start() failed - using text fallback');
        }
        
        return this.showTextInputFallback();
      }

      // Set timeout for manual listening with enhanced debugging
      console.log('🔍 DEBUG: Setting 8-second timeout for manual listening');
      setTimeout(async () => {
        if (this.isListening) {
          console.log('🔍 DEBUG: Manual listening timeout reached');
          try {
            await Voice.stop();
            console.log('🔍 DEBUG: Voice.stop() called on timeout');
          } catch (stopError) {
            console.error('❌ Error stopping voice on timeout:', stopError);
          }
          this.isListening = false;
          await ttsService.speak('Listening timeout. Please try again.');
        }
      }, 8000);

      console.log('✅ DEBUG: Manual listening setup complete');
      return true;

    } catch (error) {
      console.error('❌ Manual listening error:', error);
      console.error('🔍 DEBUG: Manual listening error stack:', error.stack);
      this.isListening = false;
      
      // Fallback to text input
      return this.showTextInputFallback();
    }
  }

  showTextInputFallback() {
    // Use React Native Alert as fallback
    const { Alert } = require('react-native');
    
    return new Promise((resolve) => {
      // First show a choice of common commands or custom input
      Alert.alert(
        '🎙️ Voice Assistant',
        'Choose a quick command or type a custom one:',
        [
          { text: 'Go to Workouts', onPress: () => this.processQuickCommand('go to workout screen', resolve) },
          { text: 'Read Progress', onPress: () => this.processQuickCommand('read my progress', resolve) },
          { text: 'Open Chatbot', onPress: () => this.processQuickCommand('open chatbot', resolve) },
          { text: 'Read Screen', onPress: () => this.processQuickCommand('read screen content', resolve) },
          { text: 'Custom Command', onPress: () => this.showCustomInput(resolve) },
          { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) }
        ]
      );
    });
  }

  async processQuickCommand(command, resolve) {
    await ttsService.speak(`Processing: ${command}`);
    await this.processVoiceInput(command.toLowerCase());
    resolve(true);
  }

  showCustomInput(resolve) {
    const { Alert } = require('react-native');
    
    Alert.prompt(
      '🎙️ Voice Assistant',
      'Type your voice command:',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
        {
          text: 'Submit',
          onPress: async (text) => {
            if (text && text.trim()) {
              await ttsService.speak(`Processing: ${text.trim()}`);
              await this.processVoiceInput(text.trim().toLowerCase());
              resolve(true);
            } else {
              resolve(false);
            }
          }
        }
      ],
      'plain-text',
      'Type your command here...'
    );
  }

  // Cleanup when app closes
  async destroy() {
    try {
      await this.stopContinuousMode();
      if (Voice) {
        await Voice.destroy();
      }
      console.log('🗑️ Continuous Voice Assistant destroyed');
    } catch (error) {
      console.error('❌ Destroy error:', error);
    }
  }
}

export default new ContinuousVoiceAssistantService();