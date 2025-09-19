// Voice Assistant Setup Guide for First-Time Users
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ttsService from '../services/tts';
import continuousVoiceAssistant from '../services/continuousVoiceAssistant';

export default function VoiceAssistantSetup({ 
  visible, 
  onComplete, 
  navigation, 
  userProfile 
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const totalSteps = 4;

  useEffect(() => {
    if (visible && currentStep === 1) {
      // Welcome message
      setTimeout(async () => {
        await ttsService.speak('Welcome to the voice assistant setup. I will guide you through enabling voice control for easier app navigation.');
      }, 500);
    }
  }, [visible, currentStep]);

  const handleNextStep = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      await announceStep(currentStep + 1);
    } else {
      // Setup complete
      await completeSetup();
    }
  };

  const handlePreviousStep = async () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      await announceStep(currentStep - 1);
    }
  };

  const announceStep = async (step) => {
    const announcements = {
      1: 'Step 1: Welcome to voice assistant setup',
      2: 'Step 2: Microphone permission required',
      3: 'Step 3: Test your voice commands',
      4: 'Step 4: Setup complete'
    };
    
    await ttsService.speak(announcements[step]);
  };

  const requestPermissions = async () => {
    try {
      const success = await continuousVoiceAssistant.initialize(navigation, userProfile);
      setPermissionGranted(success);
      
      if (success) {
        await ttsService.speakSuccess('Microphone permission granted! Voice assistant is ready.');
        setTimeout(() => handleNextStep(), 2000);
      } else {
        await ttsService.speakError('Permission denied. Voice assistant will use text input mode.');
      }
    } catch (error) {
      console.error('Permission request error:', error);
      await ttsService.speakError('Failed to set up voice assistant.');
    }
  };

  const testVoiceCommand = async () => {
    setIsTestingVoice(true);
    await ttsService.speak('Say "hello assistant" to test your voice command.');
    
    // Start a brief test listening session
    setTimeout(async () => {
      setIsTestingVoice(false);
      await ttsService.speak('Voice test complete. You can now use voice commands throughout the app.');
      setTimeout(() => handleNextStep(), 1500);
    }, 5000);
  };

  const completeSetup = async () => {
    await ttsService.speak('Voice assistant setup is complete! I will now help you navigate the app continuously. Try saying "go to workout screen" or "help me".');
    
    setTimeout(() => {
      onComplete(permissionGranted);
    }, 3000);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Ionicons name="mic-circle" size={64} color="#3b82f6" />
            <Text style={styles.stepTitle}>Voice Assistant Setup</Text>
            <Text style={styles.stepDescription}>
              I'm your personal voice assistant designed to help you navigate this app easily. 
              I can understand commands like "go to workout screen" and provide real-time guidance.
            </Text>
            <Text style={styles.stepNote}>
              This setup will take about 30 seconds to complete.
            </Text>
          </View>
        );
      
      case 2:
        return (
          <View style={styles.stepContent}>
            <Ionicons name="lock-open" size={64} color="#f59e0b" />
            <Text style={styles.stepTitle}>Microphone Permission</Text>
            <Text style={styles.stepDescription}>
              I need access to your microphone to listen for voice commands. 
              This enables continuous assistance while you use the app.
            </Text>
            <TouchableOpacity 
              style={styles.permissionButton} 
              onPress={requestPermissions}
            >
              <Ionicons name="mic" size={20} color="#ffffff" />
              <Text style={styles.permissionButtonText}>Grant Permission</Text>
            </TouchableOpacity>
          </View>
        );
      
      case 3:
        return (
          <View style={styles.stepContent}>
            <Ionicons name="chatbubble-ellipses" size={64} color="#10b981" />
            <Text style={styles.stepTitle}>Test Voice Commands</Text>
            <Text style={styles.stepDescription}>
              Let's test your voice commands. I'll be listening for you to say something.
            </Text>
            <TouchableOpacity 
              style={[styles.testButton, isTestingVoice && styles.testingButton]} 
              onPress={testVoiceCommand}
              disabled={isTestingVoice}
            >
              <Ionicons name={isTestingVoice ? 'mic' : 'play'} size={20} color="#ffffff" />
              <Text style={styles.testButtonText}>
                {isTestingVoice ? 'Listening...' : 'Start Voice Test'}
              </Text>
            </TouchableOpacity>
          </View>
        );
      
      case 4:
        return (
          <View style={styles.stepContent}>
            <Ionicons name="checkmark-circle" size={64} color="#10b981" />
            <Text style={styles.stepTitle}>Setup Complete!</Text>
            <Text style={styles.stepDescription}>
              Your voice assistant is now active and listening. You can say:
            </Text>
            <View style={styles.commandsList}>
              <Text style={styles.commandItem}>• "Go to workout screen"</Text>
              <Text style={styles.commandItem}>• "Read my progress"</Text>
              <Text style={styles.commandItem}>• "Help me navigate"</Text>
              <Text style={styles.commandItem}>• "Read screen content"</Text>
            </View>
            <Text style={styles.stepNote}>
              I'm always listening and ready to help!
            </Text>
          </View>
        );
      
      default:
        return null;
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => {}}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.progress}>Step {currentStep} of {totalSteps}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(currentStep / totalSteps) * 100}%` }]} />
          </View>
        </View>

        <View style={styles.content}>
          {renderStepContent()}
        </View>

        <View style={styles.navigation}>
          {currentStep > 1 && (
            <TouchableOpacity style={styles.navButton} onPress={handlePreviousStep}>
              <Ionicons name="arrow-back" size={20} color="#6b7280" />
              <Text style={styles.navButtonText}>Previous</Text>
            </TouchableOpacity>
          )}
          
          <View style={{ flex: 1 }} />
          
          {currentStep < totalSteps ? (
            <TouchableOpacity 
              style={[styles.navButton, styles.nextButton]} 
              onPress={handleNextStep}
              disabled={currentStep === 2 && !permissionGranted}
            >
              <Text style={styles.nextButtonText}>Next</Text>
              <Ionicons name="arrow-forward" size={20} color="#ffffff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.navButton, styles.completeButton]} onPress={completeSetup}>
              <Text style={styles.completeButtonText}>Get Started</Text>
              <Ionicons name="checkmark" size={20} color="#ffffff" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#f8fafc',
  },
  progress: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  stepContent: {
    alignItems: 'center',
    textAlign: 'center',
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  stepNote: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  permissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  permissionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  testingButton: {
    backgroundColor: '#ef4444',
  },
  testButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  commandsList: {
    alignItems: 'flex-start',
    marginTop: 16,
    marginBottom: 16,
  },
  commandItem: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  nextButton: {
    backgroundColor: '#3b82f6',
  },
  completeButton: {
    backgroundColor: '#10b981',
  },
  navButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '500',
    marginRight: 4,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 4,
  },
  completeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 4,
  },
});