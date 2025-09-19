// Unified Text-to-Speech Service with enhanced accessibility features
import * as Speech from 'expo-speech';

// Optional haptics import with fallback
let Haptics;
let hapticsAvailable = false;
try {
  Haptics = require('expo-haptics');
  // Test if haptics methods are available
  if (Haptics && typeof Haptics.selectionAsync === 'function') {
    hapticsAvailable = true;
    console.log('✅ Haptics library available');
  } else {
    console.log('⚠️ Haptics library imported but methods unavailable');
    Haptics = null;
  }
} catch (error) {
  console.log('📱 Haptics not available (expected in Expo Go):', error.message);
  Haptics = null;
}

class UnifiedTTSService {
  constructor() {
    this.isAvailable = true;
    this.isSpeaking = false;
    this.isProcessing = false;
    this.queue = [];
    this.voices = [];
    this.retryCount = 0;
    this.maxRetries = 3;
    this.currentOptions = {
      rate: 0.6,
      pitch: 1.0,
      language: 'en-US',
      voice: undefined
    };
    this.accessibilityOptions = {
      useHaptics: true,
      audioFeedback: true,
      verboseMode: false
    };
  }

  async initialize() {
    try {
      // Get available voices for better accessibility
      this.voices = await Speech.getAvailableVoicesAsync();
      console.log('🔊 TTS: Found', this.voices.length, 'voices');
      
      // Select best English voice for accessibility
      const preferredVoices = this.voices.filter(voice => 
        voice.language.startsWith('en') && 
        (voice.quality === 'Enhanced' || voice.quality === 'Default')
      );
      
      if (preferredVoices.length > 0) {
        this.currentOptions.voice = preferredVoices[0].identifier;
        console.log('🎯 Selected voice:', preferredVoices[0].name);
      }
      
      this.isAvailable = true;
      return true;
    } catch (error) {
      console.error('❌ TTS initialization failed:', error);
      this.isAvailable = false;
      return false;
    }
  }

  setAccessibilityOptions(options) {
    this.accessibilityOptions = { ...this.accessibilityOptions, ...options };
  }

  updateSpeechOptions(options) {
    this.currentOptions = { ...this.currentOptions, ...options };
  }

  async speak(text, options = {}) {
    if (!text || typeof text !== 'string' || text.trim() === '') {
      console.warn('⚠️ TTS: Invalid or empty text provided');
      return false;
    }

    if (!this.isAvailable) {
      console.warn('⚠️ TTS: Service not available');
      return false;
    }

    try {
      // Provide haptic feedback for blind users
      if (this.accessibilityOptions.useHaptics) {
        await this.vibrate('start');
      }

      // Stop any current speech
      if (this.isSpeaking) {
        await Speech.stop();
      }
      
      const speechOptions = {
        ...this.currentOptions,
        ...options,
        onStart: () => {
          this.isSpeaking = true;
          this.retryCount = 0;
          console.log('🎤 TTS Started:', text.substring(0, 50) + '...');
          if (options.onStart) options.onStart();
        },
        onDone: () => {
          this.isSpeaking = false;
          console.log('✅ TTS Finished');
          if (this.accessibilityOptions.useHaptics) {
            this.vibrate('success');
          }
          if (options.onDone) options.onDone();
          this.processQueue();
        },
        onStopped: () => {
          this.isSpeaking = false;
          if (options.onStopped) options.onStopped();
        },
        onError: (error) => {
          this.isSpeaking = false;
          console.error('❌ TTS Error:', error);
          if (this.accessibilityOptions.useHaptics) {
            this.vibrate('error');
          }
          this.handleSpeechError(text, options, error);
          if (options.onError) options.onError(error);
        }
      };

      await Speech.speak(text, speechOptions);
      return true;
      
    } catch (error) {
      console.error('❌ TTS Critical Error:', error);
      this.isSpeaking = false;
      if (this.accessibilityOptions.useHaptics) {
        await this.vibrate('error');
      }
      return false;
    }
  }

