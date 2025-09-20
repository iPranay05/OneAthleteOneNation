import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
  Linking,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCoachAssignment } from '../../context/CoachAssignmentContext';
import { useAuth } from '../../context/AuthContext';
import LanguageToggle from '../../components/LanguageToggle';

export default function MyCoaches({ navigation }) {
  const { t } = useTranslation();
  const {
    coachProfiles,
    coachAvailability,
    getAthleteCoaches,
    getAvailableCoaches,
    clearMockData
  } = useCoachAssignment();

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [athleteCoaches, setAthleteCoaches] = useState(null);
  const [loadingCoaches, setLoadingCoaches] = useState(true);
  const { user, profile } = useAuth();

  // Use real user ID from auth context
  const currentAthleteId = user?.id;

  useEffect(() => {
    loadAthleteCoaches();
  }, [currentAthleteId, user]);

  const loadAthleteCoaches = async () => {
    if (!currentAthleteId) {
      setLoadingCoaches(false);
      return;
    }

    try {
      setLoadingCoaches(true);
      const coaches = getAthleteCoaches(currentAthleteId);
      setAthleteCoaches(coaches);
      
      // If no coaches found and we have real coaches available, show info
      if (!coaches && Object.keys(coachProfiles).length > 0) {
        console.log('No coach assignments found for athlete:', currentAthleteId);
        console.log('Available coaches:', Object.keys(coachProfiles));
      }
    } catch (error) {
      console.error('Error loading athlete coaches:', error);
    } finally {
      setLoadingCoaches(false);
    }
  };

  const handleContactCoach = (coach, method) => {
    if (method === 'phone') {
      Linking.openURL(`tel:${coach.contactInfo.phone}`);
    } else if (method === 'email') {
      Linking.openURL(`mailto:${coach.contactInfo.email}`);
    } else if (method === 'message') {
      navigation.navigate('DirectMessage', { 
        recipientId: coach.id,
        recipientName: coach.name,
        recipientRole: 'coach'
      });
    }
  };

  const handleRequestCoach = (coach) => {
    Alert.alert(
      t('myCoaches.requestSent'),
      t('myCoaches.requestSentMessage', { coachName: coach.name }),
      [{ text: t('common.ok') }]
    );
    setShowRequestModal(false);
  };

  const renderPrimaryCoach = () => {
    if (!athleteCoaches?.primaryCoach) {
      return (
        <View style={styles.noPrimaryCoach}>
          <Ionicons name="person-add" size={48} color="#9ca3af" />
          <Text style={styles.noPrimaryCoachTitle}>{t('myCoaches.noPrimaryCoach')}</Text>
          <Text style={styles.noPrimaryCoachText}>{t('myCoaches.noPrimaryCoachMessage')}</Text>
          <TouchableOpacity 
            style={styles.requestCoachButton}
            onPress={() => setShowRequestModal(true)}
          >
            <Text style={styles.requestCoachButtonText}>{t('myCoaches.requestCoach')}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const primaryCoach = coachProfiles[athleteCoaches.primaryCoach.coachId];
    const availability = coachAvailability[athleteCoaches.primaryCoach.coachId];

    if (!primaryCoach) return null;

    return (
      <View style={styles.primaryCoachCard}>
        <View style={styles.coachBadge}>
          <Text style={styles.coachBadgeText}>{t('myCoaches.primaryCoach')}</Text>
        </View>
        
        <View style={styles.coachHeader}>
          <Text style={styles.coachAvatar}>{primaryCoach.avatar}</Text>
          <View style={styles.coachInfo}>
            <Text style={styles.coachName}>{primaryCoach.name}</Text>
            <Text style={styles.coachSpecialization}>{primaryCoach.specialization}</Text>
            <Text style={styles.coachExperience}>{primaryCoach.experience}</Text>
            
            <View style={styles.availabilityStatus}>
              <View style={[
                styles.statusDot, 
                { backgroundColor: availability?.status === 'available' ? '#10b981' : '#ef4444' }
              ]} />
              <Text style={styles.statusText}>
                {availability?.status === 'available' ? t('myCoaches.available') : t('myCoaches.busy')}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.coachDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="star" size={16} color="#f59e0b" />
            <Text style={styles.detailText}>{t('myCoaches.rating')}: {primaryCoach.rating}/5</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="language" size={16} color="#6b7280" />
            <Text style={styles.detailText}>{primaryCoach.languages.join(', ')}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="school" size={16} color="#6b7280" />
            <Text style={styles.detailText}>{primaryCoach.certifications[0]}</Text>
          </View>
        </View>

        <View style={styles.contactActions}>
          <TouchableOpacity 
            style={[styles.contactButton, styles.messageButton]}
            onPress={() => handleContactCoach(primaryCoach, 'message')}
          >
            <Ionicons name="chatbubble" size={16} color="#ffffff" />
            <Text style={styles.contactButtonText}>{t('myCoaches.message')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.contactButton, styles.callButton]}
            onPress={() => handleContactCoach(primaryCoach, 'phone')}
          >
            <Ionicons name="call" size={16} color="#ffffff" />
            <Text style={styles.contactButtonText}>{t('myCoaches.call')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.contactButton, styles.emailButton]}
            onPress={() => handleContactCoach(primaryCoach, 'email')}
          >
            <Ionicons name="mail" size={16} color="#ffffff" />
            <Text style={styles.contactButtonText}>{t('myCoaches.email')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSecondaryCoaches = () => {
    if (!athleteCoaches?.secondaryCoaches || athleteCoaches.secondaryCoaches.length === 0) {
      return (
        <View style={styles.noSecondaryCoaches}>
          <Text style={styles.noSecondaryCoachesText}>{t('myCoaches.noBackupCoaches')}</Text>
          <TouchableOpacity 
            style={styles.addBackupButton}
            onPress={() => setShowRequestModal(true)}
          >
            <Ionicons name="add-circle" size={20} color="#f97316" />
            <Text style={styles.addBackupButtonText}>{t('myCoaches.addBackupCoach')}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.secondaryCoachesSection}>
        {athleteCoaches.secondaryCoaches.map((assignment, index) => {
          const coach = coachProfiles[assignment.coachId];
          const availability = coachAvailability[assignment.coachId];
          
          if (!coach) return null;

          return (
            <View key={assignment.coachId} style={styles.secondaryCoachCard}>
              <View style={styles.backupBadge}>
                <Text style={styles.backupBadgeText}>
                  {t('myCoaches.backup')} #{assignment.priority}
                </Text>
              </View>
              
              <View style={styles.secondaryCoachHeader}>
                <Text style={styles.secondaryCoachAvatar}>{coach.avatar}</Text>
                <View style={styles.secondaryCoachInfo}>
                  <Text style={styles.secondaryCoachName}>{coach.name}</Text>
                  <Text style={styles.secondaryCoachSpec}>{coach.specialization}</Text>
                  
                  <View style={styles.availabilityStatus}>
                    <View style={[
                      styles.statusDot, 
                      { backgroundColor: availability?.status === 'available' ? '#10b981' : '#ef4444' }
                    ]} />
                    <Text style={styles.statusText}>
                      {availability?.status === 'available' ? t('myCoaches.available') : t('myCoaches.busy')}
                    </Text>
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={styles.quickMessageButton}
                  onPress={() => handleContactCoach(coach, 'message')}
                >
                  <Ionicons name="chatbubble" size={20} color="#f97316" />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderAvailableCoaches = ({ item: coach }) => {
    const availability = coachAvailability[coach.id];
    
    return (
      <TouchableOpacity 
        style={styles.availableCoachCard}
        onPress={() => {
          setSelectedCoach(coach);
        }}
      >
        <View style={styles.availableCoachHeader}>
          <Text style={styles.availableCoachAvatar}>{coach.avatar}</Text>
          <View style={styles.availableCoachInfo}>
            <Text style={styles.availableCoachName}>{coach.name}</Text>
            <Text style={styles.availableCoachSpec}>{coach.specialization}</Text>
            <Text style={styles.availableCoachExp}>{coach.experience}</Text>
          </View>
          
          <View style={styles.coachRating}>
            <Ionicons name="star" size={16} color="#f59e0b" />
            <Text style={styles.ratingText}>{coach.rating}</Text>
          </View>
        </View>
        
        <View style={styles.coachLanguages}>
          <Text style={styles.languagesLabel}>{t('myCoaches.languages')}: </Text>
          <Text style={styles.languagesText}>{coach.languages.join(', ')}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.requestButton}
          onPress={() => handleRequestCoach(coach)}
        >
          <Text style={styles.requestButtonText}>{t('myCoaches.sendRequest')}</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.screenTitle}>{t('myCoaches.title')}</Text>
          <LanguageToggle showLabel={false} />
        </View>

        {loadingCoaches ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#f97316" />
            <Text style={styles.loadingText}>{t('common.loading')}</Text>
          </View>
        ) : (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* User Info */}
            {user && (
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{profile?.full_name || user.email}</Text>
                <Text style={styles.userRole}>{t('myCoaches.athlete')}</Text>
                {Object.keys(coachProfiles).length > 0 ? (
                  <Text style={styles.coachCount}>
                    {Object.keys(coachProfiles).length} {t('myCoaches.registeredCoaches')}
                  </Text>
                ) : (
                  <Text style={styles.noCoachesText}>
                    {t('myCoaches.noRegisteredCoaches')}
                  </Text>
                )}
                
                {/* Debug Info */}
                <View style={styles.debugSection}>
                  <Text style={styles.debugTitle}>Debug Info:</Text>
                  <Text style={styles.debugText}>User ID: {user.id}</Text>
                  <Text style={styles.debugText}>Role: {profile?.role}</Text>
                  <Text style={styles.debugText}>
                    Coach IDs: {Object.keys(coachProfiles).join(', ') || 'None'}
                  </Text>
                  <TouchableOpacity 
                    style={styles.debugButton}
                    onPress={async () => {
                      console.log('Clearing mock data...');
                      await clearMockData();
                      await loadAthleteCoaches();
                    }}
                  >
                    <Text style={styles.debugButtonText}>Clear Mock Data & Refresh</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Primary Coach Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('myCoaches.myPrimaryCoach')}</Text>
              {renderPrimaryCoach()}
            </View>

          {/* Secondary Coaches Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('myCoaches.backupCoaches')}</Text>
            {renderSecondaryCoaches()}
          </View>

          {/* Coach Assignment History */}
          {athleteCoaches?.assignmentHistory && athleteCoaches.assignmentHistory.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('myCoaches.assignmentHistory')}</Text>
              <View style={styles.historyContainer}>
                {athleteCoaches.assignmentHistory.slice(0, 3).map((history, index) => (
                  <View key={index} style={styles.historyItem}>
                    <View style={styles.historyIcon}>
                      <Ionicons 
                        name={history.action.includes('assigned') ? 'person-add' : 
                              history.action.includes('removed') ? 'person-remove' : 'swap-horizontal'} 
                        size={16} 
                        color="#6b7280" 
                      />
                    </View>
                    <View style={styles.historyContent}>
                      <Text style={styles.historyAction}>
                        {history.action.replace('_', ' ').toUpperCase()}
                      </Text>
                      <Text style={styles.historyReason}>{history.reason}</Text>
                      <Text style={styles.historyDate}>
                        {new Date(history.timestamp).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
          </ScrollView>
        )}

        {/* Request Coach Modal */}
        <Modal
          visible={showRequestModal}
          transparent
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('myCoaches.requestNewCoach')}</Text>
                <TouchableOpacity onPress={() => setShowRequestModal(false)}>
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSubtitle}>{t('myCoaches.availableCoaches')}</Text>
              
              <FlatList
                data={getAvailableCoaches()}
                renderItem={renderAvailableCoaches}
                keyExtractor={(item) => item.id}
                style={styles.availableCoachesList}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </View>
        </Modal>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
  },
  userInfo: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  userRole: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  coachCount: {
    fontSize: 12,
    color: '#10b981',
    marginTop: 4,
    fontWeight: '600',
  },
  noCoachesText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
    fontWeight: '600',
  },
  debugSection: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
  },
  debugText: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 2,
  },
  debugButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  debugButtonText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  primaryCoachCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#f97316',
  },
  coachBadge: {
    backgroundColor: '#f97316',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  coachBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  coachHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  coachAvatar: {
    fontSize: 48,
    marginRight: 16,
  },
  coachInfo: {
    flex: 1,
  },
  coachName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  coachSpecialization: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 2,
  },
  coachExperience: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 2,
  },
  availabilityStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  coachDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  contactActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  messageButton: {
    backgroundColor: '#3b82f6',
  },
  callButton: {
    backgroundColor: '#10b981',
  },
  emailButton: {
    backgroundColor: '#6b7280',
  },
  contactButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  noPrimaryCoach: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  noPrimaryCoachTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  noPrimaryCoachText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  requestCoachButton: {
    backgroundColor: '#f97316',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  requestCoachButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryCoachesSection: {
    gap: 12,
  },
  secondaryCoachCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  backupBadge: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  backupBadgeText: {
    color: '#0369a1',
    fontSize: 10,
    fontWeight: '600',
  },
  secondaryCoachHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  secondaryCoachAvatar: {
    fontSize: 32,
    marginRight: 12,
  },
  secondaryCoachInfo: {
    flex: 1,
  },
  secondaryCoachName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  secondaryCoachSpec: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  quickMessageButton: {
    padding: 8,
  },
  noSecondaryCoaches: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  noSecondaryCoachesText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  addBackupButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addBackupButtonText: {
    color: '#f97316',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  historyContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  historyIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyAction: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  historyReason: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  historyDate: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 16,
  },
  availableCoachesList: {
    maxHeight: 400,
  },
  availableCoachCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  availableCoachHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  availableCoachAvatar: {
    fontSize: 32,
    marginRight: 12,
  },
  availableCoachInfo: {
    flex: 1,
  },
  availableCoachName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  availableCoachSpec: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  availableCoachExp: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  coachRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 4,
  },
  coachLanguages: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  languagesLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  languagesText: {
    fontSize: 12,
    color: '#6b7280',
  },
  requestButton: {
    backgroundColor: '#f97316',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  requestButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
