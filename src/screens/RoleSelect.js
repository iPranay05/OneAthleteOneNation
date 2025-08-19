import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function RoleSelect({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>One Nation One Athlete</Text>
      <Text style={styles.subtitle}>Continue as</Text>

      <TouchableOpacity
        style={[styles.card, styles.athlete]}
        onPress={() => navigation.navigate('AthleteLogin')}
        accessibilityLabel="Continue as Athlete"
      >
        <Text style={styles.cardText}>Athlete</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.card, styles.coach]}
        onPress={() => navigation.navigate('CoachLogin')}
        accessibilityLabel="Continue as Coach"
      >
        <Text style={[styles.cardText, styles.coachText]}>Coach</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>Mock auth only. No backend calls.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
  },
  card: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginVertical: 8,
  },
  athlete: {
    backgroundColor: '#f97316',
  },
  coach: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#f97316',
  },
  cardText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  coachText: {
    color: '#f97316',
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    color: '#6b7280',
    fontSize: 12,
  },
});

