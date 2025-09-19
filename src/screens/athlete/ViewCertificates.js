import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { certificateService } from '../../services/supabaseConfig';

const { width } = Dimensions.get('window');

export default function ViewCertificates({ route }) {
  const navigation = useNavigation();
  const [certificates, setCertificates] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  // Get certificates from route params or use default
  useEffect(() => {
    const initialCertificates = route?.params?.certificates || [
      {
        id: '1',
        name: 'National Athletics Championship - Gold Medal',
        issuer: 'National Athletics Federation',
        date: '2024-08-15',
        image: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=400&h=300&fit=crop',
        description: 'First place in 100m sprint at the National Athletics Championship',
      },
      {
        id: '2',
        name: 'State Level Sprint Championship - Silver Medal',
        issuer: 'State Athletics Board',
        date: '2024-06-20',
        image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop',
        description: 'Second place in 200m sprint at the State Level Championship',
      },
    ];
    setCertificates(initialCertificates);
  }, [route?.params?.certificates]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const mockUserId = 'user-123';
      const userCertificates = await certificateService.getUserCertificates(mockUserId);
      setCertificates(userCertificates);
    } catch (error) {
      console.log('Error refreshing certificates:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCertificatePress = (certificate) => {
    setSelectedCertificate(certificate);
  };

  const handleDeleteCertificate = (certificateId) => {
    Alert.alert(
      'Delete Certificate',
      'Are you sure you want to delete this certificate?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Try to delete from Supabase
              await certificateService.deleteCertificate(certificateId);
              setCertificates(prev => prev.filter(cert => cert.id !== certificateId));
              Alert.alert('Success', 'Certificate deleted successfully');
            } catch (error) {
              console.log('Deleting locally, Supabase not configured');
              setCertificates(prev => prev.filter(cert => cert.id !== certificateId));
              Alert.alert('Success', 'Certificate deleted successfully');
            }
          },
        },
      ]
    );
  };

  const renderCertificateCard = (certificate) => (
    <TouchableOpacity
      key={certificate.id}
      style={styles.certificateCard}
      onPress={() => handleCertificatePress(certificate)}
    >
      <Image source={{ uri: certificate.image }} style={styles.certificateImage} />
      <View style={styles.certificateContent}>
        <Text style={styles.certificateName} numberOfLines={2}>
          {certificate.name}
        </Text>
        <Text style={styles.certificateIssuer}>{certificate.issuer}</Text>
        <Text style={styles.certificateDate}>{certificate.date}</Text>
        {certificate.description && (
          <Text style={styles.certificateDescription} numberOfLines={2}>
            {certificate.description}
          </Text>
        )}
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteCertificate(certificate.id)}
      >
        <Ionicons name="trash-outline" size={20} color="#ef4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderGridView = () => (
    <View style={styles.gridContainer}>
      {certificates.map((certificate, index) => (
        <TouchableOpacity
          key={certificate.id}
          style={[styles.gridItem, index % 2 === 1 && styles.gridItemRight]}
          onPress={() => handleCertificatePress(certificate)}
        >
          <Image source={{ uri: certificate.image }} style={styles.gridImage} />
          <View style={styles.gridContent}>
            <Text style={styles.gridTitle} numberOfLines={2}>
              {certificate.name}
            </Text>
            <Text style={styles.gridDate}>{certificate.date}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Certificates</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="#f97316" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{certificates.length}</Text>
          <Text style={styles.statLabel}>Total Certificates</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {certificates.filter(cert => cert.date >= '2024-01-01').length}
          </Text>
          <Text style={styles.statLabel}>This Year</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {new Set(certificates.map(cert => cert.issuer)).size}
          </Text>
          <Text style={styles.statLabel}>Organizations</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {certificates.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="ribbon-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No Certificates Yet</Text>
            <Text style={styles.emptySubtitle}>
              Start adding your achievements and certificates to showcase your accomplishments
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>All Certificates</Text>
            {certificates.map(renderCertificateCard)}
          </>
        )}
      </ScrollView>

      {/* Certificate Detail Modal */}
      {selectedCertificate && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setSelectedCertificate(null)}
            >
              <Ionicons name="close" size={24} color="#111827" />
            </TouchableOpacity>
            <Image
              source={{ uri: selectedCertificate.image }}
              style={styles.modalImage}
            />
            <Text style={styles.modalTitle}>{selectedCertificate.name}</Text>
            <Text style={styles.modalIssuer}>{selectedCertificate.issuer}</Text>
            <Text style={styles.modalDate}>{selectedCertificate.date}</Text>
            {selectedCertificate.description && (
              <Text style={styles.modalDescription}>
                {selectedCertificate.description}
              </Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  addButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#f8fafc',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f97316',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 20,
    marginBottom: 16,
  },
  certificateCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  certificateImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  certificateContent: {
    flex: 1,
    marginLeft: 16,
  },
  certificateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  certificateIssuer: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  certificateDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  certificateDescription: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  deleteButton: {
    padding: 8,
    alignSelf: 'flex-start',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  gridItem: {
    width: (width - 52) / 2,
    marginHorizontal: 6,
    marginBottom: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  gridItemRight: {
    marginLeft: 6,
  },
  gridImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  gridContent: {
    padding: 12,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  gridDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalClose: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalIssuer: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 4,
  },
  modalDate: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
