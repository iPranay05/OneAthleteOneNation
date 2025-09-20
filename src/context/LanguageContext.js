import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { helsinkiTranslator } from '../services/helsinkiTranslation';

const LanguageContext = createContext({
  currentLanguage: 'en',
  availableLanguages: [],
  changeLanguage: () => {},
  translateText: () => {},
  isTranslating: false,
});

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
];

export function LanguageProvider({ children }) {
  const { i18n } = useTranslation();
  const [isTranslating, setIsTranslating] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en');

  useEffect(() => {
    const handleLanguageChange = (lng) => {
      setCurrentLanguage(lng);
    };

    i18n.on('languageChanged', handleLanguageChange);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const changeLanguage = async (languageCode) => {
    try {
      await i18n.changeLanguage(languageCode);
      setCurrentLanguage(languageCode);
      console.log('Language changed to:', languageCode);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  const translateText = async (text, targetLang = null, sourceLang = null) => {
    if (!text || text.trim().length === 0) {
      return text;
    }

    // Use current language as target if not specified
    const target = targetLang || currentLanguage;
    
    // Don't translate if target is English and text appears to be English
    if (target === 'en' && !sourceLang && !/[\u0900-\u097F\u0D00-\u0D7F]/.test(text)) {
      return text;
    }

    setIsTranslating(true);
    try {
      const translated = await helsinkiTranslator.translateText(text, target, sourceLang);
      return translated;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    } finally {
      setIsTranslating(false);
    }
  };

  const translateBatch = async (texts, targetLang = null, sourceLang = null) => {
    const target = targetLang || currentLanguage;
    
    setIsTranslating(true);
    try {
      const translated = await helsinkiTranslator.translateBatch(texts, target, sourceLang);
      return translated;
    } catch (error) {
      console.error('Batch translation error:', error);
      return texts;
    } finally {
      setIsTranslating(false);
    }
  };

  const getLanguageName = (code) => {
    const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
    return lang ? lang.nativeName : code;
  };

  const getLanguageDirection = (code) => {
    // All supported languages use LTR
    return 'ltr';
  };

  const value = {
    currentLanguage,
    availableLanguages: SUPPORTED_LANGUAGES,
    changeLanguage,
    translateText,
    translateBatch,
    isTranslating,
    getLanguageName,
    getLanguageDirection,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Hook for content translation (separate from UI translation)
export function useContentTranslation() {
  const { translateText, translateBatch, isTranslating, currentLanguage } = useLanguage();
  const [translatedContent, setTranslatedContent] = useState(new Map());

  const translateAndCache = async (text, key = null) => {
    const cacheKey = key || text.substring(0, 50);
    
    if (translatedContent.has(cacheKey)) {
      return translatedContent.get(cacheKey);
    }

    const translated = await translateText(text);
    
    setTranslatedContent(prev => new Map(prev.set(cacheKey, translated)));
    
    return translated;
  };

  const clearCache = () => {
    setTranslatedContent(new Map());
  };

  return {
    translateAndCache,
    translateBatch,
    isTranslating,
    currentLanguage,
    clearCache,
    cacheSize: translatedContent.size,
  };
}
