import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useProgress } from '../../context/ProgressContext';
import { useWorkouts } from '../../context/WorkoutContext';
import BlindUserVoiceAssistant from '../../components/BlindUserVoiceAssistant';
import { useUser } from '../../context/UserContext';
import { usePosts } from '../../context/PostsContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import LanguageToggle from '../../components/LanguageToggle'; 

// Mock Pedometer for development
const Pedometer = {
  isAvailableAsync: () => Promise.resolve(true),
  requestPermissionsAsync: () => Promise.resolve({ status: 'granted' }),
  getStepCountAsync: (start, end) => Promise.resolve({ steps: Math.floor(Math.random() * 5000) + 2000 }),
  watchStepCount: (callback) => {
    const interval = setInterval(() => callback(), 5000);
    return { remove: () => clearInterval(interval) };
  }
};

export default function Progress({ navigation }) {
  const { t } = useTranslation();
  const { userProfile } = useUser();
  const [isAvailable, setIsAvailable] = useState(null); // null | boolean
  const [loadingWeekly, setLoadingWeekly] = useState(false);

  // Session tracking
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionStart, setSessionStart] = useState(null); // Date
  const [sessionSteps, setSessionSteps] = useState(0);
  const [sessionDuration, setSessionDuration] = useState(0); // seconds
  const watchRef = useRef(null);
  
  // Context hooks
  const { addPost } = usePosts();
  const { 
    weeklyData, 
    getTodaySteps, 
    getWeeklyStats, 
    getProgressToGoal, 
    getUnlockedAchievements,
    refreshWeeklyData,
    updateTodaySteps,
    addWorkoutCompletion 
  } = useProgress();
  const { getWorkoutStats } = useWorkouts();

  const todaySteps = getTodaySteps();
  const weeklyStats = getWeeklyStats();
  const workoutStats = getWorkoutStats();

  const STEP_LENGTH_M = 0.78; // avg stride length in meters (approx.)
  const KCAL_PER_STEP = 0.04; // rough kcal/step estimate
  const stepsToKm = (s) => (s * STEP_LENGTH_M) / 1000;
  const stepsToKcal = (s) => s * KCAL_PER_STEP;

  const getMidnight = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const loadWeekly = async () => {
    setLoadingWeekly(true);
    await refreshWeeklyData();
    setLoadingWeekly(false);
  };

  useEffect(() => {
    let mounted = true;
    Pedometer.isAvailableAsync()
      .then((avail) => mounted && setIsAvailable(Boolean(avail)))
      .catch(() => mounted && setIsAvailable(false));

    // Live updates: whenever steps occur, refresh today's steps
    watchRef.current = Pedometer.watchStepCount(() => {
      // Simulate step updates by adding random steps
      const newSteps = todaySteps + Math.floor(Math.random() * 50) + 10;
      updateTodaySteps(newSteps);
    });

    // initial loads
    loadWeekly();

    return () => {
      mounted = false;
      if (watchRef.current) watchRef.current.remove();
    };
  }, []);

  // Ask for permissions when possible
  useEffect(() => {
    (async () => {
      try {
        if (Pedometer.requestPermissionsAsync) {
          await Pedometer.requestPermissionsAsync();
        }
        if (Platform.OS === 'android' && Platform.Version >= 29) {
          await PermissionsAndroid.request('android.permission.ACTIVITY_RECOGNITION');
        }
      } catch (_) {}
    })();
  }, []);

  useEffect(() => {
    let interval;
    if (sessionActive && sessionStart) {
      interval = setInterval(async () => {
        try {
          const now = new Date();
          const res = await Pedometer.getStepCountAsync(sessionStart, now);
          setSessionSteps(res?.steps ?? 0);
          setSessionDuration(Math.floor((now.getTime() - sessionStart.getTime()) / 1000));
        } catch (e) {
          // ignore
        }
      }, 3000);
    }
    return () => interval && clearInterval(interval);
  }, [sessionActive, sessionStart]);

  const startSession = () => {
    setSessionSteps(0);
    setSessionDuration(0);
    setSessionStart(new Date());
    setSessionActive(true);
  };
  const stopSession = () => setSessionActive(false);
  const resetSession = () => {
    setSessionActive(false);
    setSessionSteps(0);
    setSessionDuration(0);
    setSessionStart(null);
  };

  const progress = getProgressToGoal(8000);
  const formatDuration = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('progress.goodMorning');
    if (hour < 17) return t('progress.goodAfternoon');
    return t('progress.goodEvening');
  };

  const getMotivationalMessage = () => {
    if (progress >= 100) return t('progress.motivational.goalCrushed');
    if (progress >= 75) return t('progress.motivational.almostThere');
    if (progress >= 50) return t('progress.motivational.halfway');
    if (progress >= 25) return t('progress.motivational.greatStart');
    return t('progress.motivational.everyStep');
  };

  const todayKm = stepsToKm(todaySteps);
  const todayKcal = stepsToKcal(todaySteps);
  const sessionKm = stepsToKm(sessionSteps);
  const sessionSpeed = sessionDuration > 0 ? (sessionKm / (sessionDuration / 3600)) : 0; // km/h
  const achievements = getUnlockedAchievements();

  const shareTodayToUpdates = () => {
    try {
      const summary = `Today's steps: ${todaySteps.toLocaleString()} (${todayKm.toFixed(2)} km, ${Math.round(todayKcal)} kcal). #progress`;
      addPost({
        name: 'Alex Runner',
        sport: 'Track & Field',
        avatar: require('../../../assets/icon.png'),
        text: summary,
        mediaUrl: '',
        mediaType: 'none',
      });
    } catch (_) {}
  };

  const handleCompleteSession = () => {
    if (sessionActive && sessionSteps > 0) {
      // Add session data to progress tracking
      addWorkoutCompletion({
        steps: sessionSteps,
        duration: sessionDuration,
        calories: stepsToKcal(sessionSteps)
      });
      
      stopSession();
      resetSession();
    }
  };

  return (


    <SafeAreaView style={styles.safeArea}> 
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
      {/* Header with Language Toggle */}
      <View style={styles.titleHeader}>
        <Text style={styles.screenTitle}>{t('progress.title')}</Text>
        <LanguageToggle showLabel={false} />
      </View>

      {/* Header with Greeting */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.subtitle}>{getMotivationalMessage()}</Text>
        </View>
        <TouchableOpacity style={styles.streakBadge}>
          <Ionicons name="flame" size={16} color="#f97316" />
          <Text style={styles.streakText}>7 {t('progress.dayStreak')}</Text>
        </TouchableOpacity>
      </View>

      {/* Today's Overview Cards */}
      <View style={styles.overviewGrid}>
        <View style={[styles.overviewCard, styles.primaryCard]}>
          <View style={[styles.cardIcon, { backgroundColor: '#fed7aa' }]}>
            <Ionicons name="footsteps" size={20} color="#f97316" />
          </View>
          <Text style={styles.primaryCardValue}>{todaySteps.toLocaleString()}</Text>
          <Text style={styles.primaryCardLabel}>{t('progress.stepsToday')}</Text>
          <View style={styles.progressRing}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.primaryCardLabel}>{progress}% {t('progress.ofGoal')}</Text>
        </View>

        <View style={styles.overviewCard}>
          <View style={[styles.cardIcon, { backgroundColor: '#10b981' }]}>
            <Ionicons name="location" size={20} color="#ffffff" />
          </View>
          <Text style={styles.cardValue}>{todayKm.toFixed(1)}</Text>
          <Text style={styles.cardLabel}>{t('progress.kmDistance')}</Text>
        </View>

        <View style={styles.overviewCard}>
          <View style={[styles.cardIcon, { backgroundColor: '#ef4444' }]}>
            <Ionicons name="flame" size={20} color="#ffffff" />
          </View>
          <Text style={styles.cardValue}>{Math.round(todayKcal)}</Text>
          <Text style={styles.cardLabel}>{t('progress.calories')}</Text>
        </View>

        <View style={styles.overviewCard}>
          <View style={[styles.cardIcon, { backgroundColor: '#8b5cf6' }]}>
            <Ionicons name="time" size={20} color="#ffffff" />
          </View>
          <Text style={styles.cardValue}>{weeklyStats.daysActive}</Text>
          <Text style={styles.cardLabel}>{t('progress.activeDays')}</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={shareTodayToUpdates}>
          <Ionicons name="share-social" size={20} color="#f97316" />
          <Text style={styles.actionText}>{t('progress.shareProgress')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => {
          const unlockedCount = achievements.length;
          alert(`${t('progress.alerts.achievementsTitle')}\n\n${t('progress.alerts.achievementsMessage', { count: unlockedCount })}\n\n${achievements.map(a => `• ${a.name}`).join('\n')}`);
        }}>
          <Ionicons name="trophy" size={20} color="#f97316" />
          <Text style={styles.actionText}>{t('progress.achievements')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => {
          alert(`${t('progress.alerts.setGoalTitle')}\n\n${t('progress.alerts.setGoalMessage')}`);
        }}>
          <Ionicons name="flag" size={20} color="#f97316" />
          <Text style={styles.actionText}>{t('progress.setGoal')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('progress.workoutSession')}</Text>
        <View style={styles.sessionRow}>
          <View style={styles.sessionCol}>
            <Text style={styles.metricLabel}>{t('progress.steps')}</Text>
            <Text style={styles.metricValue}>{sessionSteps}</Text>
          </View>
          <View style={styles.sessionCol}>
            <Text style={styles.metricLabel}>{t('progress.distance')}</Text>
            <Text style={styles.metricValue}>{sessionKm.toFixed(2)} km</Text>
          </View>
          <View style={styles.sessionCol}>
            <Text style={styles.metricLabel}>{t('progress.speed')}</Text>
            <Text style={styles.metricValue}>{sessionSpeed.toFixed(1)} km/h</Text>
          </View>
        </View>
        <Text style={[styles.metricLabel, { marginTop: 6 }]}>{t('progress.duration')}</Text>
        <Text style={[styles.metricValue, { fontWeight: '800' }]}>{formatDuration(sessionDuration)}</Text>
        <View style={styles.btnRow}>
          {!sessionActive ? (
            <TouchableOpacity style={[styles.button, styles.primaryBtn]} onPress={startSession}>
              <Text style={styles.buttonText}>{t('progress.start')}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.button, styles.stopBtn]} onPress={handleCompleteSession}>
              <Text style={styles.buttonText}>{t('progress.complete')}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.button, styles.ghostBtn, { marginLeft: 10 }]} onPress={resetSession}>
            <Text style={[styles.buttonText, { color: '#f97316' }]}>{t('progress.reset')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Achievements Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('progress.recentAchievements')}</Text>
        <View style={styles.achievementGrid}>
          {achievements.slice(0, 4).map((achievement) => (
            <View key={achievement.id} style={styles.achievementBadge}>
              <Ionicons name={achievement.icon} size={24} color="#fbbf24" />
              <Text style={styles.achievementText}>{achievement.name}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>{t('progress.weeklyProgress')}</Text>
          <TouchableOpacity onPress={loadWeekly} style={styles.refreshBtn}>
            <Ionicons name="refresh" size={16} color="#f97316" />
            <Text style={styles.refreshText}>{loadingWeekly ? t('progress.loading') : t('progress.refresh')}</Text>
          </TouchableOpacity>
        </View>
        
        {/* Weekly Summary Stats */}
        <View style={styles.weeklyStats}>
          <View style={styles.weeklyStatItem}>
            <Text style={styles.weeklyStatValue}>
              {weeklyStats.totalSteps.toLocaleString()}
            </Text>
            <Text style={styles.weeklyStatLabel}>{t('progress.totalSteps')}</Text>
          </View>
          <View style={styles.weeklyStatItem}>
            <Text style={styles.weeklyStatValue}>
              {weeklyStats.averageSteps.toLocaleString()}
            </Text>
            <Text style={styles.weeklyStatLabel}>{t('progress.dailyAverage')}</Text>
          </View>
          <View style={styles.weeklyStatItem}>
            <Text style={styles.weeklyStatValue}>
              {weeklyStats.totalDistance}km
            </Text>
            <Text style={styles.weeklyStatLabel}>{t('progress.distance')}</Text>
          </View>
        </View>

        {/* Daily Breakdown */}
        {weeklyData.map((d) => {
          const label = d.date.toLocaleDateString(undefined, { weekday: 'short' });
          const max = Math.max(1, ...weeklyData.map((x) => x.steps));
          const pct = Math.round((d.steps / max) * 100);
          const isToday = d.date.toDateString() === new Date().toDateString();
          return (
            <View key={d.date.toISOString()} style={styles.weeklyItem}>
              <View style={styles.rowBetween}>
                <View style={styles.dayInfo}>
                  <Text style={[styles.dayLabel, isToday && styles.todayLabel]}>{label}</Text>
                  {isToday && <View style={styles.todayDot} />}
                </View>
                <Text style={styles.stepCount}>{d.steps.toLocaleString()} steps</Text>
              </View>
              <View style={styles.barBg}>
                <View style={[styles.barFg, { width: `${pct}%` }]} />
              </View>
            </View>
          );
        })}
        {weeklyData.length === 0 && (
          <Text style={styles.noDataText}>{t('progress.noDataText')}</Text>
        )}
      </View>

      <View style={styles.metricBox}>
        <Text style={styles.metricLabel}>{t('progress.weeklyMileage')}</Text>
        <Text style={styles.metricValue}>{weeklyStats.totalDistance} km</Text>
      </View>

      <View style={styles.metricBox}>
        <Text style={styles.metricLabel}>{t('progress.workoutsCompleted')}</Text>
        <Text style={styles.metricValue}>{workoutStats.completed}</Text>
      </View>
      </ScrollView>
      <BlindUserVoiceAssistant 
        navigation={navigation} 
        screenName="Progress" 
        userProfile={userProfile}
        screenData={{
          todaySteps: todaySteps,
          weeklyStats: weeklyStats,
          sessionActive: sessionActive
        }}
      />
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc', // ✅ match your container background
  },
  container: { 
    flex: 1, 
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  
  // Header Styles
  titleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    marginBottom: 16,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  streakText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '700',
    color: '#f97316',
  },

  // Overview Grid
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  overviewCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryCard: {
    width: '100%',
    backgroundColor: '#f97316',
    marginBottom: 16,
  },
  primaryCardValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  primaryCardLabel: {
    fontSize: 14,
    color: '#fed7aa',
    fontWeight: '600',
    marginBottom: 8,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f97316',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  cardLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 8,
  },
  progressRing: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 3,
  },
  goalText: {
    fontSize: 11,
    color: '#fed7aa',
    fontWeight: '600',
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
    marginTop: 4,
    textAlign: 'center',
  },

  // Cards and Sections
  card: { 
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  
  // Session Tracking
  sessionRow: { 
    flexDirection: 'row', 
    marginBottom: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
  },
  sessionCol: { 
    flex: 1,
    alignItems: 'center',
  },
  
  // Metrics
  metricBox: { 
    backgroundColor: '#ffffff', 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  metricLabel: { 
    color: '#6b7280', 
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  metricValue: { 
    color: '#111827', 
    fontWeight: '700', 
    fontSize: 18,
  },
  
  // Progress Bars
  barBg: { 
    height: 8, 
    backgroundColor: '#e5e7eb', 
    borderRadius: 4, 
    overflow: 'hidden', 
    marginTop: 8,
  },
  barFg: { 
    height: '100%', 
    backgroundColor: '#f97316',
    borderRadius: 4,
  },
  
  // Buttons
  btnRow: { 
    flexDirection: 'row', 
    marginTop: 16,
    justifyContent: 'center',
  },
  button: { 
    paddingVertical: 12, 
    paddingHorizontal: 24, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center',
    minWidth: 80,
  },
  primaryBtn: { 
    backgroundColor: '#f97316',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  stopBtn: { 
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  ghostBtn: { 
    backgroundColor: '#fff7ed', 
    borderWidth: 1, 
    borderColor: '#f97316',
  },
  buttonText: { 
    color: '#ffffff', 
    fontWeight: '700',
    fontSize: 14,
  },
  
  // Achievements
  achievementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementBadge: {
    width: '48%',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  lockedBadge: {
    backgroundColor: '#f1f5f9',
    borderColor: '#cbd5e1',
  },
  achievementText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginTop: 8,
    textAlign: 'center',
  },

  // Weekly Progress
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  refreshText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f97316',
    marginLeft: 4,
  },
  weeklyStats: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  weeklyStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  weeklyStatValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  weeklyStatLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
  },
  weeklyItem: {
    marginBottom: 12,
  },
  dayInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayLabel: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
    width: 40,
  },
  todayLabel: {
    color: '#f97316',
    fontWeight: '700',
  },
  todayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f97316',
    marginLeft: 6,
  },
  stepCount: {
    color: '#6b7280',
    fontSize: 13,
    fontWeight: '500',
  },
  noDataText: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },

  // Layout Helpers
  rowBetween: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    marginBottom: 8,
  },
});

