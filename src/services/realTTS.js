// Real Text-to-Speech Service using expo-speech
import * as Speech from 'expo-speech';

class RealTTSService {
  constructor() {
    this.isAvailable = true;
    this.isSpeaking = false;
    this.queue = [];
    this.currentOptions = {
      rate: 0.6,
      pitch: 1.0,
      language: 'en-US',
      voice: undefined
    };
  }

  async initialize() {
    try {
      // Get available voices
      const voices = await Speech.getAvailableVoicesAsync();
      console.log('Available voices:', voices.length);
      
      // Try to find a good English voice
      const englishVoices = voices.filter(voice => 
        voice.language.startsWith('en') && voice.quality === 'Enhanced'
      );
      
      if (englishVoices.length > 0) {
        this.currentOptions.voice = englishVoices[0].identifier;
        console.log('Selected voice:', englishVoices[0].name);
      }
      
      return true;
    } catch (error) {
      console.log('TTS initialization error:', error);
      return false;
    }
  }

  async speak(text, options = {}) {
    if (!text || typeof text !== 'string') return;

    try {
      // Stop any current speech
      await Speech.stop();
      
      const speechOptions = {
        ...this.currentOptions,
        ...options,
        onStart: () => {
          this.isSpeaking = true;
          console.log('TTS Started:', text);
          if (options.onStart) options.onStart();
        },
        onDone: () => {
          this.isSpeaking = false;
          console.log('TTS Finished:', text);
          if (options.onDone) options.onDone();
          this.processQueue();
        },
        onStopped: () => {
          this.isSpeaking = false;
          if (options.onStopped) options.onStopped();
        },
        onError: (error) => {
          this.isSpeaking = false;
          console.log('TTS Error:', error);
          if (options.onError) options.onError(error);
        }
      };

      await Speech.speak(text, speechOptions);
      
    } catch (error) {
      console.log('Speech error:', error);
      this.isSpeaking = false;
    }
  }

  async speakAlert(text, priority = false) {
    if (priority) {
      await this.stop();
    }
    
    await this.speak(text, {
      rate: 0.7,
      pitch: 1.1
    });
  }

  async speakInstruction(text) {
    await this.speak(text, {
      rate: 0.5,
      pitch: 0.9
    });
  }

  async stop() {
    try {
      await Speech.stop();
      this.isSpeaking = false;
      this.queue = [];
    } catch (error) {
      console.log('Stop speech error:', error);
    }
  }

  async pause() {
    try {
      await Speech.pause();
    } catch (error) {
      console.log('Pause speech error:', error);
    }
  }

  async resume() {
    try {
      await Speech.resume();
    } catch (error) {
      console.log('Resume speech error:', error);
    }
  }

  updateOptions(newOptions) {
    this.currentOptions = { ...this.currentOptions, ...newOptions };
  }

  setSpeechRate(rate) {
    this.currentOptions.rate = Math.max(0.1, Math.min(1.0, rate));
  }

  addToQueue(text, options = {}) {
    this.queue.push({ text, options });
    if (!this.isSpeaking) {
      this.processQueue();
    }
  }

  async processQueue() {
    if (this.queue.length > 0 && !this.isSpeaking) {
      const { text, options } = this.queue.shift();
      await this.speak(text, options);
    }
  }

  getStatus() {
    return {
      isAvailable: this.isAvailable,
      isSpeaking: this.isSpeaking,
      queueLength: this.queue.length
    };
  }

  // Convenience methods for common announcements
  async announceScreen(screenName, details = '') {
    const announcement = `Hi! You are now on the ${screenName} screen. ${details}`;
    await this.speak(announcement);
  }

  async announceNavigation(action, destination) {
    await this.speak(`${action} ${destination}`);
  }

  async announceError(error) {
    await this.speakAlert(`Error: ${error}`);
  }

  async announceSuccess(message) {
    await this.speak(`Success! ${message}`);
  }

  async readList(items, title = 'List') {
    if (!items || items.length === 0) {
      await this.speak(`${title} is empty`);
      return;
    }

    let text = `${title} contains ${items.length} item${items.length > 1 ? 's' : ''}: `;
    items.slice(0, 5).forEach((item, index) => {
      text += `${index + 1}. ${item}. `;
    });
    
    if (items.length > 5) {
      text += `And ${items.length - 5} more items.`;
    }

    await this.speak(text);
  }
}

export default new RealTTSService();
