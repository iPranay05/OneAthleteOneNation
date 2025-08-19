// Speech Recognition Service for Voice Commands
// Mock implementation for development - replace with expo-speech or react-native-voice

class SpeechRecognitionService {
  constructor() {
    this.commands = new Map();
    this.isListening = false;
    this.isContinuousListening = false;
    this.isAvailable = true; // Mock availability
    this.continuousCallback = null;
    this.currentCallback = null;
    this.mockResults = [
      'go to home',
      'open workouts',
      'start workout',
      'show progress',
      'open chatbot',
      'read this',
      'help me',
      'emergency',
      'call coach',
      'next exercise'
    ];
  }

  // Initialize speech recognition
  async initialize() {
    try {
      // In real implementation, check permissions and availability
      console.log('Speech Recognition initialized');
      return true;
    } catch (error) {
      console.log('Speech Recognition initialization failed:', error);
      this.isAvailable = false;
      return false;
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
  }

  // Register multiple commands at once
  registerCommands(commandMap) {
    Object.entries(commandMap).forEach(([phrase, callback]) => {
      this.registerCommand(phrase, callback);
    });
  }

  // Start listening for voice commands
  startListening(callback = null) {
    if (!this.isAvailable) {
      console.log('Speech recognition not available');
      return false;
    }

    if (this.isListening) {
      console.log('Already listening');
      return false;
    }

    this.isListening = true;
    this.currentCallback = callback;

    // Mock implementation - simulate voice recognition
    console.log('🎤 Listening for voice commands...');
    
    // Simulate recognition after 2 seconds for demo
    setTimeout(() => {
      if (this.isListening) {
        const mockResult = this.mockResults[Math.floor(Math.random() * this.mockResults.length)];
        this.processVoiceInput(mockResult);
      }
    }, 2000);

    return true;
  }

  // Stop listening
  stopListening() {
    if (!this.isListening) return;
    
    this.isListening = false;
    this.currentCallback = null;
    console.log('🎤 Stopped listening');
  }

  // Process voice input and match commands
  processVoiceInput(text) {
    const normalizedText = text.toLowerCase().trim();
    console.log('Voice input:', normalizedText);

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

    if (matchedCommand) {
      console.log('Executing command:', matchedCommand.phrase);
      matchedCommand.callback(normalizedText);
    } else {
      console.log('No matching command found for:', normalizedText);
      if (this.currentCallback) {
        this.currentCallback({ text: normalizedText, matched: false });
      }
    }

    this.stopListening();
  }

  // Calculate similarity between two strings
  calculateSimilarity(str1, str2) {
    const words1 = str1.split(' ');
    const words2 = str2.split(' ');
    
    let matches = 0;
    words1.forEach(word1 => {
      if (words2.some(word2 => word2.includes(word1) || word1.includes(word2))) {
        matches++;
      }
    });

    return matches / Math.max(words1.length, words2.length);
  }

  // Get all registered commands
  getCommands() {
    return Array.from(this.commands.keys()).map(phrase => ({ phrase }));
  }

  // Clear all commands
  clearCommands() {
    this.commands.clear();
  }

  // Check if service is available
  isServiceAvailable() {
    return this.isAvailable;
  }

  // Get listening status
  getListeningStatus() {
    return this.isListening;
  }

  // Start continuous listening for always-on voice assistant
  startContinuousListening(callback) {
    if (this.isContinuousListening) return;
    
    this.isContinuousListening = true;
    this.continuousCallback = callback;
    this.continuousMode = true;
    this.startListening();
  }

  stopContinuousListening() {
    this.continuousMode = false;
    this.continuousCallback = null;
    this.stopListening();
  }
}

export default new SpeechRecognitionService();
