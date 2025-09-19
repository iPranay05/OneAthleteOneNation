import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWorkouts } from '../../context/WorkoutContext';
import { generateWorkout } from '../../services/ai';
import BlindUserVoiceAssistant from '../../components/BlindUserVoiceAssistant';
import { useUser } from '../../context/UserContext';
import ttsService from '../../services/tts';
import speechRecognition from '../../services/speechRecognition';

export default function Workout({ navigation }) {
  const { workouts, addWorkout, completeWorkout, deleteWorkout, getWorkoutStats } = useWorkouts();
  const { userProfile } = useUser();
  const [showGenerator, setShowGenerator] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedTab, setSelectedTab] = useState('assigned'); // 'assigned' | 'generate'
  
  // AI Generation Form
  const [sport, setSport] = useState('');
  const [level, setLevel] = useState('');
  const [duration, setDuration] = useState('');
  const [goals, setGoals] = useState('');
  const [equipment, setEquipment] = useState('');
  const [disability, setDisability] = useState('');
  const [focusArea, setFocusArea] = useState('');

  const stats = getWorkoutStats();
  const assignedWorkouts = workouts.filter(w => !w.completed);
  const completedWorkouts = workouts.filter(w => w.completed);

  useEffect(() => {
    // Register workout-specific voice commands
    const workoutCommands = {
      'start workout': () => {
        if (assignedWorkouts.length > 0) {
          ttsService.speak('Starting your first workout');
          // Could navigate to workout detail screen
        } else {
          ttsService.speak('No workouts available to start');
        }
      },
      'complete workout': () => {
        if (assignedWorkouts.length > 0) {
          handleCompleteWorkout(assignedWorkouts[0].id);
        } else {
          ttsService.speak('No workouts to complete');
        }
      },
      'generate workout': () => {
        setSelectedTab('generate');
        ttsService.speak('Opening workout generator. Please provide your sport and preferences.');
      },
      'read workouts': () => {
        readWorkoutsList();
      },
      'workout stats': () => {
        readWorkoutStats();
      }
    };

    speechRecognition.registerCommands(workoutCommands);

    return () => {
      speechRecognition.clearCommands();
    };
  }, [assignedWorkouts, stats]);

  const readWorkoutsList = () => {
    if (assignedWorkouts.length === 0) {
      ttsService.speak('You have no assigned workouts. You can generate an AI workout or wait for your coach to assign one.');
      return;
    }

    let workoutText = `You have ${assignedWorkouts.length} assigned workout${assignedWorkouts.length > 1 ? 's' : ''}. `;
    assignedWorkouts.slice(0, 3).forEach((workout, index) => {
      workoutText += `${index + 1}. ${workout.title}, ${workout.duration} minutes, ${workout.difficulty} difficulty. `;
    });
    
    if (assignedWorkouts.length > 3) {
      workoutText += `And ${assignedWorkouts.length - 3} more workouts.`;
    }

    ttsService.speak(workoutText);
  };

  const readWorkoutStats = () => {
    const statsText = `Your workout statistics: ${stats.pending} pending workouts, ${stats.completed} completed workouts, with a ${stats.completionRate}% success rate.`;
    ttsService.speak(statsText);
  };

  const handleGenerateWorkout = async () => {
    if (!sport.trim()) {
      Alert.alert('Error', 'Please enter your sport');
      return;
    }
    
    setGenerating(true);
    try {
      const workout = await generateWorkout({
        sport: sport.trim(),
        level: level.trim() || 'intermediate',
        duration: parseInt(duration) || 45,
        goals: goals.trim(),
        equipment: equipment.trim(),
        disability: disability.trim(),
        focusArea: focusArea.trim()
      });
      
      addWorkout(workout);
      
      // Reset form
      setSport('');
      setLevel('');
      setDuration('');
      setGoals('');
      setEquipment('');
      setDisability('');
      setFocusArea('');
      setSelectedTab('assigned');
      
      Alert.alert('Success', 'Workout generated and added to your plan!');
    } catch (error) {
      Alert.alert('Error', 'Failed to generate workout. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCompleteWorkout = (workoutId) => {
    Alert.alert(
      'Complete Workout',
      'Mark this workout as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Complete', 
          onPress: () => {
            completeWorkout(workoutId);
            Alert.alert('Great job!', 'Workout completed successfully!');
          }
        }
      ]
    );
  };

  const renderWorkoutCard = (workout) => (
    <View key={workout.id} style={styles.workoutCard}>
      <View style={styles.workoutHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.workoutTitle}>{workout.title}</Text>
          <Text style={styles.workoutDescription}>{workout.description}</Text>
          <View style={styles.workoutMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color="#6b7280" />
              <Text style={styles.metaText}>{workout.duration} min</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="fitness-outline" size={14} color="#6b7280" />
              <Text style={styles.metaText}>{workout.difficulty}</Text>
            </View>
            {workout.source === 'coach' && (
              <View style={styles.metaItem}>
                <Ionicons name="person-outline" size={14} color="#f97316" />
                <Text style={[styles.metaText, { color: '#f97316' }]}>{workout.coachName}</Text>
              </View>
            )}
          </View>
        </View>
        {!workout.completed && (
          <TouchableOpacity 
            style={styles.completeBtn}
            onPress={() => handleCompleteWorkout(workout.id)}
          >
            <Ionicons name="checkmark" size={20} color="#10b981" />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.exercisesList}>
        {workout.exercises?.slice(0, 3).map((exercise, index) => (
          <View key={index} style={styles.exerciseItem}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <Text style={styles.exerciseDetail}>
              {exercise.sets > 1 ? `${exercise.sets} sets × ` : ''}{exercise.reps}
            </Text>
          </View>
        ))}
        {workout.exercises?.length > 3 && (
          <Text style={styles.moreExercises}>+{workout.exercises.length - 3} more exercises</Text>
        )}
      </View>
      
      {workout.completed && (
        <View style={styles.completedBadge}>
          <Ionicons name="checkmark-circle" size={16} color="#10b981" />
          <Text style={styles.completedText}>Completed</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 20 }}>
      {/* Header with Stats */}
      <View style={styles.header}>
        <Text style={styles.title}>Workouts</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.completionRate}%</Text>
            <Text style={styles.statLabel}>Success Rate</Text>
          </View>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'assigned' && styles.activeTab]}
          onPress={() => setSelectedTab('assigned')}
        >
          <Text style={[styles.tabText, selectedTab === 'assigned' && styles.activeTabText]}>
            Assigned ({assignedWorkouts.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'generate' && styles.activeTab]}
          onPress={() => setSelectedTab('generate')}
        >
          <Text style={[styles.tabText, selectedTab === 'generate' && styles.activeTabText]}>
            Generate AI Workout
          </Text>
        </TouchableOpacity>
      </View>

      {selectedTab === 'assigned' ? (
        <View>
          {assignedWorkouts.length > 0 ? (
            assignedWorkouts.map(renderWorkoutCard)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="fitness-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyTitle}>No workouts assigned</Text>
              <Text style={styles.emptyText}>Generate an AI workout or wait for your coach to assign one</Text>
            </View>
          )}
          
          {completedWorkouts.length > 0 && (
            <View style={styles.completedSection}>
              <Text style={styles.sectionTitle}>Recently Completed</Text>
              {completedWorkouts.slice(0, 3).map(renderWorkoutCard)}
            </View>
          )}
        </View>
      ) : (
        <View style={styles.generatorForm}>
          <Text style={styles.formTitle}>Generate AI Workout</Text>
          <Text style={styles.formSubtitle}>Create a personalized workout based on your needs</Text>
          
          <Text style={styles.label}>Sport *</Text>
          <TextInput
            style={styles.input}
            value={sport}
            onChangeText={setSport}
            placeholder="e.g., Track & Field, Swimming, Basketball"
          />
          
          <Text style={styles.label}>Fitness Level</Text>
          <TextInput
            style={styles.input}
            value={level}
            onChangeText={setLevel}
            placeholder="beginner, intermediate, advanced"
          />
          
          <Text style={styles.label}>Duration (minutes)</Text>
          <TextInput
            style={styles.input}
            value={duration}
            onChangeText={setDuration}
            placeholder="30, 45, 60"
            keyboardType="numeric"
          />
          
          <Text style={styles.label}>Goals</Text>
          <TextInput
            style={styles.input}
            value={goals}
            onChangeText={setGoals}
            placeholder="strength, endurance, flexibility, sport-specific"
            multiline
          />
          
          <Text style={styles.label}>Available Equipment</Text>
          <TextInput
            style={styles.input}
            value={equipment}
            onChangeText={setEquipment}
            placeholder="wheelchair, resistance bands, weights, none"
          />
          
          <Text style={styles.label}>Disability Considerations</Text>
          <TextInput
            style={styles.input}
            value={disability}
            onChangeText={setDisability}
            placeholder="mobility, visual, hearing, cognitive (optional)"
          />
          
          <Text style={styles.label}>Focus Area</Text>
          <TextInput
            style={styles.input}
            value={focusArea}
            onChangeText={setFocusArea}
            placeholder="upper body, core, cardio, rehabilitation"
          />
          
          <TouchableOpacity
            style={[styles.generateBtn, generating && { opacity: 0.6 }]}
            onPress={handleGenerateWorkout}
            disabled={generating}
          >
            {generating ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Ionicons name="sparkles" size={20} color="#ffffff" />
                <Text style={styles.generateBtnText}>Generate Workout</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
      </ScrollView>
      <BlindUserVoiceAssistant 
        navigation={navigation} 
        screenName="Workout" 
        userProfile={userProfile}
        screenData={{
          assignedWorkouts: assignedWorkouts,
          completedWorkouts: completedWorkouts,
          workoutStats: getWorkoutStats()
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  
  // Header
  header: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: { 
    color: '#111827', 
    fontSize: 24, 
    fontWeight: '800', 
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f97316',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#f97316',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#ffffff',
  },

  // Workout Cards
  workoutCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  workoutDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  workoutMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
    fontWeight: '500',
  },
  completeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#10b981',
  },

  // Exercises
  exercisesList: {
    marginTop: 8,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginBottom: 6,
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  exerciseDetail: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  moreExercises: {
    fontSize: 12,
    color: '#f97316',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },

  // Completed Badge
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  completedText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
    marginLeft: 4,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    marginHorizontal: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Sections
  completedSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginHorizontal: 16,
    marginBottom: 8,
  },

  // Generator Form
  generatorForm: {
    margin: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  generateBtn: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  generateBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});