  async handleSpeechError(text, options, error) {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      console.log(`🔄 Retrying TTS (${this.retryCount}/${this.maxRetries})`);
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Retry with simplified options
      const retryOptions = {
        ...this.currentOptions,
        rate: 0.7,
        pitch: 1.0,
        voice: undefined // Use default voice on retry
      };
      
      return this.speak(text, retryOptions);
    } else {
      console.error('❌ TTS: Max retries exceeded');
      this.retryCount = 0;
    }
  }

  async vibrate(type = 'selection') {
    if (!hapticsAvailable || !Haptics) {
      console.log('📱 Haptics not available, skipping vibration');
      return;
    }
    
    try {
      switch (type) {
        case 'start':
          if (typeof Haptics.selectionAsync === 'function') {
            await Haptics.selectionAsync();
          }
          break;
        case 'success':
          if (typeof Haptics.notificationAsync === 'function' && Haptics.NotificationFeedbackType) {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          break;
        case 'error':
          if (typeof Haptics.notificationAsync === 'function' && Haptics.NotificationFeedbackType) {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
          break;
        case 'warning':
          if (typeof Haptics.notificationAsync === 'function' && Haptics.NotificationFeedbackType) {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          }
          break;
        default:
          if (typeof Haptics.selectionAsync === 'function') {
            await Haptics.selectionAsync();
          }
      }
    } catch (error) {
      console.log('📱 Haptics error (expected in Expo Go):', error.message);
    }
  }

  addToQueue(text, options = {}) {
    if (!text || typeof text !== 'string') return;
    
    this.queue.push({ text: text.trim(), options });
    console.log(`📝 Added to TTS queue (${this.queue.length} items)`);
    
    if (!this.isSpeaking && !this.isProcessing) {
      this.processQueue();
    }
  }

  async processQueue() {
    if (this.queue.length === 0 || this.isSpeaking || this.isProcessing) return;
    
    this.isProcessing = true;
    const { text, options } = this.queue.shift();
    
    console.log(`🎯 Processing queue item: "${text.substring(0, 30)}..."`);
    await this.speak(text, options);
    this.isProcessing = false;
  }

  async stop() {
    try {
      await Speech.stop();
      this.isSpeaking = false;
      this.isProcessing = false;
      this.queue = [];
      console.log('🛑 TTS Stopped and queue cleared');
      
      if (this.accessibilityOptions.useHaptics) {
        await this.vibrate('selection');
      }
    } catch (error) {
      console.error('❌ Stop TTS error:', error);
    }
  }

  async pause() {
    try {
      await Speech.pause();
      console.log('⏸️ TTS Paused');
    } catch (error) {
      console.warn('⚠️ Pause not supported:', error);
    }
  }

  async resume() {
    try {
      await Speech.resume();
      console.log('▶️ TTS Resumed');
    } catch (error) {
      console.warn('⚠️ Resume not supported:', error);
    }
  }

  // Accessibility-focused speaking methods
  async speakAlert(text, priority = false) {
    if (priority) {
      await this.stop();
    }
    
    return this.speak(text, {
      rate: 0.7,
      pitch: 1.1,
      onStart: () => this.vibrate('warning')
    });
  }

  async speakInstruction(text, slow = true) {
    return this.speak(text, {
      rate: slow ? 0.5 : 0.6,
      pitch: 0.9
    });
  }

  async speakNavigation(text) {
    return this.speak(text, {
      rate: 0.8,
      pitch: 1.0,
      onStart: () => this.vibrate('selection')
    });
  }

  async speakError(text) {
    await this.stop();
    return this.speak(`Error: ${text}`, {
      rate: 0.6,
      pitch: 0.8,
      onStart: () => this.vibrate('error')
    });
  }

  async speakSuccess(text) {
    return this.speak(`Success! ${text}`, {
      rate: 0.7,
      pitch: 1.1,
      onStart: () => this.vibrate('success')
    });
  }

  // Screen reading methods for blind users
  async announceScreen(screenName, details = '') {
    const announcement = `${screenName} screen${details ? '. ' + details : ''}`;
    return this.speak(announcement, { rate: 0.6 });
  }

  async readList(items, title = 'Items', maxItems = 5) {
    if (!items || items.length === 0) {
      return this.speak(`${title} list is empty`);
    }

    let text = `${title}: ${items.length} item${items.length > 1 ? 's' : ''}. `;
    
    const itemsToRead = items.slice(0, maxItems);
    itemsToRead.forEach((item, index) => {
      const itemText = typeof item === 'string' ? item : item.title || item.name || `Item ${index + 1}`;
      text += `${index + 1}. ${itemText}. `;
    });
    
    if (items.length > maxItems) {
      text += `And ${items.length - maxItems} more items.`;
    }

    return this.speak(text, { rate: 0.5 });
  }

  async readScreenData(screenData, screenName) {
    let content = [];
    
    if (screenData.assignedWorkouts?.length) {
      content.push(`${screenData.assignedWorkouts.length} assigned workouts`);
    }
    if (screenData.todaySteps) {
      content.push(`${screenData.todaySteps} steps today`);
    }
    if (screenData.messageCount) {
      content.push(`${screenData.messageCount} messages`);
    }
    if (screenData.currentTab) {
      content.push(`currently on ${screenData.currentTab} tab`);
    }
    
    const announcement = content.length > 0 
      ? `${screenName} screen. ${content.join(', ')}.`
      : `${screenName} screen`;
      
    return this.speak(announcement);
  }

  // Queue management
  clearQueue() {
    this.queue = [];
    console.log('🗑️ TTS queue cleared');
  }

  getQueueLength() {
    return this.queue.length;
  }

  // Status and configuration
  getStatus() {
    return {
      isAvailable: this.isAvailable,
      isSpeaking: this.isSpeaking,
      isProcessing: this.isProcessing,
      queueLength: this.queue.length,
      voicesCount: this.voices.length,
      currentVoice: this.currentOptions.voice
    };
  }

  // Speed controls for different user needs
  setSpeechRate(rate) {
    this.currentOptions.rate = Math.max(0.1, Math.min(2.0, rate));
  }

  setPitch(pitch) {
    this.currentOptions.pitch = Math.max(0.5, Math.min(2.0, pitch));
  }

  // Preset configurations for different accessibility needs
  useSlowSpeech() {
    this.updateSpeechOptions({ rate: 0.4, pitch: 0.9 });
  }

  useFastSpeech() {
    this.updateSpeechOptions({ rate: 0.9, pitch: 1.1 });
  }

  useDefaultSpeech() {
    this.updateSpeechOptions({ rate: 0.6, pitch: 1.0 });
  }
}

export default new UnifiedTTSService();
