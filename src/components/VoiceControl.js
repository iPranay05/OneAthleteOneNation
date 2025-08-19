import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import speechRecognition from '../services/speechRecognition';
import ttsService from '../services/tts';

export default function VoiceControl({ navigation, screenName = 'Unknown' }) {
  const [isListening, setIsListening] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    initializeVoiceControl();
    return () => {
      speechRecognition.stopListening();
    };
  }, []);

  useEffect(() => {
    if (isListening) {
      startPulseAnimation();
    } else {
      stopPulseAnimation();
    }
  }, [isListening]);

  const initializeVoiceControl = async () => {
    const available = await speechRecognition.initialize();
    setIsAvailable(available);

    if (available) {
      registerNavigationCommands();
      registerScreenCommands();
      registerAccessibilityCommands();
    }
  };

  const registerNavigationCommands = () => {
    const navigationCommands = {
      'go to home': () => navigation.navigate('Home'),
      'open workouts': () => navigation.navigate('Workout'),
      'show progress': () => navigation.navigate('Progress'),
      'open chatbot': () => navigation.navigate('Chatbot'),
      'go to profile': () => navigation.navigate('Profile'),
      'go back': () => navigation.goBack(),
      'go to main menu': () => navigation.navigate('Home'),
    };

    speechRecognition.registerCommands(navigationCommands);
  };

  const registerScreenCommands = () => {
    const screenCommands = {
      'read screen': () => readCurrentScreen(),
      'read this': () => readCurrentScreen(),
      'help me': () => provideHelp(),
      'what can I say': () => listAvailableCommands(),
      'emergency': () => handleEmergency(),
      'call for help': () => handleEmergency(),
    };

    speechRecognition.registerCommands(screenCommands);
  };

  const registerAccessibilityCommands = () => {
    const accessibilityCommands = {
      'speak slower': () => ttsService.updateOptions({ rate: 0.3 }),
      'speak faster': () => ttsService.updateOptions({ rate: 0.7 }),
      'stop speaking': () => ttsService.stop(),
      'repeat that': () => repeatLastMessage(),
      'louder': () => ttsService.updateOptions({ pitch: 1.3 }),
      'quieter': () => ttsService.updateOptions({ pitch: 0.8 }),
    };

    speechRecognition.registerCommands(accessibilityCommands);
  };

  const startListening = () => {
    if (!isAvailable) {
      Alert.alert('Voice Control', 'Voice recognition is not available on this device');
      return;
    }

    setIsListening(true);
    
    // Show test options for mock implementation
    Alert.alert(
      'Voice Commands Test',
      'Choose a command to test:',
      [
        { text: 'Read Workouts', onPress: () => testCommand('read workouts') },
        { text: 'Workout Stats', onPress: () => testCommand('workout stats') },
        { text: 'Help Me', onPress: () => testCommand('help me') },
        { text: 'Read Screen', onPress: () => testCommand('read screen') },
        { text: 'Cancel', style: 'cancel', onPress: () => setIsListening(false) }
      ]
    );
  };

  const testCommand = (command) => {
    console.log('Testing voice command:', command);
    speechRecognition.processVoiceInput(command);
    setIsListening(false);
  };

  const stopListening = () => {
    speechRecognition.stopListening();
    setIsListening(false);
    ttsService.speak('Voice control stopped');
  };

  const readCurrentScreen = () => {
    const screenDescriptions = {
      'Home': 'You are on the home screen. You can view recent activities, quick actions, and navigate to other sections.',
      'Workout': 'You are on the workout screen. You can start a new workout, view workout history, or get AI recommendations.',
      'Progress': 'You are on the progress screen. You can view your fitness stats, achievements, and weekly progress.',
      'Chatbot': 'You are on the chatbot screen. You can ask questions, get nutrition advice, or chat with the AI assistant.',
      'Profile': 'You are on the profile screen. You can view and edit your personal information and settings.',
    };

    const description = screenDescriptions[screenName] || `You are on the ${screenName} screen.`;
    ttsService.speak(description);
  };

  const provideHelp = () => {
    const helpText = `Voice commands available: 
    Navigation - say "go to home", "open workouts", "show progress", "open chatbot", or "go back".
    Screen reading - say "read screen" or "read this".
    Emergency - say "emergency" or "call for help".
    Voice control - say "speak slower", "speak faster", or "stop speaking".
    Say "what can I say" for more commands.`;
    
    ttsService.speak(helpText);
  };

  const listAvailableCommands = () => {
    const commands = speechRecognition.getCommands();
    const commandList = commands.map(cmd => cmd.phrase).join(', ');
    ttsService.speak(`Available commands: ${commandList}`);
  };

  const handleEmergency = () => {
    Alert.alert(
      'Emergency',
      'Emergency mode activated. This would contact your emergency contacts and share your location.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm Emergency', style: 'destructive', onPress: () => {
          ttsService.speakAlert('Emergency contacts have been notified', true);
        }}
      ]
    );
  };

  const repeatLastMessage = () => {
    // In a real implementation, store the last TTS message
    ttsService.speak('This feature would repeat the last spoken message');
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    Animated.timing(pulseAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  if (!isAvailable) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.voiceButton, isListening && styles.listeningButton]}
        onPress={isListening ? stopListening : startListening}
        accessibilityLabel={isListening ? "Stop voice command" : "Start voice command"}
        accessibilityHint="Double tap to activate voice control"
      >
        <Animated.View style={[styles.buttonContent, { transform: [{ scale: pulseAnim }] }]}>
          <Ionicons 
            name={isListening ? "stop" : "mic"} 
            size={24} 
            color="#ffffff" 
          />
        </Animated.View>
      </TouchableOpacity>
      
      {isListening && (
        <View style={styles.listeningIndicator}>
          <Text style={styles.listeningText}>🎤 Listening...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 1000,
  },
  voiceButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f97316',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  listeningButton: {
    backgroundColor: '#ef4444',
  },
  buttonContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listeningIndicator: {
    marginTop: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  listeningText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});
