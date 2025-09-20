import AsyncStorage from '@react-native-async-storage/async-storage';

const TRANSLATION_CACHE_KEY = '@OneNationOneAthlete:translations';
const HUGGINGFACE_API_KEY = process.env.EXPO_PUBLIC_HUGGINGFACE_API_KEY; // Add this to your .env

// Helsinki-NLP model mappings for different language pairs
const TRANSLATION_MODELS = {
  'en-hi': 'Helsinki-NLP/opus-mt-en-hi',
  'hi-en': 'Helsinki-NLP/opus-mt-hi-en',
  'en-ml': 'Helsinki-NLP/opus-mt-en-ml',
  'ml-en': 'Helsinki-NLP/opus-mt-ml-en',
  'en-mr': 'Helsinki-NLP/opus-mt-en-mr', // Note: May not be available, fallback to multilingual
  'mr-en': 'Helsinki-NLP/opus-mt-mr-en',
  // Fallback multilingual models
  'en-mul': 'Helsinki-NLP/opus-mt-en-mul',
  'mul-en': 'Helsinki-NLP/opus-mt-mul-en'
};

class HelsinkiTranslationService {
  constructor() {
    this.cache = new Map();
    this.isInitialized = false;
    this.loadCacheFromStorage();
  }

  async loadCacheFromStorage() {
    try {
      const cachedTranslations = await AsyncStorage.getItem(TRANSLATION_CACHE_KEY);
      if (cachedTranslations) {
        const parsed = JSON.parse(cachedTranslations);
        this.cache = new Map(Object.entries(parsed));
        console.log('Loaded translation cache:', this.cache.size, 'entries');
      }
    } catch (error) {
      console.error('Error loading translation cache:', error);
    }
  }

  async saveCacheToStorage() {
    try {
      const cacheObject = Object.fromEntries(this.cache);
      await AsyncStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(cacheObject));
    } catch (error) {
      console.error('Error saving translation cache:', error);
    }
  }

  getCacheKey(text, sourceLang, targetLang) {
    return `${sourceLang}-${targetLang}-${text.substring(0, 50)}`;
  }

  detectLanguage(text) {
    // Simple language detection based on character sets
    if (/[\u0900-\u097F]/.test(text)) return 'hi'; // Hindi/Devanagari
    if (/[\u0D00-\u0D7F]/.test(text)) return 'ml'; // Malayalam
    if (/[\u0900-\u097F]/.test(text)) return 'mr'; // Marathi (also uses Devanagari)
    return 'en'; // Default to English
  }

  getModelForLanguagePair(sourceLang, targetLang) {
    const pair = `${sourceLang}-${targetLang}`;
    
    // Direct model mapping
    if (TRANSLATION_MODELS[pair]) {
      return TRANSLATION_MODELS[pair];
    }
    
    // Fallback to multilingual models
    if (sourceLang === 'en') {
      return TRANSLATION_MODELS['en-mul'];
    } else if (targetLang === 'en') {
      return TRANSLATION_MODELS['mul-en'];
    }
    
    // Last resort - use English as intermediate language
    return null;
  }

  async translateWithHuggingFace(text, model) {
    if (!HUGGINGFACE_API_KEY) {
      throw new Error('Hugging Face API key not configured');
    }

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          inputs: text,
          options: {
            wait_for_model: true,
            use_cache: true
          }
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.error) {
      throw new Error(`Translation error: ${result.error}`);
    }

    return result[0]?.translation_text || text;
  }

  async translateText(text, targetLang, sourceLang = null) {
    if (!text || text.trim().length === 0) {
      return text;
    }

    // Auto-detect source language if not provided
    if (!sourceLang) {
      sourceLang = this.detectLanguage(text);
    }

    // No translation needed if source and target are the same
    if (sourceLang === targetLang) {
      return text;
    }

    // Check cache first
    const cacheKey = this.getCacheKey(text, sourceLang, targetLang);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      let translatedText = text;
      const model = this.getModelForLanguagePair(sourceLang, targetLang);

      if (model) {
        // Direct translation
        translatedText = await this.translateWithHuggingFace(text, model);
      } else {
        // Two-step translation via English
        if (sourceLang !== 'en' && targetLang !== 'en') {
          // First translate to English
          const englishModel = this.getModelForLanguagePair(sourceLang, 'en');
          if (englishModel) {
            const englishText = await this.translateWithHuggingFace(text, englishModel);
            
            // Then translate from English to target
            const targetModel = this.getModelForLanguagePair('en', targetLang);
            if (targetModel) {
              translatedText = await this.translateWithHuggingFace(englishText, targetModel);
            }
          }
        }
      }

      // Cache the result
      this.cache.set(cacheKey, translatedText);
      
      // Periodically save cache to storage
      if (this.cache.size % 10 === 0) {
        await this.saveCacheToStorage();
      }

      return translatedText;
    } catch (error) {
      console.error('Translation failed:', error);
      return text; // Return original text on failure
    }
  }

  async translateBatch(texts, targetLang, sourceLang = null) {
    const promises = texts.map(text => 
      this.translateText(text, targetLang, sourceLang)
    );
    
    try {
      return await Promise.all(promises);
    } catch (error) {
      console.error('Batch translation failed:', error);
      return texts; // Return original texts on failure
    }
  }

  async clearCache() {
    this.cache.clear();
    try {
      await AsyncStorage.removeItem(TRANSLATION_CACHE_KEY);
      console.log('Translation cache cleared');
    } catch (error) {
      console.error('Error clearing translation cache:', error);
    }
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()).slice(0, 5) // Show first 5 keys
    };
  }
}

export const helsinkiTranslator = new HelsinkiTranslationService();
