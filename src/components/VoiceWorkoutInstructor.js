import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import ttsService from '../services/tts';
import speechRecognition from '../services/speechRecognition';

export default function VoiceWorkoutInstructor({ workout, visible, onClose, onComplete }) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [restTimer, setRestTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [workoutStarted, setWorkoutStarted] = useState(false);

  const restIntervalRef = useRef(null);
  const exercises = workout?.exercises || [];
  const currentExercise = exercises[currentExerciseIndex];

  useEffect(() => {
    if (visible && !workoutStarted) {
      initializeVoiceWorkout();
    }

    return () => {
      clearInterval(restIntervalRef.current);
      speechRecognition.clearCommands();
    };
  }, [visible, workoutStarted]);

  useEffect(() => {
    if (visible) {
      registerWorkoutVoiceCommands();
    }
  }, [currentExerciseIndex, currentSet, isResting, isPaused]);

  const initializeVoiceWorkout = () => {
    const welcomeText = `Starting ${workout.title}. This workout has ${exercises.length} exercises and will take approximately ${workout.duration} minutes. Say "start workout" to begin, or "read exercises" to hear the full list.`;
    ttsService.speak(welcomeText);
  };

  const registerWorkoutVoiceCommands = () => {
    const commands = {
      'start workout': () => startWorkout(),
      'next exercise': () => nextExercise(),
      'previous exercise': () => previousExercise(),
      'repeat instructions': () => repeatCurrentExercise(),
      'pause workout': () => pauseWorkout(),
      'resume workout': () => resumeWorkout(),
      'skip rest': () => skipRest(),
      'read exercises': () => readAllExercises(),
      'current exercise': () => readCurrentExercise(),
      'how many left': () => readRemainingExercises(),
      'finish workout': () => finishWorkout(),
      'stop workout': () => stopWorkout(),
    };

    speechRecognition.registerCommands(commands);
  };

  const startWorkout = () => {
    setWorkoutStarted(true);
    setCurrentExerciseIndex(0);
    setCurrentSet(1);
    ttsService.speak('Workout started! Let\'s begin with the first exercise.');
    setTimeout(() => readCurrentExercise(), 1000);
  };

  const readCurrentExercise = () => {
    if (!currentExercise) return;

    let instruction = `Exercise ${currentExerciseIndex + 1} of ${exercises.length}. ${currentExercise.name}. `;
    
    if (currentExercise.sets > 1) {
      instruction += `Set ${currentSet} of ${currentExercise.sets}. `;
    }
    
    instruction += `${currentExercise.reps}. `;
    
    if (currentExercise.instructions) {
      instruction += `Instructions: ${currentExercise.instructions}. `;
    }
    
    if (currentExercise.adaptations) {
      instruction += `Adaptations: ${currentExercise.adaptations}. `;
    }

    instruction += 'Say "next exercise" when ready to continue.';
    
    ttsService.speak(instruction);
  };

  const nextExercise = () => {
    if (!currentExercise) return;

    if (currentSet < currentExercise.sets) {
      // Move to next set
      setCurrentSet(currentSet + 1);
      startRest();
    } else if (currentExerciseIndex < exercises.length - 1) {
      // Move to next exercise
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSet(1);
      startRest();
    } else {
      // Workout complete
      finishWorkout();
    }
  };

  const previousExercise = () => {
    if (currentSet > 1) {
      setCurrentSet(currentSet - 1);
      ttsService.speak('Going back to previous set');
      setTimeout(() => readCurrentExercise(), 500);
    } else if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
      const prevExercise = exercises[currentExerciseIndex - 1];
      setCurrentSet(prevExercise.sets);
      ttsService.speak('Going back to previous exercise');
      setTimeout(() => readCurrentExercise(), 500);
    } else {
      ttsService.speak('This is the first exercise');
    }
  };

  const startRest = () => {
    const restTime = currentExercise.restTime || 60;
    setIsResting(true);
    setRestTimer(restTime);
    
    ttsService.speak(`Good job! Rest for ${restTime} seconds. I'll let you know when it's time for the next exercise.`);
    
    restIntervalRef.current = setInterval(() => {
      setRestTimer((prev) => {
        if (prev <= 1) {
          clearInterval(restIntervalRef.current);
          setIsResting(false);
          ttsService.speak('Rest time is over. Ready for the next exercise?');
          setTimeout(() => readCurrentExercise(), 1000);
          return 0;
        }
        
        // Announce countdown for last 10 seconds
        if (prev <= 10) {
          ttsService.speak(prev.toString());
        }
        
        return prev - 1;
      });
    }, 1000);
  };

  const skipRest = () => {
    if (isResting) {
      clearInterval(restIntervalRef.current);
      setIsResting(false);
      setRestTimer(0);
      ttsService.speak('Rest skipped. Moving to next exercise.');
      setTimeout(() => readCurrentExercise(), 500);
    }
  };

  const pauseWorkout = () => {
    setIsPaused(true);
    if (isResting) {
      clearInterval(restIntervalRef.current);
    }
    ttsService.speak('Workout paused. Say "resume workout" to continue.');
  };

  const resumeWorkout = () => {
    setIsPaused(false);
    if (isResting && restTimer > 0) {
      startRest();
    }
    ttsService.speak('Workout resumed.');
  };

  const readAllExercises = () => {
    let exerciseList = `This workout has ${exercises.length} exercises: `;
    exercises.forEach((exercise, index) => {
      exerciseList += `${index + 1}. ${exercise.name}, ${exercise.sets} sets of ${exercise.reps}. `;
    });
    ttsService.speak(exerciseList);
  };

  const readRemainingExercises = () => {
    const remaining = exercises.length - currentExerciseIndex;
    const remainingSets = currentExercise ? currentExercise.sets - currentSet : 0;
    
    let text = '';
    if (remainingSets > 0) {
      text += `${remainingSets} sets remaining in current exercise. `;
    }
    text += `${remaining} exercises remaining in total.`;
    
    ttsService.speak(text);
  };

  const repeatCurrentExercise = () => {
    readCurrentExercise();
  };

  const finishWorkout = () => {
    Alert.alert(
      'Workout Complete!',
      'Congratulations! You\'ve completed your workout. How do you feel?',
      [
        { text: 'Great!', onPress: () => completeWorkout('great') },
        { text: 'Good', onPress: () => completeWorkout('good') },
        { text: 'Challenging', onPress: () => completeWorkout('challenging') }
      ]
    );
  };

  const completeWorkout = (feeling) => {
    ttsService.speak(`Excellent work! Workout completed. You're doing amazing!`);
    onComplete?.({ feeling, completedAt: new Date() });
    onClose();
  };

  const stopWorkout = () => {
    Alert.alert(
      'Stop Workout',
      'Are you sure you want to stop this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Stop', style: 'destructive', onPress: () => {
          ttsService.speak('Workout stopped. Great effort today!');
          onClose();
        }}
      ]
    );
  };

  if (!workout) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
          <Text style={styles.workoutTitle}>{workout.title}</Text>
          <TouchableOpacity onPress={pauseWorkout} style={styles.pauseBtn}>
            <Ionicons name={isPaused ? "play" : "pause"} size={24} color="#f97316" />
          </TouchableOpacity>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentExerciseIndex + (currentSet / currentExercise?.sets || 1)) / exercises.length) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            Exercise {currentExerciseIndex + 1} of {exercises.length}
            {currentExercise?.sets > 1 && ` • Set ${currentSet} of ${currentExercise.sets}`}
          </Text>
        </View>

        {/* Current Exercise Display */}
        <View style={styles.exerciseContainer}>
          {currentExercise && (
            <>
              <Text style={styles.exerciseName}>{currentExercise.name}</Text>
              <Text style={styles.exerciseReps}>{currentExercise.reps}</Text>
              
              {currentExercise.instructions && (
                <View style={styles.instructionsCard}>
                  <Ionicons name="information-circle" size={20} color="#f97316" />
                  <Text style={styles.instructionsText}>{currentExercise.instructions}</Text>
                </View>
              )}

              {currentExercise.adaptations && (
                <View style={styles.adaptationsCard}>
                  <Ionicons name="accessibility" size={20} color="#8b5cf6" />
                  <Text style={styles.adaptationsText}>{currentExercise.adaptations}</Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Rest Timer */}
        {isResting && (
          <View style={styles.restContainer}>
            <Text style={styles.restTitle}>Rest Time</Text>
            <Text style={styles.restTimer}>{restTimer}s</Text>
            <TouchableOpacity style={styles.skipRestBtn} onPress={skipRest}>
              <Text style={styles.skipRestText}>Skip Rest</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Control Buttons */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity 
            style={styles.controlBtn} 
            onPress={previousExercise}
            disabled={currentExerciseIndex === 0 && currentSet === 1}
          >
            <Ionicons name="chevron-back" size={24} color="#f97316" />
            <Text style={styles.controlText}>Previous</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.readBtn} onPress={readCurrentExercise}>
            <Ionicons name="volume-high" size={24} color="#ffffff" />
            <Text style={styles.readBtnText}>Read Instructions</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlBtn} onPress={nextExercise}>
            <Ionicons name="chevron-forward" size={24} color="#f97316" />
            <Text style={styles.controlText}>Next</Text>
          </TouchableOpacity>
        </View>

        {/* Voice Commands Help */}
        <View style={styles.voiceHelp}>
          <Text style={styles.voiceHelpTitle}>🎤 Voice Commands:</Text>
          <Text style={styles.voiceHelpText}>
            "Next exercise" • "Previous exercise" • "Repeat instructions" • "Pause workout" • "Skip rest" • "Finish workout"
          </Text>
        </View>
      </View>
    </Modal>
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
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  closeBtn: {
    padding: 8,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
  },
  pauseBtn: {
    padding: 8,
  },
  progressContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#f97316',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
  },
  exerciseContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
  },
  exerciseReps: {
    fontSize: 24,
    fontWeight: '600',
    color: '#f97316',
    textAlign: 'center',
    marginBottom: 24,
  },
  instructionsCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff7ed',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f97316',
  },
  instructionsText: {
    fontSize: 16,
    color: '#111827',
    lineHeight: 24,
    marginLeft: 12,
    flex: 1,
  },
  adaptationsCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f3e8ff',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#8b5cf6',
  },
  adaptationsText: {
    fontSize: 16,
    color: '#111827',
    lineHeight: 24,
    marginLeft: 12,
    flex: 1,
  },
  restContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  restTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  restTimer: {
    fontSize: 48,
    fontWeight: '800',
    color: '#f97316',
    marginBottom: 16,
  },
  skipRestBtn: {
    backgroundColor: '#f97316',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  skipRestText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
  },
  controlBtn: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fff7ed',
    minWidth: 80,
  },
  controlText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f97316',
    marginTop: 4,
  },
  readBtn: {
    backgroundColor: '#f97316',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  readBtnText: {
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 8,
  },
  voiceHelp: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  voiceHelpTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  voiceHelpText: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 18,
  },
});

