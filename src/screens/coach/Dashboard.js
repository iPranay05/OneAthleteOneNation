import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function CoachDashboard({ navigation }) {
  const [stats, setStats] = useState({
    totalAthletes: 12,
    activeAthletes: 8,
    workoutsThisWeek: 24,
    avgPerformance: 85
  });

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, athlete: 'Sarah Johnson', action: 'Completed workout', time: '2 hours ago', type: 'workout' },
    { id: 2, athlete: 'Mike Chen', action: 'Requested form check', time: '4 hours ago', type: 'request' },
    { id: 3, athlete: 'Emma Davis', action: 'Achieved new PR', time: '6 hours ago', type: 'achievement' },
    { id: 4, athlete: 'Alex Rodriguez', action: 'Missed scheduled workout', time: '1 day ago', type: 'missed' },
  ]);

  const [upcomingSessions, setUpcomingSessions] = useState([
    { id: 1, athlete: 'Sarah Johnson', time: '2:00 PM', type: 'Strength Training' },
    { id: 2, athlete: 'Mike Chen', time: '4:00 PM', type: 'Technique Review' },
    { id: 3, athlete: 'Emma Davis', time: '6:00 PM', type: 'Recovery Session' },
  ]);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'workout': return 'checkmark-circle';
      case 'request': return 'help-circle';
      case 'achievement': return 'trophy';
      case 'missed': return 'alert-circle';
      default: return 'information-circle';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'workout': return '#10b981';
      case 'request': return '#f59e0b';
      case 'achievement': return '#8b5cf6';
      case 'missed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
      {/* Welcome Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good Morning, Coach! 👋</Text>
          <Text style={styles.subtitle}>Here's what's happening with your athletes</Text>
        </View>
        <TouchableOpacity style={styles.notificationBtn}>
          <Ionicons name="notifications" size={24} color="#f97316" />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Stats Overview */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#dbeafe' }]}>
            <Ionicons name="people" size={24} color="#3b82f6" />
          </View>
          <Text style={styles.statValue}>{stats.totalAthletes}</Text>
          <Text style={styles.statLabel}>Total Athletes</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#dcfce7' }]}>
            <Ionicons name="pulse" size={24} color="#16a34a" />
          </View>
          <Text style={styles.statValue}>{stats.activeAthletes}</Text>
          <Text style={styles.statLabel}>Active Today</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#fef3c7' }]}>
            <Ionicons name="fitness" size={24} color="#d97706" />
          </View>
          <Text style={styles.statValue}>{stats.workoutsThisWeek}</Text>
          <Text style={styles.statLabel}>Workouts This Week</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#f3e8ff' }]}>
            <Ionicons name="trending-up" size={24} color="#8b5cf6" />
          </View>
          <Text style={styles.statValue}>{stats.avgPerformance}%</Text>
          <Text style={styles.statLabel}>Avg Performance</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={() => Alert.alert('Create Workout', 'Navigate to workout planner')}>
            <Ionicons name="add-circle" size={32} color="#f97316" />
            <Text style={styles.actionText}>Create Workout</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionCard} onPress={() => Alert.alert('Send Message', 'Open messaging feature')}>
            <Ionicons name="chatbubble" size={32} color="#f97316" />
            <Text style={styles.actionText}>Send Message</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionCard} onPress={() => Alert.alert('Schedule Session', 'Open calendar')}>
            <Ionicons name="calendar" size={32} color="#f97316" />
            <Text style={styles.actionText}>Schedule Session</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionCard} onPress={() => Alert.alert('View Analytics', 'Navigate to analytics')}>
            <Ionicons name="bar-chart" size={32} color="#f97316" />
            <Text style={styles.actionText}>View Analytics</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('InjuryPrevention')}>
            <Ionicons name="medical" size={32} color="#f97316" />
            <Text style={styles.actionText}>Injury Prevention</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('CoachAssignments')}>
            <Ionicons name="people-circle" size={32} color="#f97316" />
            <Text style={styles.actionText}>Coach Management</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.card}>
          {recentActivity.map((activity) => (
            <View key={activity.id} style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: `${getActivityColor(activity.type)}20` }]}>
                <Ionicons name={getActivityIcon(activity.type)} size={20} color={getActivityColor(activity.type)} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityAthlete}>{activity.athlete}</Text>
                <Text style={styles.activityAction}>{activity.action}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Upcoming Sessions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Sessions</Text>
        <View style={styles.card}>
          {upcomingSessions.map((session) => (
            <View key={session.id} style={styles.sessionItem}>
              <View style={styles.sessionTime}>
                <Text style={styles.sessionTimeText}>{session.time}</Text>
              </View>
              <View style={styles.sessionContent}>
                <Text style={styles.sessionAthlete}>{session.athlete}</Text>
                <Text style={styles.sessionType}>{session.type}</Text>
              </View>
              <TouchableOpacity style={styles.sessionAction}>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          ))}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  notificationBtn: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: '1%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
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
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
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
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginTop: 8,
    textAlign: 'center',
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
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityAthlete: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  activityAction: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 11,
    color: '#9ca3af',
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sessionTime: {
    backgroundColor: '#f97316',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 12,
  },
  sessionTimeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  sessionContent: {
    flex: 1,
  },
  sessionAthlete: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  sessionType: {
    fontSize: 12,
    color: '#6b7280',
  },
  sessionAction: {
    padding: 4,
  },
});
