import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, FlatList, Modal, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { usePosts } from '../../context/PostsContext';
import BlindUserVoiceAssistant from '../../components/BlindUserVoiceAssistant';
import { useUser } from '../../context/UserContext';
import { certificateService } from '../../services/supabaseConfig';

export default function Profile() {
  const navigation = useNavigation();
  const postsContext = usePosts();
  const { posts = [] } = postsContext || {};
  const { userProfile } = useUser();
  const [tab, setTab] = useState('personal'); // 'personal' | 'updates'
  const [showCertificatesModal, setShowCertificatesModal] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load certificates on component mount
  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      // For now, use mock data. Replace with actual user ID when auth is implemented
      const mockUserId = 'user-123';
      
      // Try to load from Supabase, fallback to mock data if not configured
      try {
        const userCertificates = await certificateService.getUserCertificates(mockUserId);
        if (userCertificates.length > 0) {
          setCertificates(userCertificates);
        } else {
          // Set default certificates if none exist
          setDefaultCertificates();
        }
      } catch (error) {
        console.log('Supabase not configured, using mock data');
        setDefaultCertificates();
      }
    } catch (error) {
      console.error('Error loading certificates:', error);
      setDefaultCertificates();
    } finally {
      setLoading(false);
    }
  };

  const setDefaultCertificates = () => {
    setCertificates([
      {
        id: '1',
        name: 'National Athletics Championship - Gold Medal',
        issuer: 'National Athletics Federation',
        date: '2024-08-15',
        image: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=400&h=300&fit=crop',
        description: 'First place in 100m sprint at the National Athletics Championship'
      },
      {
        id: '2',
        name: 'State Level Sprint Championship - Silver Medal',
        issuer: 'State Athletics Board',
        date: '2024-06-20',
        image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop',
        description: 'Second place in 200m sprint at the State Level Championship'
      }
    ]);
  };

  const handleLogout = () => {
    navigation.getParent()?.replace('RoleSelect');
  };

  const handleCertificatesPress = () => {
    setShowCertificatesModal(true);
  };

  const handleViewCertificates = () => {
    setShowCertificatesModal(false);
    navigation.navigate('ViewCertificates', { certificates });
  };

  const handleAddCertificate = async () => {
    setShowCertificatesModal(false);
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setLoading(true);
        
        const mockUserId = 'user-123';
        let imageUrl = result.assets[0].uri;
        
        // Try to upload to Supabase, fallback to local URI
        try {
          imageUrl = await certificateService.uploadCertificateImage(
            { uri: result.assets[0].uri },
            mockUserId
          );
        } catch (error) {
          console.log('Using local image URI, Supabase not configured');
        }

        const newCertificate = {
          id: Date.now().toString(),
          user_id: mockUserId,
          name: 'New Certificate',
          issuer: 'Certificate Authority',
          date: new Date().toISOString().split('T')[0],
          image: imageUrl,
          image_url: imageUrl,
          description: 'Recently added certificate'
        };

        // Try to save to Supabase, fallback to local state
        try {
          const savedCertificate = await certificateService.saveCertificate(newCertificate);
          setCertificates(prev => [savedCertificate, ...prev]);
        } catch (error) {
          console.log('Saving locally, Supabase not configured');
          setCertificates(prev => [newCertificate, ...prev]);
        }
        
        Alert.alert('Certificate Added', 'Your certificate has been successfully added to your profile.');
      }
    } catch (error) {
      console.error('Error adding certificate:', error);
      Alert.alert('Error', 'Failed to add certificate. Please try again.');
    } finally {
      setLoading(false);
    }
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
              source={require('../../../assets/pfp.jpg')}
              style={styles.avatar}
              accessibilityLabel="Profile photo"
            />
            <TouchableOpacity style={styles.qrButton} onPress={handleCertificatesPress}>
              <Ionicons name="qr-code" size={24} color="#f97316" />
            </TouchableOpacity>
            <Text style={styles.name}>Pranay Nair</Text>
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
      <BlindUserVoiceAssistant 
        navigation={navigation} 
        screenName="Profile" 
        userProfile={userProfile}
        screenData={{
          posts: posts,
          currentTab: tab
        }}
      />

      {/* Certificates Modal */}
      <Modal
        visible={showCertificatesModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCertificatesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Certificates & Achievements</Text>
              <TouchableOpacity onPress={() => setShowCertificatesModal(false)}>
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalOptions}>
              <TouchableOpacity style={styles.optionButton} onPress={handleViewCertificates}>
                <View style={styles.optionIcon}>
                  <Ionicons name="eye" size={24} color="#2563eb" />
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>View Certificates</Text>
                  <Text style={styles.optionSubtitle}>See all your certificates and achievements</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionButton} onPress={handleAddCertificate}>
                <View style={styles.optionIcon}>
                  <Ionicons name="add-circle" size={24} color="#10b981" />
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>Add Certificate</Text>
                  <Text style={styles.optionSubtitle}>Upload a new certificate or achievement</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <View style={styles.certificatesPreview}>
              <Text style={styles.previewTitle}>Recent Certificates ({certificates.length})</Text>
              {certificates.slice(0, 2).map((cert) => (
                <View key={cert.id} style={styles.certificateItem}>
                  <Image source={{ uri: cert.image }} style={styles.certificateImage} />
                  <View style={styles.certificateInfo}>
                    <Text style={styles.certificateName} numberOfLines={2}>{cert.name}</Text>
                    <Text style={styles.certificateIssuer}>{cert.issuer}</Text>
                    <Text style={styles.certificateDate}>{cert.date}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  content: { padding: 20 },
  header: { alignItems: 'center', marginBottom: 16, position: 'relative' },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#f97316' },
  qrButton: {
    position: 'absolute',
    top: 0,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
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
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalOptions: {
    padding: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  certificatesPreview: {
    paddingHorizontal: 20,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  certificateItem: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  certificateImage: {
    width: 60,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#e5e7eb',
    marginRight: 12,
  },
  certificateInfo: {
    flex: 1,
  },
  certificateName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  certificateIssuer: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  certificateDate: {
    fontSize: 11,
    color: '#9ca3af',
  },
});

