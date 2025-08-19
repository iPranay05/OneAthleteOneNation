import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, AppState } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import ttsService from '../services/tts';
import speechRecognition from '../services/speechRecognition';

export default function VoiceAssistant({ navigation, screenName, screenData = {} }) {
  const [isActive, setIsActive] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [lastScreen, setLastScreen] = useState('');
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    if (isActive) {
      initializeVoiceAssistant();
      announceScreenChange();
      startContinuousListening();
    }

    return () => {
      speechRecognition.stopContinuousListening();
    };
  }, [screenName, isActive]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  const handleAppStateChange = (nextAppState) => {
    if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
      if (isActive) {
        ttsService.speak('App is now active. You are on the ' + screenName + ' screen.');
      }
    }
    appStateRef.current = nextAppState;
  };

  const initializeVoiceAssistant = () => {
    registerGlobalCommands();
    registerScreenSpecificCommands();
  };

  const announceScreenChange = () => {
    if (lastScreen !== screenName) {
      setLastScreen(screenName);
      
      const screenAnnouncements = {
        'Workout': `Hi! You are now on the Workout screen. ${getWorkoutScreenInfo()}`,
        'Progress': `Hi! You are now on the Progress screen. ${getProgressScreenInfo()}`,
        'Chatbot': `Hi! You are now on the Chatbot screen. You can ask questions or get nutrition advice.`,
        'Profile': `Hi! You are now on the Profile screen. You can view and edit your information.`,
        'Explore': `Hi! You are now on the Explore screen. Discover new activities and connect with others.`,
        'Plans': `Hi! You are now on the Plans screen. View your training plans and goals.`,
        'CoachDirectory': `Hi! You are now on the Coach Directory. Find and connect with coaches.`,
      };

      const announcement = screenAnnouncements[screenName] || `Hi! You are now on the ${screenName} screen.`;
      
      // Delay announcement slightly to ensure screen is fully loaded
      setTimeout(() => {
        ttsService.speak(announcement);
      }, 500);
    }
  };

  const getWorkoutScreenInfo = () => {
    const workoutCount = screenData.assignedWorkouts?.length || 0;
    const completedCount = screenData.completedWorkouts?.length || 0;
    
    if (workoutCount === 0) {
      return 'You have no assigned workouts. Say "generate workout" to create one.';
    }
    
    return `You have ${workoutCount} assigned workout${workoutCount > 1 ? 's' : ''} and ${completedCount} completed workout${completedCount !== 1 ? 's' : ''}. Say "read workouts" to hear them or "start workout" to begin.`;
  };

  const getProgressScreenInfo = () => {
    const todaySteps = screenData.todaySteps || 0;
    const completionRate = screenData.completionRate || 0;
    
    return `Today you have ${todaySteps} steps with a ${completionRate}% workout completion rate. Say "read progress" for detailed stats.`;
  };

  const registerGlobalCommands = () => {
    const globalCommands = {
      // Navigation commands
      'open workouts': () => navigateWithAnnouncement('Workout', 'Opening workouts'),
      'go to workouts': () => navigateWithAnnouncement('Workout', 'Going to workouts'),
      'open chatbot': () => navigateWithAnnouncement('Chatbot', 'Opening chatbot'),
      'go to chatbot': () => navigateWithAnnouncement('Chatbot', 'Going to chatbot'),
      'show progress': () => navigateWithAnnouncement('Progress', 'Showing progress'),
      'go to progress': () => navigateWithAnnouncement('Progress', 'Going to progress'),
      'open profile': () => navigateWithAnnouncement('Profile', 'Opening profile'),
      'go to profile': () => navigateWithAnnouncement('Profile', 'Going to profile'),
      'open explore': () => navigateWithAnnouncement('Explore', 'Opening explore'),
      'go to explore': () => navigateWithAnnouncement('Explore', 'Going to explore'),
      'go back': () => navigateBack(),
      'go home': () => navigateWithAnnouncement('Workout', 'Going home'),

      // Assistant control
      'stop talking': () => ttsService.stop(),
      'pause assistant': () => pauseAssistant(),
      'resume assistant': () => resumeAssistant(),
      'speak slower': () => adjustSpeechRate(0.3),
      'speak faster': () => adjustSpeechRate(0.7),
      'speak normal': () => adjustSpeechRate(0.5),
      
      // Information commands
      'where am i': () => announceCurrentLocation(),
      'what screen': () => announceCurrentLocation(),
      'help me': () => provideContextualHelp(),
      'what can i say': () => listAvailableCommands(),
      'repeat that': () => repeatLastMessage(),
      
      // Emergency
      'emergency': () => handleEmergency(),
      'call for help': () => handleEmergency(),
    };

    speechRecognition.registerCommands(globalCommands);
  };

  const registerScreenSpecificCommands = () => {
    const screenCommands = {
      'Workout': {
        'read workouts': () => readWorkoutsList(),
        'start workout': () => startFirstWorkout(),
        'workout stats': () => readWorkoutStats(),
        'generate workout': () => openWorkoutGenerator(),
      },
      'Progress': {
        'read progress': () => readProgressDetails(),
        'read stats': () => readProgressStats(),
        'share progress': () => shareProgress(),
      },
      'Chatbot': {
        'ask question': () => focusOnChatInput(),
        'nutrition help': () => switchToNutritionTab(),
        'diet advice': () => switchToDietTab(),
      }
    };

    const currentScreenCommands = screenCommands[screenName] || {};
    speechRecognition.registerCommands(currentScreenCommands);
  };

  const navigateWithAnnouncement = (screenName, announcement) => {
    ttsService.speak(announcement);
    try {
      navigation.navigate(screenName);
    } catch (error) {
      ttsService.speak('Sorry, I cannot navigate to that screen right now.');
    }
  };

  const navigateBack = () => {
    ttsService.speak('Going back');
    try {
      navigation.goBack();
    } catch (error) {
      ttsService.speak('Cannot go back from this screen.');
    }
  };

  const startContinuousListening = () => {
    if (!isListening) {
      setIsListening(true);
      speechRecognition.startContinuousListening((result) => {
        if (result.matched) {
          // Command was executed successfully
        } else {
          // Optionally provide feedback for unrecognized commands
          console.log('Unrecognized command:', result.text);
        }
      });
    }
  };

  const pauseAssistant = () => {
    setIsActive(false);
    setIsListening(false);
    speechRecognition.stopContinuousListening();
    ttsService.speak('Voice assistant paused. Tap the microphone to reactivate.');
  };

  const resumeAssistant = () => {
    setIsActive(true);
    ttsService.speak('Voice assistant activated. I\'m listening for your commands.');
    startContinuousListening();
  };

  const adjustSpeechRate = (rate) => {
    ttsService.updateOptions({ rate });
    ttsService.speak('Speech rate adjusted');
  };

  const announceCurrentLocation = () => {
    const locationText = `You are currently on the ${screenName} screen. ${getScreenDescription()}`;
    ttsService.speak(locationText);
  };

  const getScreenDescription = () => {
    const descriptions = {
      'Workout': 'Here you can view assigned workouts, generate new ones, and track your fitness progress.',
      'Progress': 'Here you can see your daily steps, workout completion rates, and achievements.',
      'Chatbot': 'Here you can chat with the AI assistant, get nutrition advice, and ask health questions.',
      'Profile': 'Here you can view and edit your personal information and app settings.',
      'Explore': 'Here you can discover new activities and connect with other athletes.',
    };
    
    return descriptions[screenName] || 'This screen contains various options and information.';
  };

  const provideContextualHelp = () => {
    const helpText = `You are on the ${screenName} screen. Available commands include: navigation commands like "open chatbot" or "go to progress", information commands like "where am i", and assistant controls like "speak slower" or "pause assistant". Say "what can i say" for a complete list.`;
    ttsService.speak(helpText);
  };

  const listAvailableCommands = () => {
    const commands = speechRecognition.getCommands();
    const commandList = commands.slice(0, 10).map(cmd => cmd.phrase).join(', ');
    ttsService.speak(`Available commands include: ${commandList}. And many more.`);
  };

  const repeatLastMessage = () => {
    // In a real implementation, store the last TTS message
    ttsService.speak('This feature would repeat the last spoken message.');
  };

  const handleEmergency = () => {
    ttsService.speakAlert('Emergency mode activated. This would contact your emergency contacts.', true);
  };

  // Screen-specific command implementations
  const readWorkoutsList = () => {
    if (screenData.assignedWorkouts?.length > 0) {
      let workoutText = `You have ${screenData.assignedWorkouts.length} assigned workouts: `;
      screenData.assignedWorkouts.slice(0, 3).forEach((workout, index) => {
        workoutText += `${index + 1}. ${workout.title}, ${workout.duration} minutes. `;
      });
      ttsService.speak(workoutText);
    } else {
      ttsService.speak('You have no assigned workouts.');
    }
  };

  const startFirstWorkout = () => {
    if (screenData.assignedWorkouts?.length > 0) {
      ttsService.speak('Starting your first workout');
      // Could trigger workout start logic here
    } else {
      ttsService.speak('No workouts available to start');
    }
  };

  const readWorkoutStats = () => {
    const stats = screenData.workoutStats || {};
    const statsText = `Your workout statistics: ${stats.pending || 0} pending, ${stats.completed || 0} completed, with a ${stats.completionRate || 0}% success rate.`;
    ttsService.speak(statsText);
  };

  const openWorkoutGenerator = () => {
    ttsService.speak('Opening workout generator');
    // Could trigger tab switch or modal
  };

  const readProgressDetails = () => {
    const todaySteps = screenData.todaySteps || 0;
    const weeklyStats = screenData.weeklyStats || {};
    const progressText = `Today you have ${todaySteps} steps. This week you averaged ${weeklyStats.averageSteps || 0} steps per day.`;
    ttsService.speak(progressText);
  };

  const readProgressStats = () => {
    const stats = screenData.progressStats || {};
    ttsService.speak(`Your progress: ${stats.completionRate || 0}% completion rate, ${stats.activeStreak || 0} day active streak.`);
  };

  const shareProgress = () => {
    ttsService.speak('Sharing your progress');
  };

  const focusOnChatInput = () => {
    ttsService.speak('Ready to take your question. What would you like to ask?');
  };

  const switchToNutritionTab = () => {
    ttsService.speak('Switching to nutrition advice');
  };

  const switchToDietTab = () => {
    ttsService.speak('Switching to diet planning');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.assistantButton, !isActive && styles.inactiveButton]}
        onPress={isActive ? pauseAssistant : resumeAssistant}
        accessibilityLabel={isActive ? "Pause voice assistant" : "Activate voice assistant"}
      >
        <Ionicons 
          name={isActive ? "mic" : "mic-off"} 
          size={20} 
          color="#ffffff" 
        />
        {isListening && <View style={styles.listeningIndicator} />}
      </TouchableOpacity>
      
      {isActive && (
        <Text style={styles.statusText}>Voice Assistant Active</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 20,
    alignItems: 'center',
    zIndex: 1000,
  },
  assistantButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    position: 'relative',
  },
  inactiveButton: {
    backgroundColor: '#6b7280',
  },
  listeningIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ef4444',
  },
  statusText: {
    fontSize: 10,
    color: '#10b981',
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
});
