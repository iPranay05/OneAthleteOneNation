import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { generateWorkout } from '../../services/ai';

export default function WorkoutPlanner() {
  const [activeTab, setActiveTab] = useState('create');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Workout creation form
  const [selectedAthlete, setSelectedAthlete] = useState('');
  const [workoutTitle, setWorkoutTitle] = useState('');
  const [sport, setSport] = useState('');
  const [level, setLevel] = useState('intermediate');
  const [duration, setDuration] = useState('45');
  const [goals, setGoals] = useState('');
  const [equipment, setEquipment] = useState('');
  const [disability, setDisability] = useState('');
  const [focusArea, setFocusArea] = useState('');

  const [athletes] = useState([
    { id: 1, name: 'Sarah Johnson', sport: 'Track & Field', disability: 'Visual Impairment' },
    { id: 2, name: 'Mike Chen', sport: 'Swimming', disability: 'Mobility' },
    { id: 3, name: 'Emma Davis', sport: 'Basketball', disability: 'Hearing Impairment' },
    { id: 4, name: 'Alex Rodriguez', sport: 'Powerlifting', disability: 'Cognitive' },
  ]);

  const [workoutTemplates] = useState([
    {
      id: 1,
      title: 'Strength Foundation',
      sport: 'General',
      duration: '60 min',
      difficulty: 'Beginner',
      exercises: 8,
      description: 'Basic strength building for all athletes'
    },
    {
      id: 2,
      title: 'Cardio Endurance',
      sport: 'Running',
      duration: '45 min',
      difficulty: 'Intermediate',
      exercises: 6,
      description: 'Cardiovascular endurance training'
    },
    {
      id: 3,
      title: 'Adaptive Swimming',
      sport: 'Swimming',
      duration: '50 min',
      difficulty: 'Advanced',
      exercises: 10,
      description: 'Swimming techniques for disabled athletes'
    },
  ]);

  const [recentWorkouts] = useState([
    {
      id: 1,
      title: 'Upper Body Strength',
      athlete: 'Sarah Johnson',
      date: '2024-01-15',
      status: 'completed',
      feedback: 'Great form on bench press'
    },
    {
      id: 2,
      title: 'Sprint Training',
      athlete: 'Mike Chen',
      date: '2024-01-14',
      status: 'in-progress',
      feedback: null
    },
    {
      id: 3,
      title: 'Recovery Session',
      athlete: 'Emma Davis',
      date: '2024-01-13',
      status: 'completed',
      feedback: 'Excellent recovery work'
    },
  ]);

  const handleCreateWorkout = async () => {
    if (!selectedAthlete || !workoutTitle || !sport) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const athlete = athletes.find(a => a.id.toString() === selectedAthlete);
      const workoutData = await generateWorkout({
        sport,
        level,
        duration: parseInt(duration),
        goals,
        equipment,
        disability: athlete?.disability || disability,
        focusArea
      });

      Alert.alert(
        'Workout Created!',
        `Workout "${workoutTitle}" has been created and assigned to ${athlete?.name}`,
        [
          {
            text: 'OK',
            onPress: () => {
              setShowCreateModal(false);
              resetForm();
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create workout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedAthlete('');
    setWorkoutTitle('');
    setSport('');
    setLevel('intermediate');
    setDuration('45');
    setGoals('');
    setEquipment('');
    setDisability('');
    setFocusArea('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'in-progress': return '#f59e0b';
      case 'pending': return '#6b7280';
      default: return '#9ca3af';
    }
  };

  const CreateWorkoutTab = () => (
    <ScrollView style={styles.tabContent} contentContainerStyle={{ paddingBottom: 20 }}>
      <TouchableOpacity style={styles.createButton} onPress={() => setShowCreateModal(true)}>
        <Ionicons name="add-circle" size={32} color="#ffffff" />
        <Text style={styles.createButtonText}>Create New Workout</Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Templates</Text>
        {workoutTemplates.map((template) => (
          <TouchableOpacity key={template.id} style={styles.templateCard}>
            <View style={styles.templateHeader}>
              <Text style={styles.templateTitle}>{template.title}</Text>
              <Text style={styles.templateDifficulty}>{template.difficulty}</Text>
            </View>
            <Text style={styles.templateSport}>{template.sport}</Text>
            <Text style={styles.templateDescription}>{template.description}</Text>
            <View style={styles.templateFooter}>
              <Text style={styles.templateDuration}>{template.duration}</Text>
              <Text style={styles.templateExercises}>{template.exercises} exercises</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const RecentWorkoutsTab = () => (
    <ScrollView style={styles.tabContent} contentContainerStyle={{ paddingBottom: 20 }}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Workouts</Text>
        {recentWorkouts.map((workout) => (
          <View key={workout.id} style={styles.workoutCard}>
            <View style={styles.workoutHeader}>
              <View style={styles.workoutInfo}>
                <Text style={styles.workoutTitle}>{workout.title}</Text>
                <Text style={styles.workoutAthlete}>{workout.athlete}</Text>
                <Text style={styles.workoutDate}>{workout.date}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(workout.status) }]}>
                <Text style={styles.statusText}>{workout.status}</Text>
              </View>
            </View>
            {workout.feedback && (
              <View style={styles.feedbackSection}>
                <Ionicons name="chatbubble" size={16} color="#f97316" />
                <Text style={styles.feedbackText}>{workout.feedback}</Text>
              </View>
            )}
            <View style={styles.workoutActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="eye" size={16} color="#f97316" />
                <Text style={styles.actionText}>View</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="copy" size={16} color="#f97316" />
                <Text style={styles.actionText}>Duplicate</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="create" size={16} color="#f97316" />
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'create' && styles.activeTab]}
          onPress={() => setActiveTab('create')}
        >
          <Text style={[styles.tabText, activeTab === 'create' && styles.activeTabText]}>
            Create Workout
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'recent' && styles.activeTab]}
          onPress={() => setActiveTab('recent')}
        >
          <Text style={[styles.tabText, activeTab === 'recent' && styles.activeTabText]}>
            Recent Workouts
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'create' ? <CreateWorkoutTab /> : <RecentWorkoutsTab />}

      {/* Create Workout Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Workout</Text>
            <TouchableOpacity onPress={handleCreateWorkout} disabled={loading}>
              <Text style={[styles.saveText, loading && { opacity: 0.5 }]}>
                {loading ? 'Creating...' : 'Create'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} contentContainerStyle={{ paddingBottom: 40 }}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Workout Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter workout title"
                value={workoutTitle}
                onChangeText={setWorkoutTitle}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Assign to Athlete *</Text>
              <View style={styles.pickerContainer}>
                {athletes.map((athlete) => (
                  <TouchableOpacity
                    key={athlete.id}
                    style={[
                      styles.athleteOption,
                      selectedAthlete === athlete.id.toString() && styles.selectedOption
                    ]}
                    onPress={() => setSelectedAthlete(athlete.id.toString())}
                  >
                    <Text style={[
                      styles.athleteOptionText,
                      selectedAthlete === athlete.id.toString() && styles.selectedOptionText
                    ]}>
                      {athlete.name} - {athlete.sport}
                    </Text>
                    <Text style={styles.athleteDisability}>🔹 {athlete.disability}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Sport *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Swimming"
                  value={sport}
                  onChangeText={setSport}
                />
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Duration (min)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="45"
                  value={duration}
                  onChangeText={setDuration}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Difficulty Level</Text>
              <View style={styles.levelContainer}>
                {['beginner', 'intermediate', 'advanced'].map((lvl) => (
                  <TouchableOpacity
                    key={lvl}
                    style={[styles.levelOption, level === lvl && styles.selectedLevel]}
                    onPress={() => setLevel(lvl)}
                  >
                    <Text style={[styles.levelText, level === lvl && styles.selectedLevelText]}>
                      {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Goals</Text>
              <TextInput
                style={styles.textArea}
                placeholder="What should this workout achieve?"
                value={goals}
                onChangeText={setGoals}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Available Equipment</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., dumbbells, resistance bands"
                value={equipment}
                onChangeText={setEquipment}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Focus Area</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., upper body, cardio, flexibility"
                value={focusArea}
                onChangeText={setFocusArea}
              />
            </View>
          </ScrollView>
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
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
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#f97316',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  createButton: {
    backgroundColor: '#f97316',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  templateCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  templateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  templateDifficulty: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f97316',
    backgroundColor: '#fff7ed',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  templateSport: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 12,
  },
  templateFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  templateDuration: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  templateExercises: {
    fontSize: 12,
    color: '#6b7280',
  },
  workoutCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  workoutAthlete: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  workoutDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  feedbackSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  feedbackText: {
    fontSize: 13,
    color: '#f97316',
    marginLeft: 8,
    flex: 1,
  },
  workoutActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff7ed',
    borderRadius: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f97316',
    marginLeft: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  cancelText: {
    fontSize: 16,
    color: '#6b7280',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f97316',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  textArea: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  athleteOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  selectedOption: {
    backgroundColor: '#fff7ed',
  },
  athleteOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  selectedOptionText: {
    color: '#f97316',
  },
  athleteDisability: {
    fontSize: 12,
    color: '#6b7280',
  },
  levelContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  levelOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  selectedLevel: {
    backgroundColor: '#f97316',
  },
  levelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  selectedLevelText: {
    color: '#ffffff',
  },
});
