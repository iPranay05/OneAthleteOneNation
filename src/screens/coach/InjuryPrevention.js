import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useInjury } from '../../context/InjuryContext';
import LanguageToggle from '../../components/LanguageToggle';

export default function InjuryPrevention({ navigation }) {
  const { t } = useTranslation();
  const {
    injuries,
    loading,
    analyzeInjuryRisk,
    generatePreventionPlan,
    getInjuryStats,
    reportInjury
  } = useInjury();

  const [selectedTab, setSelectedTab] = useState('overview');
  const [showReportModal, setShowReportModal] = useState(false);
  const [athletes] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      sport: 'Track & Field',
      disability: 'Visual Impairment',
      age: 22,
      performance: 92,
      workoutsCompleted: 15,
      lastActive: '2 hours ago',
      trainingIntensity: 'High',
      trainingLoad: 'Heavy'
    },
    {
      id: 2,
      name: 'Mike Chen',
      sport: 'Swimming',
      disability: 'Mobility',
      age: 25,
      performance: 88,
      workoutsCompleted: 12,
      lastActive: '4 hours ago',
      trainingIntensity: 'Moderate',
      trainingLoad: 'Normal'
    },
    {
      id: 3,
      name: 'Emma Davis',
      sport: 'Basketball',
      disability: 'Hearing Impairment',
      age: 20,
      performance: 85,
      workoutsCompleted: 8,
      lastActive: '2 days ago',
      trainingIntensity: 'Low',
      trainingLoad: 'Light'
    }
  ]);

  const [injuryStats, setInjuryStats] = useState({});

  useEffect(() => {
    setInjuryStats(getInjuryStats());
  }, [injuries]);

  const handleRiskAnalysis = async (athlete) => {
    try {
      Alert.alert(
        t('injury.analyzingRisk'),
        t('injury.analyzingRiskMessage'),
        [{ text: t('common.ok') }]
      );

      const riskAnalysis = await analyzeInjuryRisk(athlete);
      
      navigation.navigate('InjuryRiskDetail', { 
        athlete, 
        riskAnalysis 
      });
    } catch (error) {
      Alert.alert(
        t('common.error'),
        t('injury.analysisError')
      );
    }
  };

  const handleGeneratePreventionPlan = async (athlete, riskAnalysis) => {
    try {
      const preventionPlan = await generatePreventionPlan(athlete, riskAnalysis);
      
      navigation.navigate('PreventionPlan', { 
        athlete, 
        preventionPlan 
      });
    } catch (error) {
      Alert.alert(
        t('common.error'),
        t('injury.planGenerationError')
      );
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getRiskIcon = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high': return 'warning';
      case 'medium': return 'alert-circle';
      case 'low': return 'checkmark-circle';
      default: return 'help-circle';
    }
  };

  const renderAthleteCard = ({ item: athlete }) => (
    <View style={styles.athleteCard}>
      <View style={styles.athleteHeader}>
        <View style={styles.athleteInfo}>
          <Text style={styles.athleteName}>{athlete.name}</Text>
          <Text style={styles.athleteSport}>{athlete.sport}</Text>
          <Text style={styles.athleteDisability}>{athlete.disability}</Text>
        </View>
        <View style={styles.riskIndicator}>
          <Ionicons 
            name={getRiskIcon(athlete.riskLevel)} 
            size={24} 
            color={getRiskColor(athlete.riskLevel)} 
          />
          <Text style={[styles.riskText, { color: getRiskColor(athlete.riskLevel) }]}>
            {athlete.riskLevel || t('injury.notAssessed')}
          </Text>
        </View>
      </View>

      <View style={styles.athleteMetrics}>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{athlete.performance}%</Text>
          <Text style={styles.metricLabel}>{t('injury.performance')}</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{athlete.workoutsCompleted}</Text>
          <Text style={styles.metricLabel}>{t('injury.workouts')}</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{athlete.trainingIntensity}</Text>
          <Text style={styles.metricLabel}>{t('injury.intensity')}</Text>
        </View>
      </View>

      <View style={styles.athleteActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.analyzeButton]}
          onPress={() => handleRiskAnalysis(athlete)}
        >
          <Ionicons name="analytics" size={16} color="#ffffff" />
          <Text style={styles.actionButtonText}>{t('injury.analyzeRisk')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.planButton]}
          onPress={() => navigation.navigate('InjuryReport', { athlete })}
        >
          <Ionicons name="medical" size={16} color="#ffffff" />
          <Text style={styles.actionButtonText}>{t('injury.reportInjury')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderOverview = () => (
    <View style={styles.overviewContainer}>
      {/* Statistics Cards */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: '#fee2e2' }]}>
          <Ionicons name="warning" size={24} color="#dc2626" />
          <Text style={styles.statValue}>{injuryStats.activeInjuries || 0}</Text>
          <Text style={styles.statLabel}>{t('injury.activeInjuries')}</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: '#dcfce7' }]}>
          <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
          <Text style={styles.statValue}>{injuryStats.recoveredInjuries || 0}</Text>
          <Text style={styles.statLabel}>{t('injury.recovered')}</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: '#fef3c7' }]}>
          <Ionicons name="trending-up" size={24} color="#d97706" />
          <Text style={styles.statValue}>{injuryStats.recoveryRate || 0}%</Text>
          <Text style={styles.statLabel}>{t('injury.recoveryRate')}</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: '#e0e7ff' }]}>
          <Ionicons name="people" size={24} color="#4f46e5" />
          <Text style={styles.statValue}>{athletes.length}</Text>
          <Text style={styles.statLabel}>{t('injury.totalAthletes')}</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>{t('injury.quickActions')}</Text>
        
        <TouchableOpacity 
          style={[styles.quickActionButton, { backgroundColor: '#f97316' }]}
          onPress={() => setShowReportModal(true)}
        >
          <Ionicons name="add-circle" size={20} color="#ffffff" />
          <Text style={styles.quickActionText}>{t('injury.reportNewInjury')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.quickActionButton, { backgroundColor: '#3b82f6' }]}
          onPress={() => setSelectedTab('prevention')}
        >
          <Ionicons name="shield-checkmark" size={20} color="#ffffff" />
          <Text style={styles.quickActionText}>{t('injury.preventionPlans')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.quickActionButton, { backgroundColor: '#10b981' }]}
          onPress={() => navigation.navigate('InjuryAnalytics')}
        >
          <Ionicons name="bar-chart" size={20} color="#ffffff" />
          <Text style={styles.quickActionText}>{t('injury.viewAnalytics')}</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Injuries */}
      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>{t('injury.recentInjuries')}</Text>
        {injuries.slice(0, 3).map(injury => (
          <View key={injury.id} style={styles.recentInjuryCard}>
            <View style={styles.injuryInfo}>
              <Text style={styles.injuryAthlete}>{injury.athleteName}</Text>
              <Text style={styles.injuryType}>{injury.type} - {injury.location}</Text>
              <Text style={styles.injuryDate}>{new Date(injury.reportedAt).toLocaleDateString()}</Text>
            </View>
            <View style={[styles.injuryStatus, { 
              backgroundColor: injury.status === 'active' ? '#fee2e2' : '#dcfce7' 
            }]}>
              <Text style={[styles.injuryStatusText, {
                color: injury.status === 'active' ? '#dc2626' : '#16a34a'
              }]}>
                {injury.status}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderAthleteList = () => (
    <View style={styles.athleteListContainer}>
      <FlatList
        data={athletes}
        renderItem={renderAthleteCard}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.athleteList}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.screenTitle}>{t('injury.title')}</Text>
          <LanguageToggle showLabel={false} />
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'overview' && styles.activeTab]}
            onPress={() => setSelectedTab('overview')}
          >
            <Text style={[styles.tabText, selectedTab === 'overview' && styles.activeTabText]}>
              {t('injury.overview')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'athletes' && styles.activeTab]}
            onPress={() => setSelectedTab('athletes')}
          >
            <Text style={[styles.tabText, selectedTab === 'athletes' && styles.activeTabText]}>
              {t('injury.athletes')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'prevention' && styles.activeTab]}
            onPress={() => setSelectedTab('prevention')}
          >
            <Text style={[styles.tabText, selectedTab === 'prevention' && styles.activeTabText]}>
              {t('injury.prevention')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {selectedTab === 'overview' && renderOverview()}
          {selectedTab === 'athletes' && renderAthleteList()}
          {selectedTab === 'prevention' && (
            <View style={styles.comingSoon}>
              <Ionicons name="construct" size={64} color="#9ca3af" />
              <Text style={styles.comingSoonText}>{t('injury.preventionPlansComingSoon')}</Text>
            </View>
          )}
        </ScrollView>

        {/* Loading Overlay */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#f97316" />
            <Text style={styles.loadingText}>{t('injury.analyzing')}</Text>
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
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
  },
  quickActions: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
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
  recentSection: {
    marginBottom: 24,
  },
  recentInjuryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  injuryInfo: {
    flex: 1,
  },
  injuryAthlete: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  injuryType: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  injuryDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  injuryStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  injuryStatusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  athleteListContainer: {
    flex: 1,
    paddingVertical: 20,
  },
  athleteList: {
    paddingBottom: 20,
  },
  athleteCard: {
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
  athleteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  athleteInfo: {
    flex: 1,
  },
  athleteName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  athleteSport: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  athleteDisability: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  riskIndicator: {
    alignItems: 'center',
  },
  riskText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  athleteMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  metric: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  athleteActions: {
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
  analyzeButton: {
    backgroundColor: '#3b82f6',
  },
  planButton: {
    backgroundColor: '#ef4444',
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 12,
  },
});
