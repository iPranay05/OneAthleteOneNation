import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, FlatList, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import LanguageToggle from '../../components/LanguageToggle';
import { useNavigation } from '@react-navigation/native';
import { usePosts } from '../../context/PostsContext';
import { useActivities } from '../../context/ActivitiesContext';
import { useAuth } from '../../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CoachExplore() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const postsContext = usePosts();
  const { posts = [], addPost, isLoading, clearPosts } = postsContext || {};
  const { user, profile } = useAuth();
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
      name: profile?.full_name || user?.email || 'Coach',
      author: profile?.full_name || user?.email || 'Coach',
      authorRole: 'coach',
      avatar: profile?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      authorAvatar: profile?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      text: trimmed,
      content: trimmed,
      mediaUrl: media || null,
      mediaType,
      likes: 0,
      comments: 0,
      community: selectedCommunity === 'All' ? 'General' : selectedCommunity,
      sport: profile?.primary_sport || 'general',
      isCoachPost: true,
    };

    try {
      console.log('Coach creating post:', newPost);
      await addPost(newPost);
      setText('');
      setMediaUrl('');
      Alert.alert('Success', 'Your post has been shared with the community!');
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to share your post. Please try again.');
    }
  };

  const communities = useMemo(() => {
    const allCommunities = ['All', ...new Set(posts.map(p => p.community || 'General'))];
    return allCommunities;
  }, [posts]);

  const filteredPosts = useMemo(() => {
    let filtered = posts;
    if (selectedCommunity !== 'All') {
      filtered = filtered.filter(p => p.community === selectedCommunity);
    }
    const sorted = filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    console.log('Coach screen - Total posts:', posts.length, 'Filtered posts:', sorted.length);
    console.log('Coach screen - Posts:', sorted.map(p => ({ id: p.id, author: p.author || p.name, isCoachPost: p.isCoachPost })));
    return sorted;
  }, [posts, selectedCommunity]);

  const handleUserPress = (post) => {
    if (!post || !post.author) {
      console.warn('Invalid post data for user press:', post);
      return;
    }

    const userId = post.authorId || post.id || 'user-' + post.author.replace(/\s+/g, '-').toLowerCase();
    const userType = post.isCoachPost ? 'coach' : 'athlete';
    const userName = post.author;
    const userAvatar = post.authorAvatar;

    console.log('Navigating to UserProfile with:', { userId, userType, userName, userAvatar });

    navigation.navigate('UserProfile', {
      userId,
      userType,
      userName,
      userAvatar,
    });
  };

  const renderPost = ({ item }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <TouchableOpacity onPress={() => handleUserPress(item)}>
          <Image source={{ uri: item.authorAvatar }} style={styles.avatar} />
        </TouchableOpacity>
        <View style={styles.authorInfo}>
          <TouchableOpacity onPress={() => handleUserPress(item)}>
            <View style={styles.authorNameContainer}>
              <Text style={styles.authorName}>{item.author}</Text>
              {item.isCoachPost && (
                <View style={styles.coachBadge}>
                  <Ionicons name="school" size={12} color="#ffffff" />
                  <Text style={styles.coachBadgeText}>Coach</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
          <Text style={styles.postTime}>
            {new Date(item.timestamp).toLocaleString()}
          </Text>
        </View>
      </View>
      
      <Text style={styles.postContent}>{item.content}</Text>
      
      {item.mediaUrl && item.mediaType === 'image' && (
        <Image source={{ uri: item.mediaUrl }} style={styles.postImage} />
      )}
      
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="heart-outline" size={20} color="#6b7280" />
          <Text style={styles.actionText}>{item.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={20} color="#6b7280" />
          <Text style={styles.actionText}>{item.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCommunityTab = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.communityTab,
        selectedCommunity === item && styles.activeCommunityTab
      ]}
      onPress={() => setSelectedCommunity(item)}
    >
      <Ionicons 
        name={sportIcon(item)} 
        size={16} 
        color={selectedCommunity === item ? '#f97316' : '#6b7280'} 
      />
      <Text style={[
        styles.communityTabText,
        selectedCommunity === item && styles.activeCommunityTabText
      ]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header with Language Toggle */}
        <View style={styles.titleHeader}>
          <Text style={styles.screenTitle}>{t('explore.title')}</Text>
          <LanguageToggle showLabel={false} />
        </View>

        {/* Mode Toggle */}
        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'posts' && styles.activeModeButton]}
            onPress={() => setMode('posts')}
          >
            <Text style={[styles.modeButtonText, mode === 'posts' && styles.activeModeButtonText]}>
              {t('explore.posts')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'activities' && styles.activeModeButton]}
            onPress={() => setMode('activities')}
          >
            <Text style={[styles.modeButtonText, mode === 'activities' && styles.activeModeButtonText]}>
              {t('explore.activities')}
            </Text>
          </TouchableOpacity>
        </View>

        {mode === 'posts' ? (
          <>
            {/* Create Post Section */}
            <View style={styles.createPostSection}>
              <View style={styles.createPostHeader}>
                <Image 
                  source={{ 
                    uri: profile?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
                  }} 
                  style={styles.userAvatar} 
                />
                <Text style={styles.createPostTitle}>{t('coach.shareCoachingTips')}</Text>
              </View>
              
              <TextInput
                style={styles.postInput}
                placeholder={t('coach.whatsOnYourMind')}
                value={text}
                onChangeText={setText}
                multiline
                numberOfLines={3}
              />
              
              <TextInput
                style={styles.mediaInput}
                placeholder={t('explore.mediaPlaceholder')}
                value={mediaUrl}
                onChangeText={setMediaUrl}
              />
              
              <TouchableOpacity style={styles.postButton} onPress={handlePost}>
                <Ionicons name="send" size={16} color="#ffffff" />
                <Text style={styles.postButtonText}>{t('posts.share')}</Text>
              </TouchableOpacity>
            </View>

            {/* Community Tabs */}
            <FlatList
              data={communities}
              renderItem={renderCommunityTab}
              keyExtractor={(item) => item}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.communityTabs}
              contentContainerStyle={styles.communityTabsContent}
            />

            {/* Posts Feed */}
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#f97316" />
                <Text style={styles.loadingText}>Loading posts...</Text>
              </View>
            ) : (
              <FlatList
                data={filteredPosts}
                renderItem={renderPost}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.postsContainer}
                style={styles.postsList}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Ionicons name="chatbubbles-outline" size={64} color="#9ca3af" />
                    <Text style={styles.emptyText}>No posts yet</Text>
                    <Text style={styles.emptySubtext}>Be the first to share something!</Text>
                  </View>
                }
              />
            )}
          </>
        ) : (
          <View style={styles.activitiesContainer}>
            <Text style={styles.comingSoonText}>Activities feed coming soon!</Text>
            <Text style={styles.comingSoonSubtext}>
              View and interact with athlete activities and training sessions
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  titleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeModeButton: {
    backgroundColor: '#f97316',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeModeButtonText: {
    color: '#ffffff',
  },
  createPostSection: {
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  createPostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  createPostTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  postInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 12,
    minHeight: 80,
  },
  mediaInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
  },
  postButton: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  postButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  communityTabs: {
    marginBottom: 8,
    maxHeight: 50,
  },
  communityTabsContent: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  communityTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activeCommunityTab: {
    backgroundColor: '#fff7ed',
    borderColor: '#f97316',
  },
  communityTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginLeft: 6,
  },
  activeCommunityTabText: {
    color: '#f97316',
  },
  postsList: {
    flex: 1,
  },
  postsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Extra padding for tab bar
    paddingTop: 10,
  },
  postCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    marginRight: 8,
  },
  coachBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  coachBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 2,
  },
  postTime: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  postContent: {
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 6,
  },
  activitiesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  comingSoonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8,
  },
  comingSoonSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
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
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
