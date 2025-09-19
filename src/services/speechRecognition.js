// Enhanced Speech Recognition Service with real voice input support
import Voice from '@react-native-voice/voice';
import { Platform, Alert } from 'react-native';

class EnhancedSpeechRecognitionService {
  constructor() {
    this.isListening = false;
    this.isContinuousListening = false;
    this.isAvailable = false;
    this.hasPermission = false;
    this.isInitialized = false;
    this.commands = new Map();
    this.currentCallback = null;
    this.continuousCallback = null;
    this.continuousMode = false;
    this.retryCount = 0;
    this.maxRetries = 3;
    this.useVoiceLibrary = false;
    
    // Mock results for fallback
    this.mockResults = [
      'show my workouts',
      'read my progress', 
      'go to profile',
      'open chatbot',
      'navigate to marketplace',
      'what can I do here',
      'read screen content',
      'help me navigate',
      'start workout',
      'next exercise',
      'pause workout',
      'go back'
    ];
  }

  // Initialize the speech recognition service
  async initialize() {
    try {
      console.log('🎤 Initializing Speech Recognition Service...');
      
      // Try @react-native-voice/voice
      if (Platform.OS !== 'web') {
        try {
          // Initialize Voice library
          Voice.onSpeechStart = this.onSpeechStart.bind(this);
          Voice.onSpeechRecognized = this.onSpeechRecognized.bind(this);
          Voice.onSpeechEnd = this.onSpeechEnd.bind(this);
          Voice.onSpeechError = this.onSpeechError.bind(this);
          Voice.onSpeechResults = this.onSpeechResults.bind(this);
          Voice.onSpeechPartialResults = this.onSpeechPartialResults.bind(this);
          
          const available = await Voice.isAvailable();
          if (available) {
            this.useVoiceLibrary = true;
            this.isAvailable = true;
            console.log('✅ React Native Voice available');
          }
        } catch (error) {
          console.log('⚠️ React Native Voice not available:', error);
          this.useVoiceLibrary = false;
        }
      }
      
      this.isInitialized = true;
      
      if (this.isAvailable) {
        await this.requestPermissions();
      }
      
      console.log(`🎆 Speech Recognition initialized: ${this.isAvailable ? 'Available' : 'Fallback mode'}`);
      return this.isAvailable;
    } catch (error) {
      console.error('❌ Speech Recognition initialization error:', error);
      this.isInitialized = false;
      this.isAvailable = false;
      return false;
    }
  }

  async requestPermissions() {
    try {
      if (this.useVoiceLibrary) {
        // Permissions are usually handled automatically by react-native-voice
        this.hasPermission = true;
      } else {
        this.hasPermission = false;
      }
      
      console.log(`🔑 Speech Recognition permissions: ${this.hasPermission ? 'Granted' : 'Denied'}`);
      return this.hasPermission;
    } catch (error) {
      console.error('❌ Permission request failed:', error);
      this.hasPermission = false;
      return false;
    }
  }

  // Voice library event handlers
  onSpeechStart(e) {
    console.log('🎤 Speech recognition started');
  }

  onSpeechRecognized(e) {
    console.log('✅ Speech recognized');
  }

  onSpeechEnd(e) {
    console.log('🎤 Speech recognition ended');
    this.isListening = false;
  }

  onSpeechError(e) {
    console.error('❌ Speech recognition error:', e.error);
    this.isListening = false;
    
    if (this.currentCallback) {
      this.currentCallback({
        matched: false,
        text: '',
        error: e.error,
        message: 'Speech recognition failed'
      });
    }
  }

  onSpeechResults(e) {
    if (e.value && e.value.length > 0) {
      const transcript = e.value[0];
      console.log('🗣️ Speech result:', transcript);
      this.processVoiceInput(transcript);
    }
  }

  onSpeechPartialResults(e) {
    if (e.value && e.value.length > 0) {
      console.log('📋 Partial result:', e.value[0]);
    }
  }

