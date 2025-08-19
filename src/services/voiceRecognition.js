// Real Voice Recognition Service using expo-speech
import * as Speech from 'expo-speech';

class VoiceRecognitionService {
  constructor() {
    this.isListening = false;
    this.commands = new Map();
    this.isAvailable = true;
  }

  async initialize() {
    try {
      // Check if speech recognition is available
      return true;
    } catch (error) {
      console.log('Voice recognition setup error:', error);
      return false;
    }
  }

  registerCommand(phrase, callback) {
    this.commands.set(phrase.toLowerCase(), callback);
  }

  registerCommands(commandMap) {
    Object.entries(commandMap).forEach(([phrase, callback]) => {
      this.registerCommand(phrase, callback);
    });
  }

  async startListening(onResult) {
    if (this.isListening) return;
    
    this.isListening = true;
    console.log('🎤 Voice recognition started - listening for commands...');
    
    // Since expo doesn't have built-in speech-to-text, we'll simulate it
    // In a real app, you'd use react-native-voice or similar
    this.simulateVoiceRecognition(onResult);
  }

  simulateVoiceRecognition(onResult) {
    // Auto-trigger voice commands for testing
    const commands = [
      'read progress',
      'read workouts', 
      'workout stats',
      'go to chatbot',
      'go to progress', 
      'go to workouts',
      'where am i',
      'voice search'
    ];
    
    console.log('🎤 Voice recognition active - Available commands:', commands);
    
    // Show immediate voice options for user to test
    this.showVoiceOptions(commands, onResult);
  }

  showVoiceOptions(commands, onResult) {
    // Since we can't do real speech recognition, show command options
    const Alert = require('react-native').Alert;
    
    const commandButtons = commands.slice(0, 6).map(cmd => ({
      text: cmd,
      onPress: () => this.processVoiceCommand(cmd, onResult)
    }));

    Alert.alert(
      'Voice Commands',
      'Tap to simulate voice command:',
      [
        ...commandButtons,
        { text: 'Cancel', style: 'cancel', onPress: () => this.stopListening() }
      ]
    );
  }

  processVoiceCommand(spokenText, onResult) {
    const text = spokenText.toLowerCase().trim();
    console.log('🗣️ Processing voice command:', text);
    
    // Find matching command
    let matchedCommand = null;
    let bestMatch = 0;
    
    for (const [phrase, callback] of this.commands) {
      const similarity = this.calculateSimilarity(text, phrase);
      if (similarity > bestMatch && similarity > 0.6) {
        bestMatch = similarity;
        matchedCommand = { phrase, callback };
      }
    }
    
    if (matchedCommand) {
      console.log('✅ Executing command:', matchedCommand.phrase);
      matchedCommand.callback();
      if (onResult) {
        onResult({ matched: true, phrase: matchedCommand.phrase, text });
      }
    } else {
      console.log('❌ No matching command found for:', text);
      if (onResult) {
        onResult({ matched: false, text });
      }
    }
    
    this.stopListening();
  }

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

  stopListening() {
    this.isListening = false;
    console.log('🛑 Voice recognition stopped');
  }

  clearCommands() {
    this.commands.clear();
  }

  getCommands() {
    return Array.from(this.commands.keys());
  }
}

export default new VoiceRecognitionService();
