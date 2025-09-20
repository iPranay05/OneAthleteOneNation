# Multi-Language Integration Setup

## 📦 Required Dependencies

Install the following packages:

```bash
npm install i18next react-i18next @react-native-async-storage/async-storage
```

## 🔑 Environment Variables

Add your Hugging Face API key to your `.env` file:

```env
EXPO_PUBLIC_HUGGINGFACE_API_KEY=your_huggingface_api_key_here
```

Get your free API key from: https://huggingface.co/settings/tokens

## 🌐 Supported Languages

- **English** (en) - Default
- **Hindi** (hi) - हिंदी  
- **Malayalam** (ml) - മലയാളം
- **Marathi** (mr) - मराठी

## 🚀 Features Implemented

### ✅ Instant UI Translation (i18n)
- All navigation labels, buttons, and UI text
- Instant language switching (0ms)
- Persistent language selection
- Offline support

### ✅ Smart Content Translation (Helsinki-NLP)
- User-generated posts and comments
- On-demand translation with caching
- Auto language detection
- Fallback to original text on errors

### ✅ Components Created

1. **LanguageToggle** - Language selection modal
2. **CompactLanguageToggle** - Quick toggle for headers
3. **TranslatablePost** - Posts with translation capability
4. **LanguageContext** - Global language management

## 📱 How to Use

### Add Language Toggle to Any Screen

```javascript
import LanguageToggle, { CompactLanguageToggle } from '../components/LanguageToggle';

// Full language selector
<LanguageToggle showLabel={true} />

// Compact toggle for headers
<CompactLanguageToggle />
```

### Use Translations in Components

```javascript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <Text>{t('navigation.home')}</Text>
  );
};
```

### Translate User Content

```javascript
import { useContentTranslation } from '../context/LanguageContext';

const PostComponent = ({ post }) => {
  const { translateAndCache, isTranslating } = useContentTranslation();
  
  const handleTranslate = async () => {
    const translated = await translateAndCache(post.content);
    // Use translated content
  };
};
```

## 🎯 Integration Steps

### 1. Add Language Toggle to Navigation

Add to your main screens (Profile, Settings, etc.):

```javascript
// In your header or profile screen
import LanguageToggle from '../components/LanguageToggle';

<LanguageToggle showLabel={true} style={{ marginRight: 16 }} />
```

### 2. Replace Hardcoded Text

Replace all hardcoded strings with translation keys:

```javascript
// Before
<Text>Explore</Text>

// After  
<Text>{t('navigation.explore')}</Text>
```

### 3. Use TranslatablePost Component

Replace your existing post components:

```javascript
// Before
<PostComponent post={post} />

// After
<TranslatablePost 
  post={post} 
  onUserPress={handleUserPress}
  showTranslateButton={true}
/>
```

## 🔧 Configuration

### Language Detection Priority
1. User's saved preference (AsyncStorage)
2. Device language (if supported)
3. Default to English

### Translation Models Used
- **English ↔ Hindi**: `Helsinki-NLP/opus-mt-en-hi`
- **English ↔ Malayalam**: `Helsinki-NLP/opus-mt-en-ml`  
- **English ↔ Marathi**: `Helsinki-NLP/opus-mt-en-mr`
- **Fallback**: Multilingual models for unsupported pairs

### Caching Strategy
- UI translations: Instant (pre-loaded)
- Content translations: Cached in AsyncStorage
- Cache persists across app restarts
- Automatic cache cleanup

## 📊 Performance

| Feature | Speed | Offline | Cost |
|---------|-------|---------|------|
| UI Translation | Instant | ✅ Yes | Free |
| Content Translation | 1-3s | ❌ No | ~$0.001/request |
| Language Toggle | Instant | ✅ Yes | Free |

## 🐛 Troubleshooting

### Translation Not Working
1. Check Hugging Face API key in `.env`
2. Verify internet connection
3. Check console for error messages

### Language Not Persisting
1. Ensure AsyncStorage permissions
2. Check if LanguageProvider is wrapping your app

### Slow Translations
1. Translations are cached after first use
2. Consider pre-translating popular content
3. Check network connection

## 🎨 Customization

### Add New Language
1. Add language to `SUPPORTED_LANGUAGES` in `LanguageContext.js`
2. Create translation file in `src/i18n/locales/`
3. Add Helsinki-NLP model mapping if available

### Customize Translation UI
- Modify `TranslatablePost.js` for different layouts
- Style `LanguageToggle.js` to match your design
- Add custom translation indicators

## 🚀 Next Steps

1. **Install dependencies** and add API key
2. **Add LanguageToggle** to your main screens
3. **Replace hardcoded text** with translation keys
4. **Test language switching** across all screens
5. **Deploy and gather user feedback**

Your app now supports 4 languages with instant UI switching and smart content translation! 🌍
