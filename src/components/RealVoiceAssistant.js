import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, AppState, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import ttsService from '../services/tts';
import voiceRecognition from '../services/voiceRecognition';

export default function RealVoiceAssistant({ navigation, screenName, screenData = {} }) {
  const [isActive, setIsActive] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        // App came to foreground
        if (isActive) {
          setTimeout(() => {
            announceScreenChange();
            registerVoiceCommands();
          }, 1000);
        }
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [isActive]);

  useEffect(() => {
    // Initialize voice recognition when component mounts
    voiceRecognition.initialize();
    
    return () => {
      // Cleanup on unmount
      voiceRecognition.clearCommands();
      voiceRecognition.stopListening();
    };
  }, []);

  useEffect(() => {
    initializeTTS();
  }, []);

  useEffect(() => {
    if (isActive && isInitialized) {
      announceScreenChange();
      registerVoiceCommands();
    }
  }, [screenName, isActive, isInitialized]);

  const registerVoiceCommands = () => {
    voiceRecognition.clearCommands();
    
    // Register all voice commands
    const allCommands = {
      'read progress': () => readProgressDetails(),
      'read workouts': () => readWorkoutsList(),
      'workout stats': () => readWorkoutStats(),
      'go to chatbot': () => navigateToScreen('Chatbot'),
      'go to progress': () => navigateToScreen('Progress'),
      'go to workouts': () => navigateToScreen('Workout'),
      'where am i': () => announceCurrentLocation(),
      'read screen': () => readCurrentScreen(),
      'voice search': () => handleVoiceSearch(),
      'today steps': () => announceTodaySteps(),
    };
    
    voiceRecognition.registerCommands(allCommands);
  };

  const navigateToScreen = async (screenName) => {
    navigation.navigate(screenName);
    setTimeout(() => {
      ttsService.speak(`You are now on the ${screenName} screen`);
    }, 1000);
  };

  const initializeTTS = async () => {
    const success = await ttsService.initialize();
    setIsInitialized(success);
    if (!success) {
      Alert.alert('Voice Assistant', 'Text-to-speech is not available on this device');
    }
  };

  const announceScreenChange = async () => {
    if (!isActive) return;
    
    const screenInfo = {
      'Workout': getWorkoutScreenInfo(),
      'Progress': getProgressScreenInfo(),
      'Chatbot': 'You can ask questions or get nutrition advice.',
      'Profile': 'You can view and edit your information.',
      'Explore': 'Discover new activities and connect with others.',
    };

    const info = screenInfo[screenName] || 'Various options are available.';
    await ttsService.speak(`Hi! You are now on the ${screenName} screen. ${info}`);
  };

  const getWorkoutScreenInfo = () => {
    const workoutCount = screenData.assignedWorkouts?.length || 0;
    const completedCount = screenData.completedWorkouts?.length || 0;
    
    if (workoutCount === 0) {
      return 'You have no assigned workouts. Tap the generate button to create one.';
    }
    
    return `You have ${workoutCount} assigned workout${workoutCount > 1 ? 's' : ''} and ${completedCount} completed workout${completedCount !== 1 ? 's' : ''}.`;
  };

  const getProgressScreenInfo = () => {
    const todaySteps = screenData.todaySteps || 0;
    const completionRate = screenData.progressStats?.completionRate || 0;
    
    return `Today you have ${todaySteps} steps with a ${completionRate}% workout completion rate.`;
  };

  const handleVoiceButtonPress = async () => {
    if (!isInitialized) {
      Alert.alert('Voice Assistant', 'Voice assistant is not available');
      return;
    }

    setIsActive(true);
    await ttsService.speak('Voice assistant ready. Say "read progress", "read workouts", or "go to chatbot".');
    
    // Start continuous voice listening
    voiceRecognition.startListening((result) => {
      if (result.matched) {
        console.log('✅ Voice command executed:', result.phrase);
      } else {
        ttsService.speak('Command not recognized. Try "read progress", "read workouts", or "go to chatbot".');
      }
    });
  };

  const showVoiceCommands = async () => {
    const commands = getAvailableCommands();
    
    Alert.alert(
      'Voice Commands',
      'Choose a command to execute:',
      [
        ...commands.map(cmd => ({
          text: cmd.label,
          onPress: () => executeCommand(cmd.action, cmd.announcement)
        })),
        { text: 'Stop Assistant', onPress: stopAssistant, style: 'destructive' },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const getAvailableCommands = () => {
    const baseCommands = [
      { label: 'Where Am I?', action: 'announce_location', announcement: 'Telling you your current location' },
      { label: 'Read Screen', action: 'read_screen', announcement: 'Reading screen content' },
      { label: 'Go to Workouts', action: 'navigate_workouts', announcement: 'Going to workouts' },
      { label: 'Go to Progress', action: 'navigate_progress', announcement: 'Going to progress' },
      { label: 'Go to Chatbot', action: 'navigate_chatbot', announcement: 'Going to chatbot' },
      { label: 'Voice Search', action: 'voice_search', announcement: 'Ready for voice search' },
    ];

    const screenSpecificCommands = {
      'Workout': [
        { label: 'Read Workouts', action: 'read_workouts', announcement: 'Reading your workout list' },
        { label: 'Workout Stats', action: 'workout_stats', announcement: 'Reading workout statistics' },
        { label: 'Generate Workout', action: 'generate_workout', announcement: 'Opening workout generator' },
      ],
      'Progress': [
        { label: 'Read Progress', action: 'read_progress', announcement: 'Reading your progress details' },
        { label: 'Today\'s Steps', action: 'today_steps', announcement: 'Announcing today\'s step count' },
      ],
      'Chatbot': [
        { label: 'Voice Search', action: 'voice_search', announcement: 'Ready for voice search. What would you like to ask?' },
        { label: 'Switch to Diet', action: 'switch_diet', announcement: 'Switching to diet advice' },
        { label: 'Switch to Nutrition', action: 'switch_nutrition', announcement: 'Switching to nutrition analysis' },
      ]
    };

    return [...baseCommands, ...(screenSpecificCommands[screenName] || [])];
  };

  const executeCommand = async (action, announcement) => {
    await ttsService.speak(announcement);

    switch (action) {
      case 'announce_location':
        await announceCurrentLocation();
        break;
      case 'read_screen':
        await readCurrentScreen();
        break;
      case 'navigate_workouts':
        navigation.navigate('Workout');
        setTimeout(() => ttsService.speak('You are now on the Workout screen'), 1000);
        break;
      case 'navigate_progress':
        navigation.navigate('Progress');
        setTimeout(() => ttsService.speak('You are now on the Progress screen'), 1000);
        break;
      case 'navigate_chatbot':
        navigation.navigate('Chatbot');
        setTimeout(() => ttsService.speak('You are now on the Chatbot screen'), 1000);
        break;
      case 'voice_search':
        await handleVoiceSearch();
        break;
      case 'read_workouts':
        await readWorkoutsList();
        break;
      case 'workout_stats':
        await readWorkoutStats();
        break;
      case 'read_progress':
        await readProgressDetails();
        break;
      case 'today_steps':
        await announceTodaySteps();
        break;
      default:
        await ttsService.speak('Command not implemented yet');
    }
  };

  const announceCurrentLocation = async () => {
    const description = getScreenDescription();
    await ttsService.speak(`You are on the ${screenName} screen. ${description}`);
  };

  const readCurrentScreen = async () => {
    const content = getScreenContent();
    await ttsService.speak(content);
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

  const getScreenContent = () => {
    switch (screenName) {
      case 'Workout':
        return getWorkoutScreenContent();
      case 'Progress':
        return getProgressScreenContent();
      case 'Chatbot':
        return getChatbotScreenContent();
      default:
        return `This is the ${screenName} screen with various options available.`;
    }
  };

  const getWorkoutScreenContent = () => {
    const workouts = screenData.assignedWorkouts || [];
    const completed = screenData.completedWorkouts || [];
    
    if (workouts.length === 0) {
      return 'No workouts assigned. Use the generate workout button to create a new workout plan.';
    }
    
    let content = `You have ${workouts.length} assigned workouts. `;
    workouts.slice(0, 3).forEach((workout, index) => {
      content += `${index + 1}. ${workout.title}, ${workout.duration} minutes, ${workout.exercises?.length || 0} exercises. `;
    });
    
    return content;
  };

  const getProgressScreenContent = () => {
    const steps = screenData.todaySteps || 0;
    const stats = screenData.weeklyStats || {};
    
    return `Today you have taken ${steps} steps. Your weekly average is ${stats.averageSteps || 0} steps. Total distance this week is ${stats.totalDistance || 0} kilometers.`;
  };

  const getChatbotScreenContent = () => {
    const tab = screenData.currentTab || 'chat';
    const messageCount = screenData.messageCount || 0;
    
    return `You are in the ${tab} section with ${messageCount} messages. You can ask questions about training, nutrition, diet planning, or health concerns.`;
  };

  const readWorkoutsList = async () => {
    const workouts = screenData.assignedWorkouts || [];
    if (workouts.length === 0) {
      await realTTS.speak('You have no assigned workouts.');
      return;
    }

    const workoutList = workouts.map(w => `${w.title}, ${w.duration} minutes`);
    let text = `Your assigned workouts: `;
    workoutList.slice(0, 3).forEach((workout, index) => {
      text += `${index + 1}. ${workout}. `;
    });
    await ttsService.speak(text);
  };

  const readWorkoutStats = async () => {
    const stats = screenData.workoutStats || {};
    const text = `Your workout statistics: ${stats.pending || 0} pending workouts, ${stats.completed || 0} completed workouts, with a ${stats.completionRate || 0}% success rate.`;
    await ttsService.speak(text);
  };

  const readProgressDetails = async () => {
    const steps = screenData.todaySteps || 0;
    const weeklyStats = screenData.weeklyStats || {};
    const text = `Today you have ${steps} steps. This week you averaged ${weeklyStats.averageSteps || 0} steps per day with a total distance of ${weeklyStats.totalDistance || 0} kilometers.`;
    await ttsService.speak(text);
  };

  const announceTodaySteps = async () => {
    const steps = screenData.todaySteps || 0;
    await ttsService.speak(`You have taken ${steps} steps today.`);
  };

  const handleVoiceSearch = async () => {
    if (screenName === 'Chatbot') {
      await ttsService.speak('What would you like to search for? I will type it in the chatbot for you.');
      
      // Show voice input options for chatbot
      Alert.alert(
        'Voice Search',
        'Choose what to search for:',
        [
          { text: 'Nutrition advice', onPress: () => typeInChatbot('I need nutrition advice for my training') },
          { text: 'Workout tips', onPress: () => typeInChatbot('Give me workout tips for my sport') },
          { text: 'Recovery help', onPress: () => typeInChatbot('How can I improve my recovery after training?') },
          { text: 'Diet plan', onPress: () => typeInChatbot('Create a diet plan for my fitness goals') },
          { text: 'Injury prevention', onPress: () => typeInChatbot('How can I prevent injuries during training?') },
          { text: 'Custom question', onPress: () => customVoiceInput() },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } else {
      await ttsService.speak('Voice search is available on the Chatbot screen. Say "go to chatbot" to navigate there.');
    }
  };

  const typeInChatbot = async (text) => {
    await ttsService.speak(`Typing: ${text}`);
    
    // Pass the text to the chatbot screen
    if (screenData.onVoiceInput) {
      screenData.onVoiceInput(text);
    }
    
    setTimeout(() => {
      ttsService.speak('Message typed. You can now send it or modify it.');
    }, 1000);
  };

  const customVoiceInput = async () => {
    await ttsService.speak('Please speak your question and I will type it for you.');
    
    // Show text input options for custom voice input
    Alert.alert(
      'Custom Voice Input',
      'Choose a sample question or type your own:',
      [
        { text: 'How to build muscle?', onPress: () => typeInChatbot('How can I build muscle effectively?') },
        { text: 'Best foods for energy?', onPress: () => typeInChatbot('What are the best foods for sustained energy during workouts?') },
        { text: 'Training schedule help', onPress: () => typeInChatbot('Help me create an effective training schedule') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const stopAssistant = async () => {
    setIsActive(false);
    await ttsService.stop();
    await ttsService.speak('Voice assistant deactivated.');
  };

  if (!isInitialized) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.assistantButton, isActive && styles.activeButton]}
        onPress={handleVoiceButtonPress}
        accessibilityLabel="Voice Assistant"
        accessibilityHint="Tap to activate voice commands and screen reading"
      >
        <Ionicons 
          name="mic" 
          size={24} 
          color="#ffffff" 
        />
        {isActive && <View style={styles.activeIndicator} />}
      </TouchableOpacity>
      
      {isActive && (
        <Text style={styles.statusText}>Voice Active</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    right: 20,
    alignItems: 'center',
    zIndex: 1000,
  },
  assistantButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    position: 'relative',
  },
  activeButton: {
    backgroundColor: '#059669',
    transform: [{ scale: 1.1 }],
  },
  activeIndicator: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ef4444',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  statusText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '700',
    marginTop: 6,
    textAlign: 'center',
    textShadowColor: '#ffffff',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
