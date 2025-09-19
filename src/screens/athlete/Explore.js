import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, FlatList, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { usePosts } from '../../context/PostsContext';
import { useActivities } from '../../context/ActivitiesContext';

export default function Explore() {
  const navigation = useNavigation();
  const postsContext = usePosts();
  const { posts = [], addPost } = postsContext || {};
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

  const handlePost = () => {
    const trimmed = text.trim();
    const media = mediaUrl.trim();
    if (!trimmed && !media) return;

    const mediaType = media ? (isImage(media) ? 'image' : isVideo(media) ? 'video' : 'link') : 'none';

    addPost({
      name: 'Alex Runner',
      sport: selectedCommunity === 'All' ? 'Track & Field' : selectedCommunity,
      avatar: require('../../../assets/icon.png'),
      text: trimmed,
      mediaUrl: media,
      mediaType,
    });
    setText('');
    setMediaUrl('');
  };

  const renderPostItem = ({ item }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Image source={item.avatar} style={styles.postAvatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.postName}>{item.name}</Text>
          <Text style={styles.postSub}>@{item.sport.toLowerCase().replace(/\s+/g, '')}</Text>
        </View>
        <Ionicons name="ellipsis-horizontal" size={18} color="#9ca3af" />
      </View>
      {!!item.text && <Text style={styles.postText}>{item.text}</Text>}

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
          <Text style={styles.actionLabel}>Like</Text>
        </View>
        <View style={styles.actionBtn}>
          <Ionicons name="chatbubble-outline" size={18} color="#6b7280" />
          <Text style={styles.actionLabel}>Comment</Text>
        </View>
        <View style={styles.actionBtn}>
          <Ionicons name="share-social-outline" size={18} color="#6b7280" />
          <Text style={styles.actionLabel}>Share</Text>
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
    const set = new Set(['All']);
    posts.forEach((p) => p?.sport && set.add(p.sport));
    activities.forEach((a) => a?.sport && set.add(a.sport));
    return Array.from(set);
  }, [posts, activities]);

  const filteredPosts = useMemo(() => {
    if (selectedCommunity === 'All') return posts;
    return posts.filter((p) => p.sport === selectedCommunity);
  }, [posts, selectedCommunity]);

  const filteredActivities = useMemo(() => {
    if (selectedCommunity === 'All') return activities;
    return activities.filter((a) => a.sport === selectedCommunity);
  }, [activities, selectedCommunity]);

  return (
    <View style={styles.container}>
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
          <Text style={[styles.toggleText, mode === 'posts' && styles.toggleTextActive]}>Posts</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setMode('activities')} style={[styles.toggleBtn, mode === 'activities' && styles.toggleBtnActive]}>
          <Text style={[styles.toggleText, mode === 'activities' && styles.toggleTextActive]}>Activities</Text>
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
              placeholder={`Share to ${selectedCommunity === 'All' ? 'Track & Field' : selectedCommunity}...`}
              placeholderTextColor="#9ca3af"
              style={styles.textArea}
              multiline
            />
          </View>
          <TextInput
            value={mediaUrl}
            onChangeText={setMediaUrl}
            placeholder="Paste photo/video URL (optional)"
            placeholderTextColor="#9ca3af"
            style={styles.urlInput}
          />
          <TouchableOpacity style={styles.postBtn} onPress={handlePost}>
            <Ionicons name="send" size={16} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.postBtnText}>Post</Text>
          </TouchableOpacity>
        </View>
      )}

      {mode === 'posts' ? (
        <FlatList
          data={filteredPosts}
          keyExtractor={keyExtractor}
          renderItem={renderPostItem}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.emptyText}>No posts yet.</Text>}
        />
      ) : (
        <FlatList
          data={filteredActivities}
          keyExtractor={keyExtractor}
          renderItem={renderActivityItem}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.emptyText}>No activities yet.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff', padding: 16 },
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
});