// Helper functions for the component
VoiceWorkoutInstructor.prototype.readAllExercises = function() {
  let exerciseList = `This workout contains ${this.exercises.length} exercises: `;
  this.exercises.forEach((exercise, index) => {
    exerciseList += `${index + 1}. ${exercise.name}, ${exercise.sets} sets of ${exercise.reps}. `;
  });
  ttsService.speak(exerciseList);
};

VoiceWorkoutInstructor.prototype.readRemainingExercises = function() {
  const remaining = this.exercises.length - this.currentExerciseIndex;
  const remainingSets = this.currentExercise ? this.currentExercise.sets - this.currentSet : 0;
  
  let text = '';
  if (remainingSets > 0) {
    text += `${remainingSets} sets remaining in current exercise. `;
  }
  text += `${remaining} exercises remaining in total.`;
  
  ttsService.speak(text);
};

VoiceWorkoutInstructor.prototype.finishWorkout = function() {
  Alert.alert(
    'Workout Complete!',
    'Congratulations! You\'ve completed your workout. How do you feel?',
    [
      { text: 'Great!', onPress: () => this.completeWorkout('great') },
      { text: 'Good', onPress: () => this.completeWorkout('good') },
      { text: 'Challenging', onPress: () => this.completeWorkout('challenging') }
    ]
  );
};

VoiceWorkoutInstructor.prototype.stopWorkout = function() {
  Alert.alert(
    'Stop Workout',
    'Are you sure you want to stop this workout?',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Stop', style: 'destructive', onPress: () => {
        ttsService.speak('Workout stopped. Great effort today!');
        this.onClose();
      }}
    ]
  );
};
