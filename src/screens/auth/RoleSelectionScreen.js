import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services/supabaseConfig';

export default function RoleSelectionScreen() {
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);

  const { updateProfile, user, refreshProfile, profile } = useAuth();

  // Debug: Log when profile changes
  React.useEffect(() => {
    console.log('RoleSelectionScreen - Profile changed:', profile);
  }, [profile]);

  const roles = [
    {
      id: 'athlete',
      title: 'Athlete',
      description: 'I am an athlete looking for training, coaching, and opportunities',
      icon: 'fitness-outline',
      color: '#f97316',
    },
    {
      id: 'coach',
      title: 'Coach',
      description: 'I am a coach looking to train and mentor athletes',
      icon: 'school-outline',
      color: '#3b82f6',
    },
  ];

  const handleRoleSelection = async () => {
    if (!selectedRole) {
      Alert.alert('Error', 'Please select your role');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'No authenticated user found. Please try logging in again.');
      return;
    }

    try {
      setLoading(true);
      console.log('Updating role to:', selectedRole, 'for user:', user.id);
      
      // Try using the auth context first
      let updatedProfile;
      try {
        updatedProfile = await updateProfile({ role: selectedRole });
        console.log('Profile updated via auth context:', updatedProfile);
      } catch (contextError) {
        console.log('Auth context failed, trying direct service:', contextError);
        
        // Fallback to direct profile service
        updatedProfile = await profileService.updateProfile(user.id, { role: selectedRole });
        console.log('Profile updated via direct service:', updatedProfile);
      }
      
      // Force refresh the profile in auth context
      if (refreshProfile) {
        console.log('Refreshing profile...');
        await refreshProfile();
      }
      
      console.log('Role selection completed successfully. Navigation should update automatically.');
      
      // Navigation will happen automatically due to auth state change
      // No need for alert - let it flow naturally
      
    } catch (error) {
      console.error('Role selection error:', error);
      Alert.alert(
        'Error', 
        `Failed to update role: ${error.message || 'Unknown error'}. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  const renderRoleOption = (role) => (
    <TouchableOpacity
      key={role.id}
      style={[
        styles.roleCard,
        selectedRole === role.id && { ...styles.selectedCard, borderColor: role.color }
      ]}
      onPress={() => setSelectedRole(role.id)}
      disabled={loading}
    >
      <View style={[styles.iconContainer, { backgroundColor: role.color + '20' }]}>
        <Ionicons name={role.icon} size={32} color={role.color} />
      </View>
      
      <View style={styles.roleContent}>
        <Text style={styles.roleTitle}>{role.title}</Text>
        <Text style={styles.roleDescription}>{role.description}</Text>
      </View>
      
      <View style={styles.radioContainer}>
        <View style={[
          styles.radio,
          selectedRole === role.id && { ...styles.radioSelected, borderColor: role.color }
        ]}>
          {selectedRole === role.id && (
            <View style={[styles.radioInner, { backgroundColor: role.color }]} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Role</Text>
          <Text style={styles.subtitle}>
            Help us personalize your experience by selecting your primary role
          </Text>
        </View>

        {/* Role Options */}
        <View style={styles.rolesContainer}>
          {roles.map(renderRoleOption)}
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedRole && styles.continueButtonDisabled,
            loading && styles.continueButtonDisabled
          ]}
          onPress={handleRoleSelection}
          disabled={!selectedRole || loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.continueButtonText}>Continue</Text>
          )}
        </TouchableOpacity>

        {/* Info Text */}
        <Text style={styles.infoText}>
          You can always change your role later in your profile settings
        </Text>
      </View>
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
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  rolesContainer: {
    flex: 1,
    gap: 16,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedCard: {
    borderWidth: 2,
    backgroundColor: '#fefefe',
    shadowOpacity: 0.1,
    elevation: 4,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  roleContent: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  radioContainer: {
    marginLeft: 12,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderWidth: 2,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  continueButton: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  continueButtonDisabled: {
    backgroundColor: '#fed7aa',
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 16,
  },
});
