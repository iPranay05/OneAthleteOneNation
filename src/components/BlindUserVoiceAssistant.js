import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ttsService from '../services/tts';
import continuousVoiceAssistant from '../services/continuousVoiceAssistant';

// Optional haptics import with fallback
let Haptics;
let hapticsAvailable = false;
try {
  Haptics = require('expo-haptics');
  // Test if haptics methods are available
  if (Haptics && typeof Haptics.selectionAsync === 'function') {
    hapticsAvailable = true;
    console.log('✅ Haptics available in BlindUserVoiceAssistant');
  } else {
    console.log('⚠️ Haptics methods unavailable in BlindUserVoiceAssistant');
    Haptics = null;
  }
} catch (error) {
  console.log('📱 Haptics not available in BlindUserVoiceAssistant (expected in Expo Go):', error.message);
  Haptics = null;
}

export default function BlindUserVoiceAssistant({ 
  navigation, 
  screenName, 
  userProfile, 
  screenData = {} 
}) {
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('unknown');

  useEffect(() => {
    const initializeAssistant = async () => {
      try {
        // Initialize the continuous voice assistant
        const success = await continuousVoiceAssistant.initialize(navigation, userProfile);
        
        if (success) {
          setIsInitialized(true);
          setIsActive(true);
          setPermissionStatus('granted');
          
          // Update context for current screen
          continuousVoiceAssistant.updateContext(navigation, screenName, userProfile, screenData);
          
        } else {
          setPermissionStatus('denied');
          setIsInitialized(true);
          
          // Show permission dialog
          setTimeout(() => {
            showPermissionDialog();
          }, 1000);
        }
        
      } catch (error) {
        console.error('Voice Assistant initialization error:', error);
        setIsInitialized(true);
        setPermissionStatus('error');
      }
    };
    
    initializeAssistant();
    
    return () => {
      continuousVoiceAssistant.destroy();
    };
  }, []);

  // Update context when screen/data changes
  useEffect(() => {
    if (isInitialized && isActive) {
      continuousVoiceAssistant.updateContext(navigation, screenName, userProfile, screenData);
    }
  }, [screenName, screenData, isInitialized, isActive]);

  // Monitor listening status
  useEffect(() => {
    const checkStatus = () => {
      if (isActive) {
        const status = continuousVoiceAssistant.getStatus();
        setIsListening(status.isListening);
      }
    };
    
    const interval = setInterval(checkStatus, 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  const showPermissionDialog = () => {
    Alert.alert(
      '🎤 Voice Assistant Setup',
      'The voice assistant needs microphone permission to help you navigate the app. This will enable continuous voice commands like "go to workout screen" and real-time assistance.',
      [
        {
          text: 'Not Now',
          style: 'cancel',
          onPress: () => {
            ttsService.speak('Voice assistant disabled. You can enable it later from the controls.');
          }
        },
        {
          text: 'Enable',
          onPress: async () => {
            const success = await continuousVoiceAssistant.initialize(navigation, userProfile);
            if (success) {
              setIsActive(true);
              setPermissionStatus('granted');
            }
          }
        }
      ]
    );
  };

  const toggleAssistant = async () => {
    try {
      if (isActive) {
        await continuousVoiceAssistant.stopContinuousMode();
        setIsActive(false);
        await ttsService.speak('Voice assistant paused');
      } else {
        if (permissionStatus === 'granted') {
          // Try to start continuous mode first
          const continuousStarted = await continuousVoiceAssistant.startContinuousMode();
          
          if (continuousStarted) {
            setIsActive(true);
            await ttsService.speak('Voice assistant activated. I\'m listening for your commands.');
          } else {
            // Fall back to manual listening mode
            await ttsService.speak('Continuous mode unavailable. Tap the button to speak commands.');
            setIsActive(true); // Still mark as active for manual mode
          }
        } else {
          showPermissionDialog();
        }
      }
    } catch (error) {
      console.error('Toggle assistant error:', error);
      await ttsService.speakError('Failed to toggle voice assistant');
    }
  };

  // Manual voice input handler
  const handleManualVoiceInput = async () => {
    try {
      console.log('🔍 DEBUG: handleManualVoiceInput called');
      
      // Safe haptics usage
      if (hapticsAvailable && Haptics && typeof Haptics.selectionAsync === 'function') {
        try {
          await Haptics.selectionAsync();
          console.log('🔍 DEBUG: Haptics selection feedback provided');
        } catch (hapticsError) {
          console.log('📱 Haptics failed (expected in Expo Go):', hapticsError.message);
        }
      } else {
        console.log('📱 DEBUG: Haptics not available for manual voice input');
      }
      
      console.log('🔍 DEBUG: Starting manual listening...');
      const success = await continuousVoiceAssistant.startManualListening();
      
      console.log('🔍 DEBUG: Manual listening result:', success);
      
      if (!success) {
        console.log('❌ DEBUG: Manual listening failed');
        await ttsService.speakError('Voice input failed. Please try again.');
      } else {
        console.log('✅ DEBUG: Manual listening started successfully');
      }
    } catch (error) {
      console.error('❌ Manual voice input error:', error);
      console.error('🔍 DEBUG: Manual voice input error stack:', error.stack);
      await ttsService.speakError('Voice input unavailable.');
    }
  };

  const emergencyStop = async () => {
    await continuousVoiceAssistant.emergencyStop();
    setIsActive(false);
    setIsListening(false);
  };

  const readCurrentScreen = async () => {
    try {
      await ttsService.readScreenData(screenData, screenName);
    } catch (error) {
      console.error('Error reading screen:', error);
      await ttsService.speakError('Unable to read screen content');
    }
  };

  const provideQuickHelp = async () => {
    const helpMessage = `You are on the ${screenName} screen. Try saying: "go to workout screen", "read my progress", "open chatbot", or "read screen" for current content.`;
    await ttsService.speakInstruction(helpMessage);
  };

  // Get appropriate button icon based on status
  const getButtonIcon = () => {
    if (!isInitialized) return 'hourglass';
    if (permissionStatus === 'denied') return 'mic-off';
    if (!isActive) return 'mic-outline';
    if (isListening) return 'mic';
    return 'mic-circle';
  };

  // Get button color based on status
  const getButtonColor = () => {
    if (!isInitialized) return '#9ca3af';
    if (permissionStatus === 'denied') return '#ef4444';
    if (!isActive) return '#f97316';
    if (isListening) return '#10b981';
    return '#3b82f6';
  };

  const handleNavigationCommand = async (command) => {
    const lowerCommand = command.toLowerCase();
    let navigationHandled = false;
    let navigationMessage = '';
    
    if (lowerCommand.includes('home') || lowerCommand.includes('profile')) {
      navigation.navigate('Profile');
      navigationMessage = 'Navigating to your profile';
      navigationHandled = true;
    } else if (lowerCommand.includes('workout') || lowerCommand.includes('exercise')) {
      navigation.navigate('Workout');
      navigationMessage = 'Opening workout section';
      navigationHandled = true;
    } else if (lowerCommand.includes('progress') || lowerCommand.includes('stats')) {
      navigation.navigate('Progress');
      navigationMessage = 'Opening progress tracking';
      navigationHandled = true;
    } else if (lowerCommand.includes('chat') || lowerCommand.includes('ai') || lowerCommand.includes('bot')) {
      navigation.navigate('Chatbot');
      navigationMessage = 'Opening AI chatbot';
      navigationHandled = true;
    } else if (lowerCommand.includes('marketplace') || lowerCommand.includes('equipment')) {
      navigation.navigate('EquipmentMarketplace');
      navigationMessage = 'Opening equipment marketplace';
      navigationHandled = true;
    } else if (lowerCommand.includes('knowledge') || lowerCommand.includes('learn')) {
      navigation.navigate('KnowledgeHub');
      navigationMessage = 'Opening knowledge hub';
      navigationHandled = true;
    } else if (lowerCommand.includes('funding') || lowerCommand.includes('money')) {
      navigation.navigate('FundingHub');
      navigationMessage = 'Opening funding opportunities';
      navigationHandled = true;
    } else if (lowerCommand.includes('back') || lowerCommand.includes('previous')) {
      navigation.goBack();
      navigationMessage = 'Going back to previous screen';
      navigationHandled = true;
    }
    
    // Provide immediate audio feedback for navigation
    if (navigationHandled) {
      await ttsService.speakNavigation(navigationMessage);
      await voiceAssistant.vibrate('success');
    }
    
    return navigationHandled;
  };

  const readScreenContent = async () => {
    try {
      await ttsService.readScreenData(screenData, screenName);
      await voiceAssistant.vibrate('success');
    } catch (error) {
      console.error('Error reading screen content:', error);
      await ttsService.speakError('Unable to read screen content');
    }
  };

  const handleEmergencyHelp = async () => {
    const helpMessage = `You are on the ${screenName} screen. Available voice commands include: go to workouts, show progress, open chatbot, read screen content, or say help for more options.`;
    await ttsService.speakInstruction(helpMessage);
  };

  return (
    <View style={styles.container}>
      {/* Continuous Voice Assistant Button */}
      <TouchableOpacity
        style={[
          styles.voiceButton,
          {
            backgroundColor: getButtonColor(),
          },
          isListening && styles.listeningAnimation,
          !isInitialized && styles.disabledButton
        ]}
        onPress={async () => {
          // If assistant is active but not in continuous mode, use manual input
          if (isActive && !continuousVoiceAssistant.getStatus().isListening) {
            await handleManualVoiceInput();
          } else {
            await toggleAssistant();
          }
        }}
        onLongPress={async () => {
          console.log('🔍 DEBUG: Long press detected');
          
          // Safe haptics usage
          if (hapticsAvailable && Haptics && typeof Haptics.selectionAsync === 'function') {
            try {
              await Haptics.selectionAsync();
              console.log('🔍 DEBUG: Long press haptics provided');
            } catch (hapticsError) {
              console.log('📱 Long press haptics failed (expected in Expo Go):', hapticsError.message);
            }
          }
          
          setShowControls(true);
        }}
        disabled={!isInitialized}
        accessible={true}
        accessibilityLabel={
          !isInitialized ? 'Voice assistant initializing' :
          permissionStatus === 'denied' ? 'Voice assistant needs permission' :
          !isActive ? 'Start continuous voice assistant' :
          isListening ? 'Voice assistant listening' :
          'Voice assistant active'
        }
        accessibilityHint="Tap to toggle continuous voice assistance, long press for options"
        accessibilityRole="button"
      >
        <Ionicons 
          name={getButtonIcon()}
          size={24} 
          color="#ffffff" 
        />
        
        {/* Active indicator */}
        {isActive && (
          <View style={styles.activeIndicator}>
            <View style={[styles.pulseDot, isListening && styles.pulsing]} />
          </View>
        )}
        
        {/* Permission denied indicator */}
        {permissionStatus === 'denied' && (
          <View style={styles.warningIndicator}>
            <Ionicons name="warning" size={12} color="#ffffff" />
          </View>
        )}
      </TouchableOpacity>

      {/* Status text for screen readers */}
      <Text style={styles.statusText} accessible={false}>
        {isActive ? (isListening ? 'Listening...' : 'Active') : 'Tap to start'}
      </Text>

      {/* Enhanced Voice Controls Modal */}
      <Modal
        visible={showControls}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowControls(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.controlPanel}>
            <Text style={styles.controlTitle}>Continuous Voice Assistant</Text>
            <Text style={styles.controlSubtitle}>
              Status: {isActive ? 'Active & Listening' : 'Paused'}
            </Text>
            
            <TouchableOpacity
              style={[styles.controlButton, styles.primaryButton]}
              onPress={() => {
                setShowControls(false);
                toggleAssistant();
              }}
            >
              <Ionicons 
                name={isActive ? 'pause-circle' : 'play-circle'} 
                size={20} 
                color="#ffffff" 
              />
              <Text style={[styles.controlButtonText, { color: '#ffffff' }]}>
                {isActive ? 'Pause Assistant' : 'Start Assistant'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => {
                setShowControls(false);
                handleManualVoiceInput();
              }}
            >
              <Ionicons name="mic" size={20} color="#10b981" />
              <Text style={styles.controlButtonText}>Manual Voice Input</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => {
                setShowControls(false);
                provideQuickHelp();
              }}
            >
              <Ionicons name="help-circle-outline" size={20} color="#f97316" />
              <Text style={styles.controlButtonText}>Quick Help</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => {
                setShowControls(false);
                readCurrentScreen();
              }}
            >
              <Ionicons name="reader-outline" size={20} color="#f97316" />
              <Text style={styles.controlButtonText}>Read Screen</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, styles.emergencyButton]}
              onPress={() => {
                setShowControls(false);
                emergencyStop();
              }}
            >
              <Ionicons name="stop-circle" size={20} color="#ef4444" />
              <Text style={[styles.controlButtonText, { color: '#ef4444' }]}>Emergency Stop</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, styles.closeButton]}
              onPress={() => setShowControls(false)}
            >
              <Ionicons name="close" size={20} color="#6b7280" />
              <Text style={[styles.controlButtonText, { color: '#6b7280' }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    zIndex: 1000,
    alignItems: 'center',
  },
  voiceButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    position: 'relative',
  },
  listeningAnimation: {
    transform: [{ scale: 1.1 }],
  },
  disabledButton: {
    opacity: 0.6,
  },
  activeIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  pulsing: {
    // Animation would be added with Animated API
  },
  warningIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    marginTop: 6,
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlPanel: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    minWidth: 320,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  controlTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  controlSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#f8fafc',
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
  },
  emergencyButton: {
    backgroundColor: '#fef2f2',
  },
  closeButton: {
    backgroundColor: '#f9fafb',
    marginTop: 8,
  },
  controlButtonText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
});
