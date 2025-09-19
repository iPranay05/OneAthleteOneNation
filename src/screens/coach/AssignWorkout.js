import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function AssignWorkout({ route, navigation }) {
  const { athlete } = route.params;
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [customNotes, setCustomNotes] = useState('');

  const workoutTemplates = [
    {
      id: 1,
      name: 'Strength Training',
      duration: '45 min',
      exercises: 8,
      difficulty: 'Medium',
      description: 'Focus on building core strength and stability',
      icon: '💪'
    },
    {
      id: 2,
      name: 'Cardio Endurance',
      duration: '30 min',
      exercises: 5,
      difficulty: 'High',
      description: 'Improve cardiovascular fitness and stamina',
      icon: '🏃‍♂️'
    },
    {
      id: 3,
      name: 'Flexibility & Mobility',
      duration: '25 min',
      exercises: 6,
      difficulty: 'Low',
      description: 'Enhance range of motion and prevent injuries',
      icon: '🧘‍♀️'
    },
    {
      id: 4,
      name: 'Sport-Specific Training',
      duration: '60 min',
      exercises: 10,
      difficulty: 'High',
      description: 'Tailored exercises for specific sport performance',
      icon: '🏆'
    }
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Low': return '#10b981';
      case 'Medium': return '#f59e0b';
      case 'High': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const assignWorkout = () => {
    if (!selectedWorkout) {
      Alert.alert('Error', 'Please select a workout to assign');
      return;
    }

    Alert.alert(
      'Workout Assigned',
      `${selectedWorkout.name} has been assigned to ${athlete.name}. They will receive a notification.`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.athleteInfo}>
          <Text style={styles.title}>Assign Workout</Text>
          <Text style={styles.subtitle}>For {athlete.name}</Text>
        </View>
        <Text style={styles.athleteAvatar}>{athlete.avatar}</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Workout Templates */}
        <Text style={styles.sectionTitle}>Choose Workout Template</Text>
        {workoutTemplates.map((workout) => (
          <TouchableOpacity
            key={workout.id}
            style={[
              styles.workoutCard,
              selectedWorkout?.id === workout.id && styles.selectedWorkout
            ]}
            onPress={() => setSelectedWorkout(workout)}
          >
            <View style={styles.workoutHeader}>
              <Text style={styles.workoutIcon}>{workout.icon}</Text>
              <View style={styles.workoutInfo}>
                <Text style={styles.workoutName}>{workout.name}</Text>
                <Text style={styles.workoutDescription}>{workout.description}</Text>
              </View>
              {selectedWorkout?.id === workout.id && (
                <Ionicons name="checkmark-circle" size={24} color="#f97316" />
              )}
            </View>
            
            <View style={styles.workoutDetails}>
              <View style={styles.workoutStat}>
                <Ionicons name="time" size={16} color="#6b7280" />
                <Text style={styles.statText}>{workout.duration}</Text>
              </View>
              <View style={styles.workoutStat}>
                <Ionicons name="fitness" size={16} color="#6b7280" />
                <Text style={styles.statText}>{workout.exercises} exercises</Text>
              </View>
              <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(workout.difficulty) }]}>
                <Text style={styles.difficultyText}>{workout.difficulty}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* Custom Notes */}
        <Text style={styles.sectionTitle}>Additional Notes (Optional)</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="Add specific instructions or modifications for this athlete..."
          placeholderTextColor="#9ca3af"
          value={customNotes}
          onChangeText={setCustomNotes}
          multiline
          numberOfLines={4}
        />

        {/* Assign Button */}
        <TouchableOpacity style={styles.assignButton} onPress={assignWorkout}>
          <Ionicons name="send" size={20} color="#ffffff" />
          <Text style={styles.assignButtonText}>Assign Workout</Text>
        </TouchableOpacity>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    marginTop: 8,
  },
  workoutCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  selectedWorkout: {
    borderColor: '#f97316',
    backgroundColor: '#fff7ed',
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  workoutDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  workoutDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  workoutStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  notesInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  assignButton: {
    backgroundColor: '#f97316',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  assignButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
