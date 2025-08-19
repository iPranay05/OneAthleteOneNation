import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width } = Dimensions.get('window');

export default function Analytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedMetric, setSelectedMetric] = useState('performance');

  const [analyticsData] = useState({
    week: {
      performance: { value: 85, change: '+5%', trend: 'up' },
      completion: { value: 92, change: '+8%', trend: 'up' },
      engagement: { value: 78, change: '-2%', trend: 'down' },
      progress: { value: 88, change: '+12%', trend: 'up' }
    },
    month: {
      performance: { value: 82, change: '+3%', trend: 'up' },
      completion: { value: 89, change: '+6%', trend: 'up' },
      engagement: { value: 81, change: '+4%', trend: 'up' },
      progress: { value: 85, change: '+9%', trend: 'up' }
    },
    year: {
      performance: { value: 79, change: '+15%', trend: 'up' },
      completion: { value: 86, change: '+18%', trend: 'up' },
      engagement: { value: 83, change: '+11%', trend: 'up' },
      progress: { value: 82, change: '+22%', trend: 'up' }
    }
  });

  const [topPerformers] = useState([
    { name: 'Sarah Johnson', sport: 'Track & Field', score: 95, improvement: '+8%' },
    { name: 'Alex Rodriguez', sport: 'Powerlifting', score: 92, improvement: '+12%' },
    { name: 'Mike Chen', sport: 'Swimming', score: 88, improvement: '+5%' },
    { name: 'Emma Davis', sport: 'Basketball', score: 85, improvement: '+3%' },
  ]);

  const [workoutStats] = useState({
    totalWorkouts: 156,
    completedWorkouts: 142,
    avgDuration: 48,
    popularExercises: ['Push-ups', 'Squats', 'Planks', 'Lunges']
  });

  const currentData = analyticsData[selectedPeriod];

  const MetricCard = ({ title, data, icon, color }) => (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <View style={[styles.metricIcon, { backgroundColor: `${color}20` }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <View style={styles.metricInfo}>
          <Text style={styles.metricTitle}>{title}</Text>
          <View style={styles.metricValueRow}>
            <Text style={styles.metricValue}>{data.value}%</Text>
            <View style={[styles.changeIndicator, { backgroundColor: data.trend === 'up' ? '#dcfce7' : '#fef2f2' }]}>
              <Ionicons 
                name={data.trend === 'up' ? 'trending-up' : 'trending-down'} 
                size={12} 
                color={data.trend === 'up' ? '#16a34a' : '#dc2626'} 
              />
              <Text style={[styles.changeText, { color: data.trend === 'up' ? '#16a34a' : '#dc2626' }]}>
                {data.change}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${data.value}%`, backgroundColor: color }]} />
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {['week', 'month', 'year'].map((period) => (
          <TouchableOpacity
            key={period}
            style={[styles.periodButton, selectedPeriod === period && styles.selectedPeriod]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text style={[styles.periodText, selectedPeriod === period && styles.selectedPeriodText]}>
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Key Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Metrics</Text>
        <View style={styles.metricsGrid}>
          <MetricCard
            title="Performance"
            data={currentData.performance}
            icon="trophy"
            color="#f59e0b"
          />
          <MetricCard
            title="Completion Rate"
            data={currentData.completion}
            icon="checkmark-circle"
            color="#10b981"
          />
          <MetricCard
            title="Engagement"
            data={currentData.engagement}
            icon="heart"
            color="#ef4444"
          />
          <MetricCard
            title="Progress"
            data={currentData.progress}
            icon="trending-up"
            color="#8b5cf6"
          />
        </View>
      </View>

      {/* Top Performers */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Performers</Text>
        <View style={styles.card}>
          {topPerformers.map((performer, index) => (
            <View key={index} style={styles.performerItem}>
              <View style={styles.performerRank}>
                <Text style={styles.rankNumber}>{index + 1}</Text>
              </View>
              <View style={styles.performerInfo}>
                <Text style={styles.performerName}>{performer.name}</Text>
                <Text style={styles.performerSport}>{performer.sport}</Text>
              </View>
              <View style={styles.performerStats}>
                <Text style={styles.performerScore}>{performer.score}</Text>
                <Text style={styles.performerImprovement}>{performer.improvement}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Workout Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Workout Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{workoutStats.totalWorkouts}</Text>
            <Text style={styles.statLabel}>Total Workouts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{workoutStats.completedWorkouts}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{workoutStats.avgDuration}min</Text>
            <Text style={styles.statLabel}>Avg Duration</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {Math.round((workoutStats.completedWorkouts / workoutStats.totalWorkouts) * 100)}%
            </Text>
            <Text style={styles.statLabel}>Success Rate</Text>
          </View>
        </View>
      </View>

      {/* Popular Exercises */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popular Exercises</Text>
        <View style={styles.card}>
          <View style={styles.exerciseGrid}>
            {workoutStats.popularExercises.map((exercise, index) => (
              <View key={index} style={styles.exerciseTag}>
                <Text style={styles.exerciseText}>{exercise}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Insights */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Insights & Recommendations</Text>
        <View style={styles.card}>
          <View style={styles.insightItem}>
            <Ionicons name="bulb" size={20} color="#f59e0b" />
            <Text style={styles.insightText}>
              Performance has increased by 5% this week. Consider maintaining current training intensity.
            </Text>
          </View>
          <View style={styles.insightItem}>
            <Ionicons name="trending-up" size={20} color="#10b981" />
            <Text style={styles.insightText}>
              Completion rates are excellent. Athletes are responding well to current workout structure.
            </Text>
          </View>
          <View style={styles.insightItem}>
            <Ionicons name="alert-circle" size={20} color="#ef4444" />
            <Text style={styles.insightText}>
              Engagement slightly down. Consider adding more variety to workout routines.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  selectedPeriod: {
    backgroundColor: '#f97316',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  selectedPeriodText: {
    color: '#ffffff',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  metricsGrid: {
    gap: 12,
  },
  metricCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  metricInfo: {
    flex: 1,
  },
  metricTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginRight: 8,
  },
  changeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 2,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#f3f4f6',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  performerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  performerRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f97316',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  performerInfo: {
    flex: 1,
  },
  performerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  performerSport: {
    fontSize: 12,
    color: '#6b7280',
  },
  performerStats: {
    alignItems: 'flex-end',
  },
  performerScore: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  performerImprovement: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    textAlign: 'center',
  },
  exerciseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  exerciseTag: {
    backgroundColor: '#fff7ed',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  exerciseText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f97316',
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  insightText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});
