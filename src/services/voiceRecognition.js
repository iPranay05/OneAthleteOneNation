// Voice Recognition Service using @react-native-voice/voice
// This is a simplified wrapper around the enhanced speech recognition service
import speechRecognition from './speechRecognition';

class VoiceRecognitionService {
  constructor() {
    this.isListening = false;
    this.commands = new Map();
    this.isAvailable = false;
  }

  async initialize() {
    try {
      this.isAvailable = await speechRecognition.initialize();
      return this.isAvailable;
    } catch (error) {
      console.log('Voice recognition setup error:', error);
      return false;
    }
  }

  registerCommand(phrase, callback) {
    speechRecognition.registerCommand(phrase, callback);
    this.commands.set(phrase.toLowerCase(), callback);
  }

  registerCommands(commandMap) {
    Object.entries(commandMap).forEach(([phrase, callback]) => {
      this.registerCommand(phrase, callback);
    });
  }

  async startListening(onResult) {
    if (this.isListening) return false;
    
    this.isListening = true;
    console.log('🎤 Voice recognition started - listening for commands...');
    
    return speechRecognition.startListeningForVoiceInput((result) => {
      this.isListening = false;
      if (onResult) {
        onResult(result);
      }
    });
  }

  stopListening() {
    this.isListening = false;
    speechRecognition.stopListening();
    console.log('🛑 Voice recognition stopped');
  }

  clearCommands() {
    speechRecognition.clearCommands();
    this.commands.clear();
  }

  getCommands() {
    return speechRecognition.getCommands();
  }

  calculateSimilarity(str1, str2) {
    // Delegate to enhanced service
    return speechRecognition.calculateSimilarity ? 
      speechRecognition.calculateSimilarity(str1, str2) : 0;
  }
}

export default new VoiceRecognitionService();
