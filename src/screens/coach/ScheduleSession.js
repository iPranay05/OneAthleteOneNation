import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function ScheduleSession({ route, navigation }) {
  const { athlete } = route.params;
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [sessionType, setSessionType] = useState('');
  const [duration, setDuration] = useState('60');
  const [notes, setNotes] = useState('');

  const sessionTypes = [
    { id: 'training', name: 'Training Session', icon: 'fitness', color: '#f97316' },
    { id: 'assessment', name: 'Performance Assessment', icon: 'analytics', color: '#8b5cf6' },
    { id: 'consultation', name: 'Consultation', icon: 'chatbubble', color: '#10b981' },
    { id: 'recovery', name: 'Recovery Session', icon: 'leaf', color: '#06b6d4' }
  ];

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
    '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'
  ];

  const durations = ['30', '45', '60', '90', '120'];

  const scheduleSession = () => {
    if (!selectedDate || !selectedTime || !sessionType) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const sessionTypeName = sessionTypes.find(type => type.id === sessionType)?.name;
    
    Alert.alert(
      'Session Scheduled',
      `${sessionTypeName} with ${athlete.name} has been scheduled for ${selectedDate} at ${selectedTime}. Both you and the athlete will receive a confirmation.`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.athleteInfo}>
          <Text style={styles.title}>Schedule Session</Text>
          <Text style={styles.subtitle}>With {athlete.name}</Text>
        </View>
        <Text style={styles.athleteAvatar}>{athlete.avatar}</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Session Type */}
        <Text style={styles.sectionTitle}>Session Type *</Text>
        <View style={styles.sessionTypeGrid}>
          {sessionTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.sessionTypeCard,
                sessionType === type.id && styles.selectedSessionType
              ]}
              onPress={() => setSessionType(type.id)}
            >
              <Ionicons 
                name={type.icon} 
                size={24} 
                color={sessionType === type.id ? '#ffffff' : type.color} 
              />
              <Text style={[
                styles.sessionTypeName,
                sessionType === type.id && styles.selectedSessionTypeName
              ]}>
                {type.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Date Selection */}
        <Text style={styles.sectionTitle}>Date *</Text>
        <TouchableOpacity style={styles.dateInput}>
          <Ionicons name="calendar" size={20} color="#6b7280" />
          <TextInput
            style={styles.dateText}
            placeholder="Select date (YYYY-MM-DD)"
            placeholderTextColor="#9ca3af"
            value={selectedDate}
            onChangeText={setSelectedDate}
          />
        </TouchableOpacity>

        {/* Time Selection */}
        <Text style={styles.sectionTitle}>Time *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeSlots}>
          {timeSlots.map((time) => (
            <TouchableOpacity
              key={time}
              style={[
                styles.timeSlot,
                selectedTime === time && styles.selectedTimeSlot
              ]}
              onPress={() => setSelectedTime(time)}
            >
              <Text style={[
                styles.timeText,
                selectedTime === time && styles.selectedTimeText
              ]}>
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Duration */}
        <Text style={styles.sectionTitle}>Duration (minutes)</Text>
        <View style={styles.durationContainer}>
          {durations.map((dur) => (
            <TouchableOpacity
              key={dur}
              style={[
                styles.durationButton,
                duration === dur && styles.selectedDuration
              ]}
              onPress={() => setDuration(dur)}
            >
              <Text style={[
                styles.durationText,
                duration === dur && styles.selectedDurationText
              ]}>
                {dur}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Notes */}
        <Text style={styles.sectionTitle}>Session Notes (Optional)</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="Add any specific goals, requirements, or notes for this session..."
          placeholderTextColor="#9ca3af"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
        />

        {/* Schedule Button */}
        <TouchableOpacity style={styles.scheduleButton} onPress={scheduleSession}>
          <Ionicons name="calendar-outline" size={20} color="#ffffff" />
          <Text style={styles.scheduleButtonText}>Schedule Session</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
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
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  athleteInfo: {
    flex: 1,
    marginLeft: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  athleteAvatar: {
    fontSize: 32,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    marginTop: 8,
  },
  sessionTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sessionTypeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  selectedSessionType: {
    backgroundColor: '#f97316',
    borderColor: '#f97316',
  },
  sessionTypeName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    marginTop: 8,
    textAlign: 'center',
  },
  selectedSessionTypeName: {
    color: '#ffffff',
  },
  dateInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 20,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
  },
  timeSlots: {
    marginBottom: 20,
  },
  timeSlot: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  selectedTimeSlot: {
    backgroundColor: '#f97316',
    borderColor: '#f97316',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  selectedTimeText: {
    color: '#ffffff',
  },
  durationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  durationButton: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flex: 1,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  selectedDuration: {
    backgroundColor: '#f97316',
    borderColor: '#f97316',
  },
  durationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  selectedDurationText: {
    color: '#ffffff',
  },
  notesInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  scheduleButton: {
    backgroundColor: '#f97316',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  scheduleButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
