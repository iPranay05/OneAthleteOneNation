import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { usePosts } from '../../context/PostsContext';

export default function Profile() {
  const navigation = useNavigation();
  const { posts } = usePosts();
  const [tab, setTab] = useState('personal'); // 'personal' | 'updates'

  const handleLogout = () => {
    navigation.getParent()?.replace('RoleSelect');
  };
  const isImage = (url) => /(\.png|\.jpe?g|\.gif|\.webp)$/i.test(url || '');
  const isVideo = (url) => /(\.mp4|\.mov|\.webm|\.m4v|\.avi)$/i.test(url || '');
  const renderPostItem = ({ item }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Image source={item.avatar} style={styles.postAvatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.postName}>{item.name}</Text>
          <Text style={styles.postSub}>@{(item.sport || '').toLowerCase().replace(/\s+/g, '')}</Text>
        </View>
        <Ionicons name="ellipsis-horizontal" size={18} color="#9ca3af" />
      </View>
      {!!item.text && <Text style={styles.postText}>{item.text}</Text>}
      {item.mediaUrl && isImage(item.mediaUrl) && (
        <Image source={{ uri: item.mediaUrl }} style={styles.postImage} />
      )}
      {item.mediaUrl && isVideo(item.mediaUrl) && (
        <View style={styles.videoPlaceholder}>
          <Ionicons name="videocam" size={28} color="#f97316" />
          <Text style={styles.videoText}>Video</Text>
          <Text numberOfLines={1} style={styles.videoLink}>{item.mediaUrl}</Text>
        </View>
      )}
      {item.mediaUrl && !isImage(item.mediaUrl) && !isVideo(item.mediaUrl) && (
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

  return (
    <View style={styles.container}>
      {tab === 'personal' ? (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Image
              source={require('../../../assets/icon.png')}
              style={styles.avatar}
              accessibilityLabel="Profile photo"
            />
            <Text style={styles.name}>Alex Runner</Text>
            <Text style={styles.category}>Track & Field</Text>
          </View>

          <View style={styles.tabSwitch}>
            <TouchableOpacity style={[styles.tabBtn, styles.tabBtnActive]} onPress={() => setTab('personal')}>
              <Text style={[styles.tabBtnText, styles.tabBtnTextActive]}>Personal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabBtn} onPress={() => setTab('updates')}>
              <Text style={styles.tabBtnText}>Updates</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Age</Text>
              <Text style={styles.statValue}>21</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Height</Text>
              <Text style={styles.statValue}>178 cm</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Weight</Text>
              <Text style={styles.statValue}>68 kg</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Sports</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Expert in</Text>
              <Text style={styles.infoValue}>Track Sprinting (200m, 400m)</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Alternate</Text>
              <Text style={styles.infoValue}>Long Jump</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>About</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Trained by</Text>
              <Text style={styles.infoValue}>Coach Arjun Sharma</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>From</Text>
              <Text style={styles.infoValue}>Mumbai, India</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Contact</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>alex.runner@example.com</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>+91 98765 43210</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleLogout}>
            <Text style={styles.buttonText}>Logout (mock)</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id}
            renderItem={renderPostItem}
            contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 20, paddingTop: 20 }}
            ListHeaderComponent={
              <View>
                <View style={styles.header}>
                  <Image
                    source={require('../../../assets/icon.png')}
                    style={styles.avatar}
                    accessibilityLabel="Profile photo"
                  />
                  <Text style={styles.name}>Alex Runner</Text>
                  <Text style={styles.category}>Track & Field</Text>
                </View>
                <View style={styles.tabSwitch}>
                  <TouchableOpacity style={styles.tabBtn} onPress={() => setTab('personal')}>
                    <Text style={styles.tabBtnText}>Personal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.tabBtn, styles.tabBtnActive]} onPress={() => setTab('updates')}>
                    <Text style={[styles.tabBtnText, styles.tabBtnTextActive]}>Updates</Text>
                  </TouchableOpacity>
                </View>
              </View>
            }
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  content: { padding: 20 },
  header: { alignItems: 'center', marginBottom: 16 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#f97316' },
  name: { color: '#111827', fontSize: 22, fontWeight: '800', marginTop: 12 },
  category: { marginTop: 6, color: '#f97316', backgroundColor: '#fff7ed', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  statBox: { flex: 1, backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderWidth: 1, borderRadius: 12, paddingVertical: 12, marginHorizontal: 4, alignItems: 'center' },
  statLabel: { color: '#6b7280', fontSize: 12 },
  statValue: { color: '#111827', fontSize: 16, fontWeight: '700', marginTop: 2 },
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: { color: '#111827', fontSize: 16, fontWeight: '700', marginBottom: 8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  infoLabel: { color: '#6b7280' },
  infoValue: { color: '#111827', fontWeight: '600' },
  tabSwitch: { flexDirection: 'row', marginBottom: 12, backgroundColor: '#f3f4f6', borderRadius: 10, padding: 4 },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 8 },
  tabBtnActive: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb' },
  tabBtnText: { color: '#6b7280', fontWeight: '600' },
  tabBtnTextActive: { color: '#f97316' },
  postCard: { backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderWidth: 1, borderRadius: 14, padding: 12, marginBottom: 12 },
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
  actionsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 8 },
  actionBtn: { flexDirection: 'row', alignItems: 'center' },
  actionLabel: { color: '#6b7280', marginLeft: 6 },
  button: { backgroundColor: '#f97316', marginTop: 20, padding: 12, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
});

