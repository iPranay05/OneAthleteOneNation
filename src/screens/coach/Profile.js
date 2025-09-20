import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Switch } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

export default function CoachProfile() {
  const { user, profile: userProfile, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);

  const [profile, setProfile] = useState({
    name: 'Coach Sarah Williams',
    email: 'sarah.williams@coach.com',
    phone: '+1 (555) 123-4567',
    specialization: 'Paralympic Sports',
    experience: '8 years',
    certifications: ['ACSM Certified', 'Paralympic Coach Level 3', 'Adaptive Sports Specialist'],
    bio: 'Passionate about helping disabled athletes reach their full potential through personalized training and adaptive techniques.',
    location: 'San Francisco, CA'
  });

  const [editedProfile, setEditedProfile] = useState({ ...profile });

  const handleSave = () => {
    setProfile({ ...editedProfile });
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleCancel = () => {
    setEditedProfile({ ...profile });
    setIsEditing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await signOut();
              // Navigation will be handled by the auth state change
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>SW</Text>
          </View>
          <TouchableOpacity style={styles.editAvatarBtn}>
            <Ionicons name="camera" size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.name}>
            {userProfile?.full_name || user?.email || 'Coach'}
          </Text>
          <Text style={styles.specialization}>
            {userProfile?.primary_sport ? 
              userProfile.primary_sport.charAt(0).toUpperCase() + userProfile.primary_sport.slice(1).replace('_', ' ') + ' Coach'
              : 'Coach'
            }
          </Text>
          <Text style={styles.experience}>
            {userProfile?.experience_level ? 
              userProfile.experience_level.charAt(0).toUpperCase() + userProfile.experience_level.slice(1) + ' Level'
              : 'Professional Coach'
            }
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.editBtn}
          onPress={() => setIsEditing(!isEditing)}
        >
          <Ionicons name={isEditing ? "close" : "create"} size={20} color="#f97316" />
        </TouchableOpacity>
      </View>

      {/* Profile Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Information</Text>
        <View style={styles.card}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Full Name</Text>
            {isEditing ? (
              <TextInput
                style={styles.infoInput}
                value={editedProfile.name}
                onChangeText={(text) => setEditedProfile({...editedProfile, name: text})}
              />
            ) : (
              <Text style={styles.infoValue}>{profile.name}</Text>
            )}
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Email</Text>
            {isEditing ? (
              <TextInput
                style={styles.infoInput}
                value={editedProfile.email}
                onChangeText={(text) => setEditedProfile({...editedProfile, email: text})}
                keyboardType="email-address"
              />
            ) : (
              <Text style={styles.infoValue}>{user?.email || profile.email}</Text>
            )}
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Phone</Text>
            {isEditing ? (
              <TextInput
                style={styles.infoInput}
                value={editedProfile.phone}
                onChangeText={(text) => setEditedProfile({...editedProfile, phone: text})}
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.infoValue}>{profile.phone}</Text>
            )}
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Location</Text>
            {isEditing ? (
              <TextInput
                style={styles.infoInput}
                value={editedProfile.location}
                onChangeText={(text) => setEditedProfile({...editedProfile, location: text})}
              />
            ) : (
              <Text style={styles.infoValue}>{profile.location}</Text>
            )}
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Bio</Text>
            {isEditing ? (
              <TextInput
                style={[styles.infoInput, styles.bioInput]}
                value={editedProfile.bio}
                onChangeText={(text) => setEditedProfile({...editedProfile, bio: text})}
                multiline
                numberOfLines={3}
              />
            ) : (
              <Text style={styles.infoValue}>{profile.bio}</Text>
            )}
          </View>
        </View>

        {isEditing && (
          <View style={styles.editActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Certifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Certifications</Text>
        <View style={styles.card}>
          {profile.certifications.map((cert, index) => (
            <View key={index} style={styles.certificationItem}>
              <Ionicons name="ribbon" size={20} color="#f97316" />
              <Text style={styles.certificationText}>{cert}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Impact</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Active Athletes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>156</Text>
            <Text style={styles.statLabel}>Workouts Created</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>85%</Text>
            <Text style={styles.statLabel}>Success Rate</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>4.9</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.card}>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Push Notifications</Text>
              <Text style={styles.settingDescription}>Receive notifications about athlete activity</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#e5e7eb', true: '#fed7aa' }}
              thumbColor={notificationsEnabled ? '#f97316' : '#9ca3af'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Email Notifications</Text>
              <Text style={styles.settingDescription}>Get email updates about your athletes</Text>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ false: '#e5e7eb', true: '#fed7aa' }}
              thumbColor={emailNotifications ? '#f97316' : '#9ca3af'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Weekly Reports</Text>
              <Text style={styles.settingDescription}>Receive weekly performance summaries</Text>
            </View>
            <Switch
              value={weeklyReports}
              onValueChange={setWeeklyReports}
              trackColor={{ false: '#e5e7eb', true: '#fed7aa' }}
              thumbColor={weeklyReports ? '#f97316' : '#9ca3af'}
            />
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="help-circle" size={20} color="#f97316" />
          <Text style={styles.actionText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="document-text" size={20} color="#f97316" />
          <Text style={styles.actionText}>Terms & Privacy</Text>
          <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="star" size={20} color="#f97316" />
          <Text style={styles.actionText}>Rate the App</Text>
          <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.logoutButton]} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color="#ef4444" />
          <Text style={[styles.actionText, { color: '#ef4444' }]}>Logout</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f97316',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#374151',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  specialization: {
    fontSize: 14,
    color: '#f97316',
    fontWeight: '600',
    marginBottom: 2,
  },
  experience: {
    fontSize: 12,
    color: '#6b7280',
  },
  editBtn: {
    padding: 8,
    backgroundColor: '#fff7ed',
    borderRadius: 8,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoItem: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  infoInput: {
    fontSize: 16,
    color: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 8,
  },
  bioInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    textAlignVertical: 'top',
    height: 80,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#f97316',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  certificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  certificationText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    textAlign: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: '#6b7280',
  },
  actionButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
    marginLeft: 12,
  },
  logoutButton: {
    marginTop: 16,
  },
});
