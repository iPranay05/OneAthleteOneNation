// Real TTS service using expo-speech for actual voice output
import * as Speech from 'expo-speech';

class TTSService {
  constructor() {
    this.isAvailable = true;
    this.isSpeaking = false;
    this.queue = [];
    this.currentOptions = {
      rate: 0.5,
      pitch: 1.0,
      language: 'en-US'
    };
  }

  async initialize() {
    try {
      await Speech.getAvailableVoicesAsync();
      return true;
    } catch (error) {
      console.log('TTS setup error:', error);
      return false;
    }
  }

  updateOptions(options) {
    this.currentOptions = { ...this.currentOptions, ...options };
  }

  async speak(text, options = {}) {
    if (!text || typeof text !== 'string') return;

    try {
      console.log('🔊 Speaking:', text);
      
      const speechOptions = {
        ...this.currentOptions,
        ...options,
        onStart: () => {
          this.isSpeaking = true;
          console.log('🎤 TTS Started');
          if (options.onStart) options.onStart();
        },
        onDone: () => {
          this.isSpeaking = false;
          console.log('✅ TTS Finished');
          this.processQueue();
          if (options.onDone) options.onDone();
        },
        onError: (error) => {
          this.isSpeaking = false;
          console.log('❌ TTS Error:', error);
          if (options.onError) options.onError(error);
        }
      };

      await Speech.speak(text, speechOptions);
    } catch (error) {
      console.log('TTS Error:', error);
      this.isSpeaking = false;
    }
  }

  speakQueued(text, options = {}) {
    if (this.isSpeaking) {
      this.queue.push({ text, options });
    } else {
      this.speak(text, options);
    }
  }

  processQueue() {
    if (this.queue.length > 0 && !this.isSpeaking) {
      const { text, options } = this.queue.shift();
      this.speak(text, options);
    }
  }

  async stop() {
    try {
      await Speech.stop();
      this.isSpeaking = false;
      this.queue = [];
      console.log('🛑 TTS Stopped');
    } catch (error) {
      console.log('Stop error:', error);
    }
  }

  speakAlert(message, priority = false) {
    if (priority) {
      this.stop();
      this.speak(message, { rate: 0.6, pitch: 1.1 });
    } else {
      this.speakQueued(message);
    }
  }

  speakInstruction(message) {
    this.speakQueued(message, { rate: 0.45, pitch: 1.0 });
  }

  speakUIElement(element, context = '') {
    let text = '';
    if (context) text += `${context}. `;
    text += element;
    this.speakQueued(text, { rate: 0.55 });
  }
}

export default new TTSService();
