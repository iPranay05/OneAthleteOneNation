import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useUser } from '../context/UserContext';

export default function AthleteLogin({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDisabilitySelection, setShowDisabilitySelection] = useState(false);
  const [selectedDisability, setSelectedDisability] = useState('');
  const { setBlindUserProfile, updateUserProfile } = useUser();

  const mockAuth = (action) => {
    if (!email || !password) {
      Alert.alert('Missing fields', 'Please enter email and password.');
      return;
    }
    
    if (action === 'Login') {
      setShowDisabilitySelection(true);
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', `${action} as Athlete successful (mock).`);
      setShowDisabilitySelection(true);
    }, 800);
  };

  const handleDisabilitySelection = (disabilityType) => {
    setSelectedDisability(disabilityType);
    
    if (disabilityType === 'blind') {
      setBlindUserProfile(email.split('@')[0], email);
    }
    
    // Update user profile with disability information
    const updatedProfile = {
      id: Date.now(),
      name: email.split('@')[0],
      email,
      disabilityType: disabilityType,
      severity: 'moderate',
      assistiveAids: [],
      accessibilityPreferences: {
        voiceAssistant: disabilityType === 'blind' || disabilityType === 'vision',
        largeText: disabilityType === 'vision' || disabilityType === 'cognitive',
        highContrast: disabilityType === 'vision',
        screenReader: disabilityType === 'blind',
        vibrationAlerts: disabilityType === 'deaf',
        autoActivateVoice: disabilityType === 'blind',
      }
    };
    updateUserProfile(updatedProfile);
    
    setTimeout(() => {
      navigation.replace('AthleteHome');
    }, 500);
  };

  const disabilityOptions = [
    { key: 'blind', label: 'Blind/Visually Impaired', description: 'I have vision difficulties' },
    { key: 'deaf', label: 'Deaf/Hard of Hearing', description: 'I have hearing difficulties' },
    { key: 'mobility', label: 'Mobility Impairment', description: 'I have physical/mobility challenges' },
    { key: 'cognitive', label: 'Cognitive Disability', description: 'I have learning or cognitive challenges' },
    { key: 'speech', label: 'Speech Impairment', description: 'I have speech or communication challenges' },
    { key: 'none', label: 'No Disability', description: 'I do not have a disability' },
  ];

  if (showDisabilitySelection) {
    return (
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Accessibility Profile</Text>
        <Text style={styles.subtitle}>
          To provide the best experience, please let us know about any accessibility needs:
        </Text>

        {disabilityOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[styles.disabilityOption, selectedDisability === option.key && styles.selectedOption]}
            onPress={() => handleDisabilitySelection(option.key)}
          >
            <Text style={styles.optionLabel}>{option.label}</Text>
            <Text style={styles.optionDescription}>{option.description}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Athlete Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#9ca3af"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#9ca3af"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={[styles.button, styles.login]} onPress={() => mockAuth('Login')} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.signup]} onPress={() => mockAuth('Sign up')} disabled={loading}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.replace('CoachLogin')}>
        <Text style={styles.link}>Are you a Coach? Go to Coach Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.popToTop()}>
        <Text style={styles.back}>Back to Role Select</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 24,
    justifyContent: 'center',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  contentContainer: {
    padding: 24,
    paddingTop: 60,
  },
  title: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    color: '#6b7280',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRadius: 12,
    color: '#111827',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  login: {
    backgroundColor: '#f97316',
  },
  signup: {
    backgroundColor: '#fb923c',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  link: {
    color: '#f97316',
    textAlign: 'center',
    marginTop: 16,
  },
  back: {
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    fontSize: 12,
  },
  disabilityOption: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  selectedOption: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
    borderWidth: 2,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 18,
  },
});

