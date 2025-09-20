import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useContentTranslation } from '../context/LanguageContext';

export default function TranslatablePost({ 
  post, 
  onUserPress, 
  style,
  showTranslateButton = true 
}) {
  const { t } = useTranslation();
  const { translateAndCache, isTranslating, currentLanguage } = useContentTranslation();
  const [translatedContent, setTranslatedContent] = useState(null);
  const [showOriginal, setShowOriginal] = useState(true);

  const handleTranslate = async () => {
    if (translatedContent && !showOriginal) {
      // Toggle back to original
      setShowOriginal(true);
      return;
    }

    if (translatedContent && showOriginal) {
      // Toggle to translated
      setShowOriginal(false);
      return;
    }

    // First time translation
    try {
      const translated = await translateAndCache(
        post.content || post.text,
        `post-${post.id}`
      );
      setTranslatedContent(translated);
      setShowOriginal(false);
    } catch (error) {
      console.error('Translation failed:', error);
    }
  };

  const isContentTranslatable = () => {
    const content = post.content || post.text || '';
    // Don't show translate button if content is too short or already in current language
    if (content.length < 10) return false;
    
    // Simple check - if current language is English and content has non-Latin characters
    if (currentLanguage === 'en' && /[\u0900-\u097F\u0D00-\u0D7F]/.test(content)) {
      return true;
    }
    
    // If current language is not English and content appears to be English
    if (currentLanguage !== 'en' && !/[\u0900-\u097F\u0D00-\u0D7F]/.test(content)) {
      return true;
    }
    
    return false;
  };

  const getDisplayContent = () => {
    if (!showOriginal && translatedContent) {
      return translatedContent;
    }
    return post.content || post.text || '';
  };

  const getTranslateButtonText = () => {
    if (isTranslating) {
      return t('posts.translating');
    }
    
    if (translatedContent) {
      return showOriginal ? t('posts.showTranslated') : t('posts.showOriginal');
    }
    
    return t('posts.translate');
  };

  return (
    <View style={[styles.postCard, style]}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <TouchableOpacity onPress={() => onUserPress?.(post)}>
          <Image 
            source={{ uri: post.authorAvatar || post.avatar }} 
            style={styles.avatar} 
          />
        </TouchableOpacity>
        <View style={styles.authorInfo}>
          <TouchableOpacity onPress={() => onUserPress?.(post)}>
            <View style={styles.authorNameContainer}>
              <Text style={styles.authorName}>
                {post.author || post.name}
              </Text>
              {(post.isCoachPost || post.authorRole === 'coach') && (
                <View style={styles.coachBadge}>
                  <Ionicons name="school" size={10} color="#ffffff" />
                  <Text style={styles.coachBadgeText}>{t('posts.coachBadge')}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
          <Text style={styles.timestamp}>
            {new Date(post.timestamp || post.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* Post Content */}
      <View style={styles.contentContainer}>
        <Text style={styles.postContent}>
          {getDisplayContent()}
        </Text>
        
        {/* Translation Status Indicator */}
        {!showOriginal && translatedContent && (
          <View style={styles.translationIndicator}>
            <Ionicons name="language" size={12} color="#6b7280" />
            <Text style={styles.translationIndicatorText}>
              {t('posts.showTranslated')}
            </Text>
          </View>
        )}
      </View>

      {/* Media */}
      {(post.mediaUrl || post.media_url) && post.mediaType !== 'none' && (
        <Image 
          source={{ uri: post.mediaUrl || post.media_url }} 
          style={styles.postImage}
          resizeMode="cover"
        />
      )}

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="heart-outline" size={18} color="#6b7280" />
          <Text style={styles.actionLabel}>{t('posts.like')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="chatbubble-outline" size={18} color="#6b7280" />
          <Text style={styles.actionLabel}>{t('posts.comment')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="share-social-outline" size={18} color="#6b7280" />
          <Text style={styles.actionLabel}>{t('posts.share')}</Text>
        </TouchableOpacity>

        {/* Translate Button */}
        {showTranslateButton && isContentTranslatable() && (
          <TouchableOpacity 
            style={[styles.actionBtn, styles.translateBtn]}
            onPress={handleTranslate}
            disabled={isTranslating}
          >
            {isTranslating ? (
              <ActivityIndicator size={16} color="#f97316" />
            ) : (
              <Ionicons name="language" size={16} color="#f97316" />
            )}
            <Text style={[styles.actionLabel, styles.translateLabel]}>
              {getTranslateButtonText()}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  postCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  coachBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  coachBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 2,
  },
  timestamp: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  contentContainer: {
    marginBottom: 12,
  },
  postContent: {
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
  },
  translationIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  translationIndicatorText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
    fontStyle: 'italic',
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  actionLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  translateBtn: {
    backgroundColor: '#fef3e2',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  translateLabel: {
    color: '#f97316',
    fontWeight: '500',
  },
});
