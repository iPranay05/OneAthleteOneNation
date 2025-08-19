import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';

export default function CoachLogin({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const mockAuth = (action) => {
    if (!email || !password) {
      Alert.alert('Missing fields', 'Please enter email and password.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (action === 'Login') {
        navigation.navigate('CoachHome');
      } else {
        Alert.alert('Success', `${action} as Coach successful (mock).`);
        navigation.popToTop();
      }
    }, 800);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Coach Login</Text>

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

      <TouchableOpacity onPress={() => navigation.replace('AthleteLogin')}>
        <Text style={styles.link}>Are you an Athlete? Go to Athlete Login</Text>
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
  title: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
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
});