  // Register voice commands
  registerCommand(phrase, callback, description = '') {
    const normalizedPhrase = phrase.toLowerCase().trim();
    this.commands.set(normalizedPhrase, {
      callback,
      description,
      phrase: phrase
    });
    console.log(`📝 Registered command: "${phrase}"`);
  }

  registerCommands(commandMap) {
    Object.entries(commandMap).forEach(([phrase, callback]) => {
      this.registerCommand(phrase, callback);
    });
  }

  // Start listening for voice commands
  async startListening(callback = null) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.isListening) {
      console.log('⚠️ Already listening');
      return false;
    }

    this.currentCallback = callback;

    // Use real speech recognition if available
    if (this.isAvailable && this.hasPermission) {
      return this.startRealSpeechRecognition();
    } else {
      // Fallback to text input
      return this.showInputFallback();
    }
  }

  async startRealSpeechRecognition() {
    try {
      this.isListening = true;
      
      if (this.useVoiceLibrary) {
        // Use @react-native-voice/voice
        await Voice.start('en-US');
        console.log('🎤 Voice recognition started - listening...');
      } else {
        // Fallback to text input if no voice library available
        console.log('📱 No voice library available, using text input');
        return this.showInputFallback();
      }
      
      // Set timeout for voice recognition
      setTimeout(() => {
        if (this.isListening) {
          this.stopListening();
          if (this.currentCallback) {
            this.currentCallback({
              matched: false,
              text: '',
              message: 'Listening timeout - no voice detected'
            });
          }
        }
      }, 8000);
      
      return true;
      
    } catch (error) {
      console.error('❌ Failed to start voice recognition:', error);
      this.isListening = false;
      
      // Retry with fallback
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(`🔄 Retrying voice recognition (${this.retryCount}/${this.maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.startRealSpeechRecognition();
      } else {
        console.log('📱 Falling back to text input');
        this.retryCount = 0;
        return this.showInputFallback();
      }
    }
  }

  showInputFallback() {
    const commands = [
      'show my workouts',
      'read my progress', 
      'go to profile',
      'open chatbot',
      'navigate to marketplace',
      'what can I do here',
      'read screen content',
      'help me navigate'
    ];
    
    const suggestions = commands.slice(0, 4).join('\n• ');
    
    Alert.prompt(
      '🎤 Voice Assistant (Text Mode)',
      `Type your command below:\n\nSuggestions:\n• ${suggestions}`,
      [
        { 
          text: 'Cancel', 
          style: 'cancel', 
          onPress: () => {
            this.isListening = false;
            if (this.currentCallback) {
              this.currentCallback({ matched: false, text: '', message: 'Cancelled' });
            }
          }
        },
        {
          text: 'Submit',
          onPress: (text) => {
            this.isListening = false;
            if (text && text.trim()) {
              this.processVoiceInput(text.trim());
            } else {
              if (this.currentCallback) {
                this.currentCallback({ matched: false, text: '', message: 'No input provided' });
              }
            }
          }
        }
      ],
      'plain-text',
      'Type your command here...'
    );
    
    return true;
  }

  async stopListening() {
    if (!this.isListening) return;
    
    try {
      if (this.useVoiceLibrary) {
        await Voice.stop();
      }
      
      this.isListening = false;
      console.log('🛑 Speech recognition stopped');
    } catch (error) {
      console.error('❌ Error stopping speech recognition:', error);
      this.isListening = false;
    }
  }

  // Process voice input and match commands
  processVoiceInput(text) {
    const normalizedText = text.toLowerCase().trim();
    console.log('🗣️ Processing voice input:', normalizedText);

    // Find matching command
    let matchedCommand = null;
    let bestMatch = 0;

    for (const [phrase, command] of this.commands) {
      const similarity = this.calculateSimilarity(normalizedText, phrase);
      if (similarity > bestMatch && similarity > 0.6) {
        bestMatch = similarity;
        matchedCommand = command;
      }
    }

    const result = {
      text: normalizedText,
      matched: !!matchedCommand,
      phrase: matchedCommand?.phrase || null,
      confidence: bestMatch
    };

    if (matchedCommand) {
      console.log('✅ Executing command:', matchedCommand.phrase);
      try {
        matchedCommand.callback(normalizedText);
        result.executed = true;
      } catch (error) {
        console.error('❌ Error executing command:', error);
        result.matched = false;
        result.error = error.message;
        result.executed = false;
      }
    } else {
      console.log('❌ No matching command found for:', normalizedText);
    }

    // Call callbacks with result
    if (this.currentCallback) {
      this.currentCallback(result);
    }
    if (this.continuousCallback && this.continuousMode) {
      this.continuousCallback(result);
    }

    // Reset listening state if not in continuous mode
    if (!this.continuousMode) {
      this.isListening = false;
    }
  }

  // Calculate similarity between two strings using word matching
  calculateSimilarity(str1, str2) {
    const words1 = str1.split(' ').filter(w => w.length > 2); // Filter short words
    const words2 = str2.split(' ').filter(w => w.length > 2);
    
    if (words1.length === 0 || words2.length === 0) return 0;
    
    let matches = 0;
    words1.forEach(word1 => {
      if (words2.some(word2 => 
        word2.includes(word1) || 
        word1.includes(word2) ||
        this.levenshteinDistance(word1, word2) <= 1
      )) {
        matches++;
      }
    });

    return matches / Math.max(words1.length, words2.length);
  }

  // Calculate edit distance for better word matching
  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  // Start listening for voice input with callback
  async startListeningForVoiceInput(callback) {
    if (!callback) {
      console.error('❌ No callback provided for voice input');
      return false;
    }
    
    this.currentCallback = callback;
    return this.startListening(callback);
  }

  // Continuous listening for always-on voice assistant
  async startContinuousListening(callback) {
    if (this.isContinuousListening) {
      console.log('⚠️ Already in continuous listening mode');
      return false;
    }
    
    this.isContinuousListening = true;
    this.continuousCallback = callback;
    this.continuousMode = true;
    
    console.log('🔄 Starting continuous listening mode');
    
    const startContinuous = async () => {
      if (!this.continuousMode) return;
      
      try {
        await this.startListening((result) => {
          if (this.continuousCallback) {
            this.continuousCallback(result);
          }
          
          // Restart listening after processing
          if (this.continuousMode && !this.isListening) {
            setTimeout(() => {
              if (this.continuousMode) {
                startContinuous();
              }
            }, 2000);
          }
        });
      } catch (error) {
        console.error('❌ Continuous listening error:', error);
        if (this.continuousMode) {
          setTimeout(startContinuous, 5000); // Retry after 5 seconds
        }
      }
    };
    
    return startContinuous();
  }

  stopContinuousListening() {
    this.isContinuousListening = false;
    this.continuousMode = false;
    this.continuousCallback = null;
    this.stopListening();
    console.log('🛑 Continuous listening stopped');
  }

  // Get all registered commands
  getCommands() {
    return Array.from(this.commands.entries()).map(([phrase, command]) => ({
      phrase,
      description: command.description
    }));
  }

  // Clear all commands
  clearCommands() {
    this.commands.clear();
    console.log('🗑️ All voice commands cleared');
  }

  // Service status methods
  isServiceAvailable() {
    return this.isAvailable;
  }

  getListeningStatus() {
    return {
      isListening: this.isListening,
      isContinuous: this.isContinuousListening,
      hasPermission: this.hasPermission,
      isInitialized: this.isInitialized,
      useVoiceLibrary: this.useVoiceLibrary,
      commandCount: this.commands.size
    };
  }

  // Cleanup when component unmounts
  async destroy() {
    try {
      if (this.useVoiceLibrary) {
        await Voice.destroy();
      }
      
      this.isListening = false;
      this.isContinuousListening = false;
      this.continuousMode = false;
      this.currentCallback = null;
      this.continuousCallback = null;
      
      console.log('🗑️ Speech Recognition Service destroyed');
    } catch (error) {
      console.error('❌ Error destroying speech recognition:', error);
    }
  }
}

export default new EnhancedSpeechRecognitionService();
