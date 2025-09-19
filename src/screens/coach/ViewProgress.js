import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width } = Dimensions.get('window');

export default function ViewProgress({ route, navigation }) {
  const { athlete } = route.params;
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const progressData = {
    week: {
      workoutsCompleted: 5,
      totalWorkouts: 6,
      avgPerformance: 92,
      improvementRate: '+8%',
      streakDays: 12
    },
    month: {
      workoutsCompleted: 18,
      totalWorkouts: 24,
      avgPerformance: 88,
      improvementRate: '+15%',
      streakDays: 12
    },
    year: {
      workoutsCompleted: 156,
      totalWorkouts: 200,
      avgPerformance: 85,
      improvementRate: '+25%',
      streakDays: 12
    }
  };

  const recentWorkouts = [
    {
      id: 1,
      name: 'Strength Training',
      date: '2024-01-15',
      performance: 95,
      duration: '45 min',
      status: 'completed'
    },
    {
      id: 2,
      name: 'Cardio Endurance',
      date: '2024-01-14',
      performance: 88,
      duration: '30 min',
      status: 'completed'
    },
    {
      id: 3,
      name: 'Flexibility Training',
      date: '2024-01-13',
      performance: 92,
      duration: '25 min',
      status: 'completed'
    }
  ];

  const currentData = progressData[selectedPeriod];
  const completionRate = Math.round((currentData.workoutsCompleted / currentData.totalWorkouts) * 100);

  const getPerformanceColor = (performance) => {
    if (performance >= 90) return '#10b981';
    if (performance >= 80) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.athleteInfo}>
          <Text style={styles.title}>Progress Analytics</Text>
          <Text style={styles.subtitle}>{athlete.name}</Text>
        </View>
        <Text style={styles.athleteAvatar}>{athlete.avatar}</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {['week', 'month', 'year'].map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodTab,
                selectedPeriod === period && styles.activePeriodTab
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text style={[
                styles.periodText,
                selectedPeriod === period && styles.activePeriodText
              ]}>
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Ionicons name="checkmark-circle" size={24} color="#10b981" />
              <Text style={styles.metricValue}>{completionRate}%</Text>
            </View>
            <Text style={styles.metricLabel}>Completion Rate</Text>
            <Text style={styles.metricSubtext}>
              {currentData.workoutsCompleted}/{currentData.totalWorkouts} workouts
            </Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Ionicons name="trending-up" size={24} color="#f97316" />
              <Text style={[styles.metricValue, { color: getPerformanceColor(currentData.avgPerformance) }]}>
                {currentData.avgPerformance}%
              </Text>
            </View>
            <Text style={styles.metricLabel}>Avg Performance</Text>
            <Text style={[styles.metricSubtext, { color: '#10b981' }]}>
              {currentData.improvementRate} improvement
            </Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Ionicons name="flame" size={24} color="#ef4444" />
              <Text style={styles.metricValue}>{currentData.streakDays}</Text>
            </View>
            <Text style={styles.metricLabel}>Day Streak</Text>
            <Text style={styles.metricSubtext}>Current streak</Text>
          </View>
        </View>

        {/* Progress Chart Placeholder */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Performance Trend</Text>
          <View style={styles.chartPlaceholder}>
            <Ionicons name="analytics" size={48} color="#9ca3af" />
            <Text style={styles.chartText}>Performance chart visualization</Text>
            <Text style={styles.chartSubtext}>Shows improvement over time</Text>
          </View>
        </View>

        {/* Recent Workouts */}
        <Text style={styles.sectionTitle}>Recent Workouts</Text>
        {recentWorkouts.map((workout) => (
          <View key={workout.id} style={styles.workoutCard}>
            <View style={styles.workoutHeader}>
              <View style={styles.workoutInfo}>
                <Text style={styles.workoutName}>{workout.name}</Text>
                <Text style={styles.workoutDate}>{workout.date}</Text>
              </View>
              <View style={styles.workoutStats}>
                <View style={[styles.performanceBadge, { backgroundColor: getPerformanceColor(workout.performance) }]}>
                  <Text style={styles.performanceText}>{workout.performance}%</Text>
                </View>
              </View>
            </View>
            <View style={styles.workoutFooter}>
              <View style={styles.workoutDetail}>
                <Ionicons name="time" size={16} color="#6b7280" />
                <Text style={styles.workoutDetailText}>{workout.duration}</Text>
              </View>
              <View style={styles.workoutDetail}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.workoutDetailText}>Completed</Text>
              </View>
            </View>
          </View>
        ))}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="document-text" size={20} color="#f97316" />
            <Text style={styles.actionButtonText}>Generate Report</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share" size={20} color="#f97316" />
            <Text style={styles.actionButtonText}>Share Progress</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  athleteInfo: {
    flex: 1,
    marginLeft: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  athleteAvatar: {
    fontSize: 32,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  periodTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activePeriodTab: {
    backgroundColor: '#f97316',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activePeriodText: {
    color: '#ffffff',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    width: (width - 48) / 3,
    alignItems: 'center',
  },
  metricHeader: {
    alignItems: 'center',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 4,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  metricSubtext: {
    fontSize: 10,
    color: '#9ca3af',
    textAlign: 'center',
  },
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  chartPlaceholder: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  chartText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 8,
  },
  chartSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  workoutCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  workoutDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  workoutStats: {
    alignItems: 'flex-end',
  },
  performanceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  performanceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  workoutFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  workoutDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutDetailText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f97316',
    width: (width - 48) / 2,
  },
  actionButtonText: {
    color: '#f97316',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});
