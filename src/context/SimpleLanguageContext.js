import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Simple translations without i18next
const translations = {
  en: {
    navigation: {
      home: "Home",
      explore: "Explore",
      athletes: "Athletes",
      plans: "Plans",
      profile: "Profile"
    },
    explore: {
      title: "Explore",
      createPost: "Share your thoughts...",
      postButton: "Post",
      communities: "Communities",
      allCommunities: "All"
    },
    posts: {
      like: "Like",
      comment: "Comment",
      share: "Share",
      translate: "Translate",
      translating: "Translating..."
    }
  },
  hi: {
    navigation: {
      home: "होम",
      explore: "खोजें",
      athletes: "खिलाड़ी",
      plans: "योजनाएं",
      profile: "प्रोफ़ाइल"
    },
    explore: {
      title: "खोजें",
      createPost: "अपने विचार साझा करें...",
      postButton: "पोस्ट करें",
      communities: "समुदाय",
      allCommunities: "सभी"
    },
    posts: {
      like: "पसंद",
      comment: "टिप्पणी",
      share: "साझा करें",
      translate: "अनुवाद करें",
      translating: "अनुवाद हो रहा है..."
    }
  },
  ml: {
    navigation: {
      home: "ഹോം",
      explore: "പര്യവേക്ഷണം",
      athletes: "കായികതാരങ്ങൾ",
      plans: "പ്ലാനുകൾ",
      profile: "പ്രൊഫൈൽ"
    },
    explore: {
      title: "പര്യവേക്ഷണം",
      createPost: "നിങ്ങളുടെ ചിന്തകൾ പങ്കിടുക...",
      postButton: "പോസ്റ്റ് ചെയ്യുക",
      communities: "കമ്മ്യൂണിറ്റികൾ",
      allCommunities: "എല്ലാം"
    },
    posts: {
      like: "ഇഷ്ടം",
      comment: "കമന്റ്",
      share: "പങ്കിടുക",
      translate: "വിവർത്തനം ചെയ്യുക",
      translating: "വിവർത്തനം ചെയ്യുന്നു..."
    }
  },
  mr: {
    navigation: {
      home: "होम",
      explore: "एक्सप्लोर",
      athletes: "खेळाडू",
      plans: "योजना",
      profile: "प्रोफाइल"
    },
    explore: {
      title: "एक्सप्लोर",
      createPost: "तुमचे विचार शेअर करा...",
      postButton: "पोस्ट करा",
      communities: "समुदाय",
      allCommunities: "सर्व"
    },
    posts: {
      like: "आवडले",
      comment: "टिप्पणी",
      share: "शेअर करा",
      translate: "भाषांतर करा",
      translating: "भाषांतर होत आहे..."
    }
  }
};

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
];

const LANGUAGE_STORAGE_KEY = '@OneNationOneAthlete:language';

const SimpleLanguageContext = createContext({
  currentLanguage: 'en',
  availableLanguages: SUPPORTED_LANGUAGES,
  changeLanguage: () => {},
  t: () => '',
});

export function SimpleLanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage && translations[savedLanguage]) {
        setCurrentLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('Error loading saved language:', error);
    }
  };

  const changeLanguage = async (languageCode) => {
    try {
      if (translations[languageCode]) {
        setCurrentLanguage(languageCode);
        await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
        console.log('Language changed to:', languageCode);
      }
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[currentLanguage];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        // Fallback to English if key not found
        value = translations.en;
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object') {
            value = value[fallbackKey];
          } else {
            return key; // Return key if not found
          }
        }
        break;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  const getLanguageName = (code) => {
    const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
    return lang ? lang.nativeName : code;
  };

  const value = {
    currentLanguage,
    availableLanguages: SUPPORTED_LANGUAGES,
    changeLanguage,
    t,
    getLanguageName,
  };

  return (
    <SimpleLanguageContext.Provider value={value}>
      {children}
    </SimpleLanguageContext.Provider>
  );
}

export function useSimpleTranslation() {
  const context = useContext(SimpleLanguageContext);
  if (!context) {
    throw new Error('useSimpleTranslation must be used within a SimpleLanguageProvider');
  }
  return { t: context.t, i18n: { language: context.currentLanguage } };
}

export function useSimpleLanguage() {
  const context = useContext(SimpleLanguageContext);
  if (!context) {
    throw new Error('useSimpleLanguage must be used within a SimpleLanguageProvider');
  }
  return context;
}

export { SUPPORTED_LANGUAGES };
