import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function AthleteManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAthleteEmail, setNewAthleteEmail] = useState('');

  const [athletes, setAthletes] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      sport: 'Track & Field',
      disability: 'Visual Impairment',
      status: 'active',
      lastActive: '2 hours ago',
      performance: 92,
      workoutsCompleted: 15,
      nextSession: 'Today 2:00 PM',
      avatar: '👩‍🦯'
    },
    {
      id: 2,
      name: 'Mike Chen',
      sport: 'Swimming',
      disability: 'Mobility',
      status: 'active',
      lastActive: '4 hours ago',
      performance: 88,
      workoutsCompleted: 12,
      nextSession: 'Today 4:00 PM',
      avatar: '🏊‍♂️'
    },
    {
      id: 3,
      name: 'Emma Davis',
      sport: 'Basketball',
      disability: 'Hearing Impairment',
      status: 'inactive',
      lastActive: '2 days ago',
      performance: 85,
      workoutsCompleted: 8,
      nextSession: 'Tomorrow 10:00 AM',
      avatar: '🏀'
    },
    {
      id: 4,
      name: 'Alex Rodriguez',
      sport: 'Powerlifting',
      disability: 'Cognitive',
      status: 'active',
      lastActive: '1 hour ago',
      performance: 90,
      workoutsCompleted: 18,
      nextSession: 'Today 6:00 PM',
      avatar: '🏋️‍♂️'
    },
  ]);

  const filteredAthletes = athletes.filter(athlete => {
    const matchesSearch = athlete.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         athlete.sport.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || athlete.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    return status === 'active' ? '#10b981' : '#9ca3af';
  };

  const getPerformanceColor = (performance) => {
    if (performance >= 90) return '#10b981';
    if (performance >= 80) return '#f59e0b';
    return '#ef4444';
  };

  const handleAddAthlete = () => {
    if (!newAthleteEmail.trim()) {
      Alert.alert('Error', 'Please enter athlete email');
      return;
    }
    
    Alert.alert(
      'Invitation Sent',
      `Invitation sent to ${newAthleteEmail}. They will receive an email to join your coaching program.`,
      [{ text: 'OK', onPress: () => {
        setNewAthleteEmail('');
        setShowAddModal(false);
      }}]
    );
  };

  const handleAthleteAction = (athlete, action) => {
    switch (action) {
      case 'message':
        Alert.alert('Send Message', `Send message to ${athlete.name}`);
        break;
      case 'workout':
        Alert.alert('Assign Workout', `Create workout for ${athlete.name}`);
        break;
      case 'progress':
        Alert.alert('View Progress', `View ${athlete.name}'s progress and analytics`);
        break;
      case 'schedule':
        Alert.alert('Schedule Session', `Schedule session with ${athlete.name}`);
        break;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with Search and Add */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search athletes..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
          <Ionicons name="add" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['all', 'active', 'inactive'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterTab, selectedFilter === filter && styles.filterTabActive]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text style={[styles.filterText, selectedFilter === filter && styles.filterTextActive]}>
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Athletes List */}
      <ScrollView style={styles.athletesList} contentContainerStyle={{ paddingBottom: 20 }}>
        {filteredAthletes.map((athlete) => (
          <View key={athlete.id} style={styles.athleteCard}>
            <View style={styles.athleteHeader}>
              <View style={styles.athleteInfo}>
                <Text style={styles.athleteAvatar}>{athlete.avatar}</Text>
                <View style={styles.athleteDetails}>
                  <View style={styles.athleteNameRow}>
                    <Text style={styles.athleteName}>{athlete.name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(athlete.status) }]}>
                      <Text style={styles.statusText}>{athlete.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.athleteSport}>{athlete.sport}</Text>
                  <Text style={styles.athleteDisability}>🔹 {athlete.disability}</Text>
                </View>
              </View>
            </View>

            {/* Performance Metrics */}
            <View style={styles.metricsRow}>
              <View style={styles.metric}>
                <Text style={[styles.metricValue, { color: getPerformanceColor(athlete.performance) }]}>
                  {athlete.performance}%
                </Text>
                <Text style={styles.metricLabel}>Performance</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricValue}>{athlete.workoutsCompleted}</Text>
                <Text style={styles.metricLabel}>Workouts</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricValue}>{athlete.lastActive}</Text>
                <Text style={styles.metricLabel}>Last Active</Text>
              </View>
            </View>

            {/* Next Session */}
            <View style={styles.nextSession}>
              <Ionicons name="calendar" size={16} color="#f97316" />
              <Text style={styles.nextSessionText}>Next: {athlete.nextSession}</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={styles.actionBtn}
                onPress={() => handleAthleteAction(athlete, 'message')}
              >
                <Ionicons name="chatbubble" size={18} color="#f97316" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionBtn}
                onPress={() => handleAthleteAction(athlete, 'workout')}
              >
                <Ionicons name="fitness" size={18} color="#f97316" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionBtn}
                onPress={() => handleAthleteAction(athlete, 'progress')}
              >
                <Ionicons name="analytics" size={18} color="#f97316" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionBtn}
                onPress={() => handleAthleteAction(athlete, 'schedule')}
              >
                <Ionicons name="calendar" size={18} color="#f97316" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {filteredAthletes.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No athletes found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Try adjusting your search' : 'Add your first athlete to get started'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add Athlete Modal */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Invite Athlete</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#9ca3af" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalDescription}>
              Send an invitation to an athlete to join your coaching program
            </Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Athlete's email address"
              placeholderTextColor="#9ca3af"
              value={newAthleteEmail}
              onChangeText={setNewAthleteEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TouchableOpacity style={styles.modalBtn} onPress={handleAddAthlete}>
              <Text style={styles.modalBtnText}>Send Invitation</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    color: '#111827',
    fontSize: 16,
  },
  addBtn: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    padding: 12,
  },
  filterContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  filterTabActive: {
    backgroundColor: '#f97316',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  athletesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  athleteCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  athleteHeader: {
    marginBottom: 12,
  },
  athleteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  athleteAvatar: {
    fontSize: 32,
    marginRight: 12,
  },
  athleteDetails: {
    flex: 1,
  },
  athleteNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  athleteName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  athleteSport: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  athleteDisability: {
    fontSize: 12,
    color: '#f97316',
    fontWeight: '500',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  metric: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
  },
  nextSession: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff7ed',
    borderRadius: 8,
  },
  nextSessionText: {
    fontSize: 13,
    color: '#f97316',
    fontWeight: '600',
    marginLeft: 6,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  actionBtn: {
    backgroundColor: '#fff7ed',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  modalDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  modalInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  modalBtn: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
