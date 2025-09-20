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
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCoachAssignment } from '../../context/CoachAssignmentContext';
import LanguageToggle from '../../components/LanguageToggle';

export default function CoachAssignments({ navigation }) {
  const { t } = useTranslation();
  const {
    coachAssignments,
    coachAvailability,
    coachProfiles,
    getCoachAthletes,
    getCoachWorkload,
    getSystemStats,
    updateCoachAvailability,
    handleCoachFailover,
    assignPrimaryCoach,
    addSecondaryCoach,
    removeCoach
  } = useCoachAssignment();

  const [selectedTab, setSelectedTab] = useState('overview');
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [systemStats, setSystemStats] = useState({});

  // Mock current coach ID (in real app, get from auth context)
  const currentCoachId = 'coach_shubham';

  useEffect(() => {
    setSystemStats(getSystemStats());
  }, [coachAssignments]);

  const handleAvailabilityToggle = async (coachId, newStatus) => {
    try {
      await updateCoachAvailability(coachId, { 
        status: newStatus ? 'available' : 'unavailable' 
      });
      
      if (!newStatus) {
        // Handle failover when coach becomes unavailable
        const failoverResults = await handleCoachFailover(coachId, 'marked unavailable');
        
        if (failoverResults.length > 0) {
          const successCount = failoverResults.filter(r => r.success).length;
          const failCount = failoverResults.filter(r => !r.success).length;
          
          Alert.alert(
            t('coachAssignment.failoverComplete'),
            `${successCount} ${t('coachAssignment.athletesReassigned')}${failCount > 0 ? `, ${failCount} ${t('coachAssignment.needManualAssignment')}` : ''}`
          );
        }
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('coachAssignment.availabilityUpdateError'));
    }
  };

  const renderCoachCard = ({ item: coach }) => {
    const workload = getCoachWorkload(coach.id);
    const availability = coachAvailability[coach.id];
    const athletes = getCoachAthletes(coach.id);

    return (
      <View style={styles.coachCard}>
        <View style={styles.coachHeader}>
          <View style={styles.coachInfo}>
            <Text style={styles.coachAvatar}>{coach.avatar}</Text>
            <View style={styles.coachDetails}>
              <Text style={styles.coachName}>{coach.name}</Text>
              <Text style={styles.coachSpecialization}>{coach.specialization}</Text>
              <Text style={styles.coachExperience}>{coach.experience}</Text>
            </View>
          </View>
          
          <View style={styles.availabilityToggle}>
            <Text style={styles.availabilityLabel}>
              {availability?.status === 'available' ? t('coachAssignment.available') : t('coachAssignment.unavailable')}
            </Text>
            <Switch
              value={availability?.status === 'available'}
              onValueChange={(value) => handleAvailabilityToggle(coach.id, value)}
              trackColor={{ false: '#ef4444', true: '#10b981' }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        <View style={styles.workloadSection}>
          <View style={styles.workloadBar}>
            <View style={styles.workloadLabel}>
              <Text style={styles.workloadText}>
                {t('coachAssignment.workload')}: {workload.currentLoad}/{workload.maxCapacity}
              </Text>
              <Text style={styles.utilizationRate}>{workload.utilizationRate}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${Math.min(workload.utilizationRate, 100)}%`,
                    backgroundColor: workload.utilizationRate > 80 ? '#ef4444' : 
                                   workload.utilizationRate > 60 ? '#f59e0b' : '#10b981'
                  }
                ]} 
              />
            </View>
          </View>
        </View>

        <View style={styles.athleteStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{athletes.primary.length}</Text>
            <Text style={styles.statLabel}>{t('coachAssignment.primaryAthletes')}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{athletes.secondary.length}</Text>
            <Text style={styles.statLabel}>{t('coachAssignment.backupFor')}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>⭐ {coach.rating}</Text>
            <Text style={styles.statLabel}>{t('coachAssignment.rating')}</Text>
          </View>
        </View>

        <View style={styles.coachActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.viewButton]}
            onPress={() => navigation.navigate('CoachAthleteList', { coachId: coach.id })}
          >
            <Ionicons name="people" size={16} color="#ffffff" />
            <Text style={styles.actionButtonText}>{t('coachAssignment.viewAthletes')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.assignButton]}
            onPress={() => {
              setSelectedCoach(coach);
              setShowAssignModal(true);
            }}
          >
            <Ionicons name="add-circle" size={16} color="#ffffff" />
            <Text style={styles.actionButtonText}>{t('coachAssignment.assignAthlete')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderOverview = () => (
    <View style={styles.overviewContainer}>
      {/* System Statistics */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: '#e0f2fe' }]}>
          <Ionicons name="people" size={24} color="#0369a1" />
          <Text style={styles.statCardValue}>{systemStats.totalAthletes}</Text>
          <Text style={styles.statCardLabel}>{t('coachAssignment.totalAthletes')}</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: '#dcfce7' }]}>
          <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
          <Text style={styles.statCardValue}>{systemStats.athletesWithPrimary}</Text>
          <Text style={styles.statCardLabel}>{t('coachAssignment.withPrimaryCoach')}</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: '#fef3c7' }]}>
          <Ionicons name="shield-checkmark" size={24} color="#d97706" />
          <Text style={styles.statCardValue}>{systemStats.athletesWithSecondary}</Text>
          <Text style={styles.statCardLabel}>{t('coachAssignment.withBackupCoach')}</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: '#fee2e2' }]}>
          <Ionicons name="alert-circle" size={24} color="#dc2626" />
          <Text style={styles.statCardValue}>{systemStats.athletesWithoutPrimary}</Text>
          <Text style={styles.statCardLabel}>{t('coachAssignment.needAssignment')}</Text>
        </View>
      </View>

      {/* Coverage Rate */}
      <View style={styles.coverageSection}>
        <Text style={styles.sectionTitle}>{t('coachAssignment.systemCoverage')}</Text>
        <View style={styles.coverageCard}>
          <View style={styles.coverageHeader}>
            <Text style={styles.coverageValue}>{systemStats.coverageRate}%</Text>
            <Text style={styles.coverageLabel}>{t('coachAssignment.athletesCovered')}</Text>
          </View>
          <View style={styles.coverageBar}>
            <View 
              style={[
                styles.coverageFill, 
                { 
                  width: `${systemStats.coverageRate}%`,
                  backgroundColor: systemStats.coverageRate > 90 ? '#10b981' : 
                                 systemStats.coverageRate > 70 ? '#f59e0b' : '#ef4444'
                }
              ]} 
            />
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>{t('coachAssignment.quickActions')}</Text>
        
        <TouchableOpacity 
          style={[styles.quickActionButton, { backgroundColor: '#3b82f6' }]}
          onPress={() => setSelectedTab('coaches')}
        >
          <Ionicons name="people-circle" size={20} color="#ffffff" />
          <Text style={styles.quickActionText}>{t('coachAssignment.manageCoaches')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.quickActionButton, { backgroundColor: '#f97316' }]}
          onPress={() => navigation.navigate('AthleteAssignments')}
        >
          <Ionicons name="person-add" size={20} color="#ffffff" />
          <Text style={styles.quickActionText}>{t('coachAssignment.assignAthletes')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.quickActionButton, { backgroundColor: '#10b981' }]}
          onPress={() => navigation.navigate('AvailabilitySchedule')}
        >
          <Ionicons name="calendar" size={20} color="#ffffff" />
          <Text style={styles.quickActionText}>{t('coachAssignment.manageSchedule')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCoachesList = () => (
    <View style={styles.coachesContainer}>
      <FlatList
        data={Object.values(coachProfiles)}
        renderItem={renderCoachCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.coachesList}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.screenTitle}>{t('coachAssignment.title')}</Text>
          <LanguageToggle showLabel={false} />
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'overview' && styles.activeTab]}
            onPress={() => setSelectedTab('overview')}
          >
            <Text style={[styles.tabText, selectedTab === 'overview' && styles.activeTabText]}>
              {t('coachAssignment.overview')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'coaches' && styles.activeTab]}
            onPress={() => setSelectedTab('coaches')}
          >
            <Text style={[styles.tabText, selectedTab === 'coaches' && styles.activeTabText]}>
              {t('coachAssignment.coaches')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'assignments' && styles.activeTab]}
            onPress={() => setSelectedTab('assignments')}
          >
            <Text style={[styles.tabText, selectedTab === 'assignments' && styles.activeTabText]}>
              {t('coachAssignment.assignments')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {selectedTab === 'overview' && renderOverview()}
          {selectedTab === 'coaches' && renderCoachesList()}
          {selectedTab === 'assignments' && (
            <View style={styles.comingSoon}>
              <Ionicons name="construct" size={64} color="#9ca3af" />
              <Text style={styles.comingSoonText}>{t('coachAssignment.assignmentsComingSoon')}</Text>
            </View>
          )}
        </ScrollView>
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#f97316',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#f97316',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  overviewContainer: {
    paddingVertical: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginTop: 8,
  },
  statCardLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
  },
  coverageSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  coverageCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  coverageHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  coverageValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
  },
  coverageLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  coverageBar: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  coverageFill: {
    height: '100%',
    borderRadius: 4,
  },
  quickActions: {
    marginBottom: 24,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  quickActionText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  coachesContainer: {
    flex: 1,
    paddingVertical: 20,
  },
  coachesList: {
    paddingBottom: 20,
  },
  coachCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  coachHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  coachInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  coachAvatar: {
    fontSize: 32,
    marginRight: 12,
  },
  coachDetails: {
    flex: 1,
  },
  coachName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  coachSpecialization: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  coachExperience: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  availabilityToggle: {
    alignItems: 'center',
  },
  availabilityLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    color: '#6b7280',
  },
  workloadSection: {
    marginBottom: 16,
  },
  workloadBar: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
  },
  workloadLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  workloadText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  utilizationRate: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f97316',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  athleteStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
    textAlign: 'center',
  },
  coachActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  viewButton: {
    backgroundColor: '#3b82f6',
  },
  assignButton: {
    backgroundColor: '#10b981',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  comingSoon: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  comingSoonText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
    textAlign: 'center',
  },
});
