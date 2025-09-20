import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../context/AuthContext';

const SPORTS = [
  { label: 'Select Sport', value: '' },
  { label: 'Running', value: 'running' },
  { label: 'Swimming', value: 'swimming' },
  { label: 'Cycling', value: 'cycling' },
  { label: 'Basketball', value: 'basketball' },
  { label: 'Football', value: 'football' },
  { label: 'Tennis', value: 'tennis' },
  { label: 'Badminton', value: 'badminton' },
  { label: 'Cricket', value: 'cricket' },
  { label: 'Hockey', value: 'hockey' },
  { label: 'Volleyball', value: 'volleyball' },
  { label: 'Athletics', value: 'athletics' },
  { label: 'Powerlifting', value: 'powerlifting' },
  { label: 'Wrestling', value: 'wrestling' },
  { label: 'Boxing', value: 'boxing' },
  { label: 'Judo', value: 'judo' },
  { label: 'Archery', value: 'archery' },
  { label: 'Shooting', value: 'shooting' },
  { label: 'Table Tennis', value: 'table_tennis' },
  { label: 'Other', value: 'other' },
];

const DISABILITY_TYPES = [
  { label: 'No Disability', value: 'none' },
  { label: 'Visual Impairment', value: 'visual' },
  { label: 'Hearing Impairment', value: 'hearing' },
  { label: 'Physical Disability', value: 'physical' },
  { label: 'Intellectual Disability', value: 'intellectual' },
];

const EXPERIENCE_LEVELS = [
  { label: 'Select Experience Level', value: '' },
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' },
  { label: 'Professional', value: 'professional' },
];

export default function ProfileSetupScreen() {
  const [formData, setFormData] = useState({
    phone: '',
    dateOfBirth: new Date(),
    gender: '',
    disabilityType: 'none',
    disabilityDescription: '',
    primarySport: '',
    experienceLevel: '',
    height: '',
    weight: '',
    city: '',
    state: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const { completeProfile } = useAuth();

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      updateFormData('dateOfBirth', selectedDate);
    }
  };

  const handleCompleteProfile = async () => {
    // Basic validation
    if (!formData.primarySport) {
      Alert.alert('Error', 'Please select your primary sport');
      return;
    }

    if (!formData.experienceLevel) {
      Alert.alert('Error', 'Please select your experience level');
      return;
    }

    if (!formData.gender) {
      Alert.alert('Error', 'Please select your gender');
      return;
    }

    try {
      setLoading(true);

      const profileData = {
        phone: formData.phone.trim(),
        date_of_birth: formData.dateOfBirth.toISOString().split('T')[0],
        gender: formData.gender,
        disability_type: formData.disabilityType,
        disability_description: formData.disabilityDescription.trim(),
        primary_sport: formData.primarySport,
        experience_level: formData.experienceLevel,
        height_cm: formData.height ? parseInt(formData.height) : null,
        weight_kg: formData.weight ? parseFloat(formData.weight) : null,
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: 'India',
      };

      await completeProfile(profileData);
      
      // Navigation will be handled by the auth state change
    } catch (error) {
      console.error('Profile setup error:', error);
      Alert.alert('Error', 'Failed to complete profile setup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>
            Help us personalize your athletic journey
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Phone */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="call-outline" size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                placeholderTextColor="#9ca3af"
                value={formData.phone}
                onChangeText={(value) => updateFormData('phone', value)}
                keyboardType="phone-pad"
                editable={!loading}
              />
            </View>
          </View>

          {/* Date of Birth */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Date of Birth</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
              disabled={loading}
            >
              <Ionicons name="calendar-outline" size={20} color="#6b7280" style={styles.inputIcon} />
              <Text style={styles.dateText}>{formatDate(formData.dateOfBirth)}</Text>
              <Ionicons name="chevron-down" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={formData.dateOfBirth}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}

          {/* Gender */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Gender *</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={formData.gender}
                onValueChange={(value) => updateFormData('gender', value)}
                style={styles.picker}
                enabled={!loading}
              >
                <Picker.Item label="Select Gender" value="" />
                <Picker.Item label="Male" value="male" />
                <Picker.Item label="Female" value="female" />
                <Picker.Item label="Other" value="other" />
              </Picker>
            </View>
          </View>

          {/* Primary Sport */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Primary Sport *</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={formData.primarySport}
                onValueChange={(value) => updateFormData('primarySport', value)}
                style={styles.picker}
                enabled={!loading}
              >
                {SPORTS.map((sport) => (
                  <Picker.Item key={sport.value} label={sport.label} value={sport.value} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Experience Level */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Experience Level *</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={formData.experienceLevel}
                onValueChange={(value) => updateFormData('experienceLevel', value)}
                style={styles.picker}
                enabled={!loading}
              >
                {EXPERIENCE_LEVELS.map((level) => (
                  <Picker.Item key={level.value} label={level.label} value={level.value} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Disability Type */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Disability Type</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={formData.disabilityType}
                onValueChange={(value) => updateFormData('disabilityType', value)}
                style={styles.picker}
                enabled={!loading}
              >
                {DISABILITY_TYPES.map((type) => (
                  <Picker.Item key={type.value} label={type.label} value={type.value} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Disability Description */}
          {formData.disabilityType !== 'none' && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Disability Description</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Please describe your disability (optional)"
                placeholderTextColor="#9ca3af"
                value={formData.disabilityDescription}
                onChangeText={(value) => updateFormData('disabilityDescription', value)}
                multiline
                numberOfLines={3}
                editable={!loading}
              />
            </View>
          )}

          {/* Physical Stats */}
          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>Height (cm)</Text>
              <TextInput
                style={styles.smallInput}
                placeholder="170"
                placeholderTextColor="#9ca3af"
                value={formData.height}
                onChangeText={(value) => updateFormData('height', value)}
                keyboardType="numeric"
                editable={!loading}
              />
            </View>

            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput
                style={styles.smallInput}
                placeholder="70"
                placeholderTextColor="#9ca3af"
                value={formData.weight}
                onChangeText={(value) => updateFormData('weight', value)}
                keyboardType="numeric"
                editable={!loading}
              />
            </View>
          </View>

          {/* Location */}
          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>City</Text>
              <TextInput
                style={styles.smallInput}
                placeholder="Mumbai"
                placeholderTextColor="#9ca3af"
                value={formData.city}
                onChangeText={(value) => updateFormData('city', value)}
                editable={!loading}
              />
            </View>

            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>State</Text>
              <TextInput
                style={styles.smallInput}
                placeholder="Maharashtra"
                placeholderTextColor="#9ca3af"
                value={formData.state}
                onChangeText={(value) => updateFormData('state', value)}
                editable={!loading}
              />
            </View>
          </View>

          {/* Complete Button */}
          <TouchableOpacity
            style={[styles.completeButton, loading && styles.completeButtonDisabled]}
            onPress={handleCompleteProfile}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.completeButtonText}>Complete Profile</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
  },
  inputIcon: {
    marginLeft: 16,
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 16,
    color: '#111827',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    height: 52,
    paddingRight: 16,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
  },
  picker: {
    height: 52,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    padding: 16,
    fontSize: 16,
    color: '#111827',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  smallInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    height: 52,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
  },
  completeButton: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  completeButtonDisabled: {
    backgroundColor: '#fed7aa',
  },
  completeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
