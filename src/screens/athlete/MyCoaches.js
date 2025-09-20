import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Linking,
  RefreshControl,
  ActivityIndicator,
  FlatList
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
  const [athleteRequests, setAthleteRequests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
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
      
      // Load athlete's requests
      const { coachAssignmentService } = await import('../../services/coachAssignmentService');
      const requests = await coachAssignmentService.getAthleteRequests(currentAthleteId);
      setAthleteRequests(requests);
      
      console.log('📋 Athlete requests:', requests.length);
      
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

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAthleteCoaches();
    setRefreshing(false);
  };

  const getRequestStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'accepted': return '#10b981';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const handleRequestCoach = async (coach) => {
    try {
      if (!user?.id) {
        Alert.alert('Error', 'Please log in to send coach requests');
        return;
      }

      // Import the service
      const { coachAssignmentService } = await import('../../services/coachAssignmentService');
      
      // Send the request
      await coachAssignmentService.sendCoachRequest(
        user.id,
        coach.id,
        `Hi ${coach.name}, I would like to request you as my coach. Looking forward to working with you!`
      );

      setSelectedCoach(coach);
      setShowRequestModal(false);
      
      // Refresh athlete requests to show the new request
      await loadAthleteCoaches();
      
      Alert.alert(
        t('myCoaches.requestSent'),
        t('myCoaches.requestSentMessage', { coachName: coach.name })
      );

      console.log('✅ Coach request sent successfully to:', coach.name);
    } catch (error) {
      console.error('Error sending coach request:', error);
      Alert.alert('Error', 'Failed to send coach request. Please try again.');
    }
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
    if (!coach) return null;
    
    const availability = coachAvailability[coach.id];
    
    return (
      <TouchableOpacity 
        style={styles.availableCoachCard}
        onPress={() => {
          setSelectedCoach(coach);
        }}
      >
        <View style={styles.availableCoachHeader}>
          <Text style={styles.availableCoachAvatar}>{coach.avatar || '👨‍🏫'}</Text>
          <View style={styles.availableCoachInfo}>
            <Text style={styles.availableCoachName}>{coach.name || 'Unknown Coach'}</Text>
            <Text style={styles.availableCoachSpec}>{coach.specialization || 'General Coach'}</Text>
            <Text style={styles.availableCoachExp}>{coach.experience || 'Experienced'}</Text>
          </View>
          
          <View style={styles.coachRating}>
            <Ionicons name="star" size={16} color="#f59e0b" />
            <Text style={styles.ratingText}>{coach.rating || '5.0'}</Text>
          </View>
        </View>
        
        <View style={styles.coachLanguages}>
          <Text style={styles.languagesLabel}>{t('myCoaches.languages')}: </Text>
          <Text style={styles.languagesText}>{coach.languages ? coach.languages.join(', ') : 'English'}</Text>
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
          <ScrollView 
            style={styles.content} 
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
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

          {/* My Requests Section */}
          {athleteRequests.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>My Coach Requests</Text>
                <TouchableOpacity 
                  style={styles.refreshButton}
                  onPress={onRefresh}
                >
                  <Ionicons name="refresh" size={20} color="#f97316" />
                  <Text style={styles.refreshButtonText}>Refresh</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.requestsContainer}>
                {athleteRequests.map((request) => {
                  const coach = coachProfiles[request.coach_id];
                  return (
                    <View key={request.id} style={styles.requestItem}>
                      <View style={styles.requestHeader}>
                        <View style={styles.requestCoachInfo}>
                          <Text style={styles.requestCoachName}>
                            {coach?.name || 'Unknown Coach'}
                          </Text>
                          <Text style={styles.requestDate}>
                            Sent: {new Date(request.created_at).toLocaleDateString()}
                          </Text>
                        </View>
                        <View style={[
                          styles.requestStatusBadge,
                          { backgroundColor: getRequestStatusColor(request.status) }
                        ]}>
                          <Text style={styles.requestStatusText}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </Text>
                        </View>
                      </View>
                      
                      {request.coach_response && (
                        <View style={styles.coachResponseSection}>
                          <Text style={styles.coachResponseLabel}>Coach Response:</Text>
                          <Text style={styles.coachResponseText}>{request.coach_response}</Text>
                        </View>
                      )}
                      
                      {request.status === 'accepted' && (
                        <TouchableOpacity 
                          style={styles.messageCoachButton}
                          onPress={() => navigation.navigate('DirectMessage', {
                            recipientId: request.coach_id,
                            recipientName: coach?.name || 'Coach',
                            recipientRole: 'coach'
                          })}
                        >
                          <Ionicons name="chatbubble" size={16} color="#ffffff" />
                          <Text style={styles.messageCoachButtonText}>Message Coach</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Coach Assignment History */}
          {athleteCoaches?.assignmentHistory && athleteCoaches.assignmentHistory.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('myCoaches.assignmentHistory')}</Text>
              <View style={styles.historyContainer}>
                {athleteCoaches.assignmentHistory.map((history, index) => (
                  <View key={index} style={styles.historyItem}>
                    <View style={styles.historyIcon}>
                      <Ionicons name="time" size={16} color="#6b7280" />
                    </View>
                    <View style={styles.historyContent}>
                      <Text style={styles.historyAction}>{history.action}</Text>
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
                data={getAvailableCoaches() || []}
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
  requestsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  requestItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  requestCoachInfo: {
    flex: 1,
  },
  requestCoachName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  requestDate: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  requestStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  requestStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  coachResponseSection: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  coachResponseLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  coachResponseText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  messageCoachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  messageCoachButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fef3e2',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f97316',
  },
  refreshButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f97316',
    marginLeft: 4,
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
