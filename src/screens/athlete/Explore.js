import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, FlatList, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { usePosts } from '../../context/PostsContext';
import { useActivities } from '../../context/ActivitiesContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import LanguageToggle from '../../components/LanguageToggle';

export default function Explore() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const postsContext = usePosts();
  const { posts = [], addPost, isLoading } = postsContext || {};
  const [text, setText] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState('All');
  const [mode, setMode] = useState('posts'); // 'posts' | 'activities'
  const { activities } = useActivities();

  // Map sport/community name to an Ionicons icon with better sport-specific icons
  const sportIcon = (label) => {
    const key = String(label || '').toLowerCase();
    if (key === 'all') return 'globe-outline';
    if (key.includes('kabaddi') || key.includes('kabad')) return 'people-outline';
    if (key.includes('badminton')) return 'tennisball-outline';
    if (key.includes('track') || key.includes('running') || key.includes('athletics')) return 'walk-outline';
    if (key.includes('football') || key.includes('soccer')) return 'football-outline';
    if (key.includes('basketball') || key.includes('basket')) return 'basketball-outline';
    if (key.includes('cricket')) return 'baseball-outline';
    if (key.includes('hockey')) return 'american-football-outline';
    if (key.includes('swimming') || key.includes('swim')) return 'water-outline';
    if (key.includes('cycling') || key.includes('bike')) return 'bicycle-outline';
    if (key.includes('tennis')) return 'tennisball-outline';
    if (key.includes('volleyball') || key.includes('volley')) return 'basketball-outline';
    if (key.includes('boxing') || key.includes('martial')) return 'fitness-outline';
    if (key.includes('wrestling')) return 'barbell-outline';
    if (key.includes('weightlifting') || key.includes('weight')) return 'barbell-outline';
    if (key.includes('archery')) return 'locate-outline';
    if (key.includes('shooting')) return 'radio-button-on-outline';
    return 'trophy-outline';
  };

  const isImage = (url) => /\.(png|jpe?g|gif|webp)$/i.test(url);
  const isVideo = (url) => /\.(mp4|mov|webm|m4v|avi)$/i.test(url);

  const handlePost = async () => {
    const trimmed = text.trim();
    const media = mediaUrl.trim();
    if (!trimmed && !media) return;

    const mediaType = media ? (isImage(media) ? 'image' : isVideo(media) ? 'video' : 'link') : 'none';

    const newPost = {
      name: 'Alex Runner',
      author: 'Alex Runner',
      sport: selectedCommunity === 'All' ? 'Track & Field' : selectedCommunity,
      avatar: require('../../../assets/icon.png'),
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      text: trimmed,
      content: trimmed,
      mediaUrl: media || null,
      mediaType,
      authorRole: 'athlete',
      isCoachPost: false,
      likes: 0,
      comments: 0,
      community: selectedCommunity === 'All' ? 'Track & Field' : selectedCommunity,
    };

    try {
      console.log('Athlete creating post:', newPost);
      await addPost(newPost);
      setText('');
      setMediaUrl('');
      Alert.alert(t('messages.success'), t('explore.postSuccess'));
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert(t('messages.error'), t('explore.postError'));
    }
  };

  const handleUserPress = (post) => {
    if (!post || (!post.name && !post.author)) {
      console.warn('Invalid post data for user press:', post);
      return;
    }

    const userId = post.authorId || post.id || 'user-' + (post.name || post.author).replace(/\s+/g, '-').toLowerCase();
    const userType = (post.isCoachPost || post.authorRole === 'coach') ? 'coach' : 'athlete';
    const userName = post.name || post.author;
    const userAvatar = post.authorAvatar || (typeof post.avatar === 'string' ? post.avatar : null);

    console.log('Navigating to UserProfile with:', { userId, userType, userName, userAvatar });

    navigation.navigate('UserProfile', {
      userId,
      userType,
      userName,
      userAvatar,
    });
  };

  const renderPostItem = ({ item }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <TouchableOpacity onPress={() => handleUserPress(item)}>
          <Image 
            source={
              typeof item.avatar === 'string' 
                ? { uri: item.avatar } 
                : item.avatar || item.authorAvatar 
                  ? { uri: item.authorAvatar }
                  : require('../../../assets/icon.png')
            } 
            style={styles.postAvatar} 
          />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <TouchableOpacity onPress={() => handleUserPress(item)}>
            <View style={styles.authorNameContainer}>
              <Text style={styles.postName}>{item.name || item.author}</Text>
              {(item.isCoachPost || item.authorRole === 'coach') && (
                <View style={styles.coachBadge}>
                  <Ionicons name="school" size={10} color="#ffffff" />
                  <Text style={styles.coachBadgeText}>{t('posts.coachBadge')}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
          <Text style={styles.postSub}>
            @{(item.sport || item.community || 'general').toLowerCase().replace(/\s+/g, '')}
          </Text>
        </View>
        <Ionicons name="ellipsis-horizontal" size={18} color="#9ca3af" />
      </View>
      {!!(item.text || item.content) && <Text style={styles.postText}>{item.text || item.content}</Text>}

      {item.mediaType === 'image' && !!item.mediaUrl && (
        <Image source={{ uri: item.mediaUrl }} style={styles.postImage} />
      )}

      {item.mediaType === 'video' && !!item.mediaUrl && (
        <View style={styles.videoPlaceholder}>
          <Ionicons name="videocam" size={28} color="#f97316" />
          <Text style={styles.videoText}>Video</Text>
          <Text numberOfLines={1} style={styles.videoLink}>{item.mediaUrl}</Text>
        </View>
      )}

      {item.mediaType === 'link' && !!item.mediaUrl && (
        <View style={styles.linkBox}>
          <Ionicons name="link" size={16} color="#6b7280" />
          <Text numberOfLines={1} style={styles.linkText}>{item.mediaUrl}</Text>
        </View>
      )}

      <View style={styles.actionsRow}>
        <View style={styles.actionBtn}>
          <Ionicons name="heart-outline" size={18} color="#6b7280" />
          <Text style={styles.actionLabel}>{t('posts.like')}</Text>
        </View>
        <View style={styles.actionBtn}>
          <Ionicons name="chatbubble-outline" size={18} color="#6b7280" />
          <Text style={styles.actionLabel}>{t('posts.comment')}</Text>
        </View>
        <View style={styles.actionBtn}>
          <Ionicons name="share-social-outline" size={18} color="#6b7280" />
          <Text style={styles.actionLabel}>{t('posts.share')}</Text>
        </View>
      </View>
    </View>
  );

  const renderActivityItem = ({ item }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Image source={item.avatar} style={styles.postAvatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.postName}>{item.user}</Text>
          <Text style={styles.postSub}>@{item.sport.toLowerCase().replace(/\s+/g, '')}</Text>
        </View>
        <Ionicons name="calendar-outline" size={18} color="#9ca3af" />
      </View>
      <Text style={[styles.postName, { marginBottom: 4 }]}>{item.title}</Text>
      {!!item.description && <Text style={styles.postText}>{item.description}</Text>}
      <View style={{ flexDirection: 'row', marginTop: 8, alignItems: 'center' }}>
        <Ionicons name="time-outline" size={16} color="#6b7280" />
        <Text style={[styles.metaText, { marginLeft: 6 }]}>{item.when}</Text>
      </View>
      <View style={{ flexDirection: 'row', marginTop: 6, alignItems: 'center' }}>
        <Ionicons name="location-outline" size={16} color="#6b7280" />
        <Text style={[styles.metaText, { marginLeft: 6 }]}>{item.location}</Text>
      </View>
    </View>
  );

  const keyExtractor = (item) => item.id;

  const communities = useMemo(() => {
    const set = new Set([t('explore.allCommunities')]);
    posts.forEach((p) => p?.sport && set.add(t(`sports.${p.sport.toLowerCase().replace(/\s+/g, '')}`) || p.sport));
    activities.forEach((a) => a?.sport && set.add(t(`sports.${a.sport.toLowerCase().replace(/\s+/g, '')}`) || a.sport));
    return Array.from(set);
  }, [posts, activities, t]);

  const filteredPosts = useMemo(() => {
    let filtered;
    if (selectedCommunity === t('explore.allCommunities') || selectedCommunity === 'All') {
      filtered = posts;
    } else {
      filtered = posts.filter((p) => {
        const translatedSport = t(`sports.${p.sport?.toLowerCase().replace(/\s+/g, '')}`) || p.sport;
        const translatedCommunity = t(`sports.${p.community?.toLowerCase().replace(/\s+/g, '')}`) || p.community;
        return translatedSport === selectedCommunity || translatedCommunity === selectedCommunity || 
               p.sport === selectedCommunity || p.community === selectedCommunity;
      });
    }
    console.log('Athlete screen - Total posts:', posts.length, 'Filtered posts:', filtered.length);
    console.log('Athlete screen - Posts:', filtered.map(p => ({ id: p.id, author: p.author || p.name, isCoachPost: p.isCoachPost })));
    return filtered;
  }, [posts, selectedCommunity, t]);

  const filteredActivities = useMemo(() => {
    if (selectedCommunity === 'All') return activities;
    return activities.filter((a) => a.sport === selectedCommunity);
  }, [activities, selectedCommunity]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header with Language Toggle */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('explore.title')}</Text>
          <LanguageToggle showLabel={false} />
        </View>

        {/* Community selector (story-style) */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storyRow}>
        {communities.map((label) => {
          const selected = label === selectedCommunity;
          const iconName = sportIcon(label);
          return (
            <TouchableOpacity key={label} onPress={() => setSelectedCommunity(label)} style={styles.storyItem}>
              <View style={[styles.storyCircle, selected && styles.storyCircleSelected]}>
                <Ionicons name={iconName} size={28} color={selected ? '#ffffff' : '#f97316'} />
              </View>
              <Text numberOfLines={2} style={[styles.storyLabel, selected && styles.storyLabelSelected]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      

      {/* Toggle between Posts and Activities */}
      <View style={styles.toggleRow}>
        <TouchableOpacity onPress={() => setMode('posts')} style={[styles.toggleBtn, mode === 'posts' && styles.toggleBtnActive]}>
          <Text style={[styles.toggleText, mode === 'posts' && styles.toggleTextActive]}>{t('explore.posts')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setMode('activities')} style={[styles.toggleBtn, mode === 'activities' && styles.toggleBtnActive]}>
          <Text style={[styles.toggleText, mode === 'activities' && styles.toggleTextActive]}>{t('explore.activities')}</Text>
        </TouchableOpacity>
      </View>

      {/* Composer visible only for Posts */}
      {mode === 'posts' && (
        <View style={styles.composer}>
          <View style={styles.composerTop}>
            <Image source={require('../../../assets/icon.png')} style={styles.avatar} />
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder={t('explore.createPost')}
              placeholderTextColor="#9ca3af"
              style={styles.textArea}
              multiline
            />
          </View>
          <TextInput
            value={mediaUrl}
            onChangeText={setMediaUrl}
            placeholder={t('explore.mediaPlaceholder')}
            placeholderTextColor="#9ca3af"
            style={styles.urlInput}
          />
          <TouchableOpacity style={styles.postBtn} onPress={handlePost}>
            <Ionicons name="send" size={16} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.postBtnText}>{t('explore.postButton')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {mode === 'posts' ? (
        isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#f97316" />
            <Text style={styles.loadingText}>{t('explore.loading')}</Text>
          </View>
        ) : (
          <FlatList
            data={filteredPosts}
            keyExtractor={keyExtractor}
            renderItem={renderPostItem}
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubbles-outline" size={64} color="#9ca3af" />
                <Text style={styles.emptyText}>{t('explore.emptyPosts')}</Text>
                <Text style={styles.emptySubtext}>{t('explore.emptyPostsSubtext')}</Text>
              </View>
            }
          />
        )
      ) : (
        <FlatList
          data={filteredActivities}
          keyExtractor={keyExtractor}
          renderItem={renderActivityItem}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="fitness-outline" size={64} color="#9ca3af" />
              <Text style={styles.emptyText}>{t('explore.emptyActivities')}</Text>
              <Text style={styles.emptySubtext}>{t('explore.emptyActivitiesSubtext')}</Text>
            </View>
          }
        />
      )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  storyRow: { 
    paddingBottom: 12, 
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  storyItem: { 
    width: 80, 
    alignItems: 'center', 
    marginRight: 16,
  },
  storyCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ffffff',
    borderWidth: 3,
    borderColor: '#f97316',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  storyCircleSelected: { 
    backgroundColor: '#f97316', 
    borderColor: '#ea580c',
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  storyLabel: { 
    marginTop: 8, 
    maxWidth: 80, 
    color: '#6b7280', 
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 16,
  },
  storyLabelSelected: { 
    color: '#111827', 
    fontWeight: '700',
  },

  toggleRow: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    padding: 4,
    marginBottom: 10,
    marginTop: 8,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleBtnActive: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb' },
  toggleText: { color: '#6b7280', fontWeight: '700' },
  toggleTextActive: { color: '#111827' },
  composer: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  composerTop: { flexDirection: 'row', alignItems: 'flex-start' },
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 8, borderWidth: 2, borderColor: '#f97316' },
  textArea: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    color: '#111827',
  },
  urlInput: {
    marginTop: 8,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    color: '#111827',
  },
  postBtn: {
    marginTop: 10,
    alignSelf: 'flex-end',
    backgroundColor: '#f97316',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  postBtnText: { color: '#fff', fontWeight: '700' },
  emptyText: { textAlign: 'center', color: '#6b7280', marginTop: 16 },

  postCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  postAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 8, borderWidth: 2, borderColor: '#f97316' },
  postName: { color: '#111827', fontWeight: '800' },
  postSub: { color: '#6b7280', fontSize: 11 },
  postText: { color: '#111827', marginVertical: 6 },
  postImage: { width: '100%', height: 180, borderRadius: 10, marginTop: 6, backgroundColor: '#f3f4f6' },
  videoPlaceholder: { marginTop: 6, backgroundColor: '#f3f4f6', borderRadius: 10, padding: 12, alignItems: 'center' },
  videoText: { color: '#111827', fontWeight: '700', marginTop: 4 },
  videoLink: { color: '#6b7280', marginTop: 2, fontSize: 12 },
  linkBox: { flexDirection: 'row', alignItems: 'center', marginTop: 6, backgroundColor: '#f9fafb', padding: 8, borderRadius: 8 },
  linkText: { color: '#6b7280', marginLeft: 6 },
  metaText: { color: '#6b7280' },

  actionsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 8 },
  actionBtn: { flexDirection: 'row', alignItems: 'center' },
  actionLabel: { color: '#6b7280', marginLeft: 6 },

  // Coach badge styles
  authorNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coachBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 8,
    marginLeft: 6,
  },
  coachBadgeText: {
    fontSize: 8,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
  },
});
