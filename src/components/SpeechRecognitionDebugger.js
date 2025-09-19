import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';

export default function SpeechRecognitionDebugger() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState('Ready');
  const [hasPermission, setHasPermission] = useState(false);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    checkPermissions();
  }, []);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `${timestamp}: ${message}`]);
  };

  const checkPermissions = async () => {
    setHasPermission(false);
    addLog('Using text input mode - native speech recognition not available in Expo Go');
  };

  const requestPermissions = async () => {
    addLog('Text input mode - no permissions needed');
    return false;
  };

  const startListening = async () => {
    if (isListening) return;

    // Always use text input
    Alert.prompt(
      '🎤 Voice Assistant Debugger',
      'Type your test command:\n\nSuggestions:\n• show my workouts\n• read my progress\n• go to profile\n• open chatbot',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async (text) => {
            if (text && text.trim()) {
              setTranscript(text.trim());
              addLog(`Text input: "${text.trim()}"`);
              setStatus('Processing...');
              
              // Test TTS with the input
              await Speech.speak(`You typed: ${text.trim()}`, {
                language: 'en-US',
                rate: 0.9,
              });
              
              setStatus('Ready');
            }
          }
        }
      ],
      'plain-text',
      'Type your command here...'
    );
  };

  const testTTS = async () => {
    const testMessage = 'Hello! This is a test of the text to speech functionality.';
    addLog('Testing TTS');
    await Speech.speak(testMessage, {
      language: 'en-US',
      rate: 0.9,
    });
  };

  const clearLogs = () => {
    setLogs([]);
    setTranscript('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Speech Recognition Debugger</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Status: </Text>
        <Text style={[styles.statusText, { color: isListening ? '#ef4444' : '#10b981' }]}>
          {status}
        </Text>
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Mode: </Text>
        <Text style={[styles.statusText, { color: '#f59e0b' }]}>
          Text Input (Expo Go)
        </Text>
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Platform: </Text>
        <Text style={[styles.statusText, { color: Platform.OS !== 'web' ? '#10b981' : '#f59e0b' }]}>
          {Platform.OS}
        </Text>
      </View>

      {transcript ? (
        <View style={styles.transcriptContainer}>
          <Text style={styles.transcriptLabel}>Last Transcript:</Text>
          <Text style={styles.transcriptText}>"{transcript}"</Text>
        </View>
      ) : null}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, isListening && styles.listeningButton]}
          onPress={startListening}
          disabled={isListening}
        >
          <Ionicons 
            name={isListening ? 'mic' : 'mic-outline'} 
            size={24} 
            color="#ffffff" 
          />
          <Text style={styles.buttonText}>
            {isListening ? 'Listening...' : 'Start Listening'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testTTS}>
          <Ionicons name="volume-high-outline" size={24} color="#ffffff" />
          <Text style={styles.buttonText}>Test TTS</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={requestPermissions}>
          <Ionicons name="settings-outline" size={24} color="#ffffff" />
          <Text style={styles.buttonText}>Request Permission</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.logsContainer}>
        <View style={styles.logsHeader}>
          <Text style={styles.logsTitle}>Debug Logs</Text>
          <TouchableOpacity onPress={clearLogs} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.logsScroll}>
          {logs.map((log, index) => (
            <Text key={index} style={styles.logText}>{log}</Text>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  transcriptContainer: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    marginVertical: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  transcriptLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 5,
  },
  transcriptText: {
    fontSize: 16,
    color: '#111827',
    fontStyle: 'italic',
  },
  buttonContainer: {
    marginVertical: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f97316',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  listeningButton: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  logsContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 15,
  },
  logsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  logsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  clearButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  clearButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  logsScroll: {
    maxHeight: 200,
  },
  logText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
    fontFamily: 'monospace',
  },
});
