import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export default function UserProfile({ route, navigation }) {
  const { userId, userType, userName, userAvatar } = route?.params || {};
  const { user: currentUser, profile: currentProfile } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  // Mock user data - in real app, this would come from API
  const mockUserData = {
    coach: {
      id: userId,
      name: userName || 'Coach Sarah Williams',
      avatar: userAvatar || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      role: 'coach',
      specialization: 'Paralympic Sports & Adaptive Training',
      experience: '8+ years',
      location: 'San Francisco, CA',
      bio: 'Passionate about helping disabled athletes reach their full potential through personalized training and adaptive techniques. Certified in Paralympic coaching and adaptive sports.',
      stats: {
        athletes: 24,
        workouts: 156,
        successRate: '85%',
        rating: 4.9
      },
      certifications: [
        'ACSM Certified Personal Trainer',
        'Paralympic Coach Level 3',
        'Adaptive Sports Specialist',
        'Sports Psychology Certificate'
      ],
      achievements: [
        '🏆 Coached 3 Paralympic medalists',
        '🎯 85% athlete improvement rate',
        '⭐ 4.9/5 average rating',
        '📈 200+ successful training programs'
      ]
    },
    athlete: {
      id: userId,
      name: userName || 'Rahul Sharma',
      avatar: userAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      role: 'athlete',
      sport: 'Track & Field',
      category: 'T44 - Below Knee Amputation',
      location: 'Mumbai, India',
      age: 24,
      bio: 'Aspiring Paralympic athlete specializing in 400m and 800m sprints. Training hard every day to represent India in the next Paralympics.',
      stats: {
        personalBests: '400m: 52.3s, 800m: 1:58.2',
        competitions: 15,
        medals: 8,
        training: '6 days/week'
      },
      achievements: [
        '🥇 National Para Championships Gold',
        '🥈 Asian Para Games Silver',
        '🏃‍♂️ Personal Best: 52.3s (400m)',
        '📊 Top 10 World Ranking'
      ],
      goals: [
        'Qualify for Paris 2024 Paralympics',
        'Break 52-second barrier in 400m',
        'Win medal at World Championships',
        'Inspire next generation of athletes'
      ]
    }
  };

  useEffect(() => {
    // Check if we have required params
    if (!userId) {
      setLoading(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setUserProfile(mockUserData[userType] || mockUserData.athlete);
      setLoading(false);
    }, 1000);
  }, [userId, userType]);

  const handleSendMessage = () => {
    navigation.navigate('DirectMessage', {
      recipientId: userId,
      recipientName: userProfile?.name,
      recipientAvatar: userProfile?.avatar,
      recipientRole: userProfile?.role
    });
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    Alert.alert(
      'Success',
      `You ${isFollowing ? 'unfollowed' : 'followed'} ${userProfile?.name}!`
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f97316" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
          <Text style={styles.errorText}>Invalid Profile Link</Text>
          <Text style={styles.errorSubtext}>The profile link appears to be broken or incomplete.</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!userProfile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Ionicons name="person-outline" size={64} color="#9ca3af" />
          <Text style={styles.errorText}>Profile not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isCoach = userProfile.role === 'coach';
  const isOwnProfile = currentUser?.id === userId;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.moreBtn}>
            <Ionicons name="ellipsis-horizontal" size={24} color="#111827" />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <Image source={{ uri: userProfile.avatar }} style={styles.avatar} />
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{userProfile.name}</Text>
            {isCoach && (
              <View style={styles.coachBadge}>
                <Ionicons name="school" size={14} color="#ffffff" />
                <Text style={styles.coachBadgeText}>Coach</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.specialization}>
            {isCoach ? userProfile.specialization : `${userProfile.sport} • ${userProfile.category}`}
          </Text>
          
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color="#6b7280" />
            <Text style={styles.location}>{userProfile.location}</Text>
            {!isCoach && (
              <>
                <Text style={styles.separator}>•</Text>
                <Text style={styles.age}>{userProfile.age} years old</Text>
              </>
            )}
          </View>

          {/* Action Buttons */}
          {!isOwnProfile && (
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionBtn, styles.messageBtn]} 
                onPress={handleSendMessage}
              >
                <Ionicons name="chatbubble-outline" size={18} color="#ffffff" />
                <Text style={styles.messageBtnText}>Message</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionBtn, isFollowing ? styles.followingBtn : styles.followBtn]} 
                onPress={handleFollow}
              >
                <Ionicons 
                  name={isFollowing ? "checkmark" : "person-add-outline"} 
                  size={18} 
                  color={isFollowing ? "#f97316" : "#ffffff"} 
                />
                <Text style={[styles.followBtnText, isFollowing && styles.followingBtnText]}>
                  {isFollowing ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>
            {isCoach ? 'Coaching Stats' : 'Performance Stats'}
          </Text>
          <View style={styles.statsGrid}>
            {isCoach ? (
              <>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{userProfile.stats.athletes}</Text>
                  <Text style={styles.statLabel}>Athletes</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{userProfile.stats.workouts}</Text>
                  <Text style={styles.statLabel}>Workouts</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{userProfile.stats.successRate}</Text>
                  <Text style={styles.statLabel}>Success Rate</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{userProfile.stats.rating}</Text>
                  <Text style={styles.statLabel}>Rating</Text>
                </View>
              </>
            ) : (
              <>
                <View style={[styles.statCard, styles.fullWidthStat]}>
                  <Text style={styles.statValue}>{userProfile.stats.personalBests}</Text>
                  <Text style={styles.statLabel}>Personal Bests</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{userProfile.stats.competitions}</Text>
                  <Text style={styles.statLabel}>Competitions</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{userProfile.stats.medals}</Text>
                  <Text style={styles.statLabel}>Medals</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Bio */}
        <View style={styles.bioSection}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bioText}>{userProfile.bio}</Text>
        </View>

        {/* Achievements */}
        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>
            {isCoach ? 'Achievements' : 'Achievements'}
          </Text>
          {userProfile.achievements.map((achievement, index) => (
            <View key={index} style={styles.achievementItem}>
              <Text style={styles.achievementText}>{achievement}</Text>
            </View>
          ))}
        </View>

        {/* Goals (for athletes) or Certifications (for coaches) */}
        {isCoach ? (
          <View style={styles.certificationsSection}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {userProfile.certifications.map((cert, index) => (
              <View key={index} style={styles.certificationItem}>
                <Ionicons name="ribbon-outline" size={20} color="#f97316" />
                <Text style={styles.certificationText}>{cert}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.goalsSection}>
            <Text style={styles.sectionTitle}>Goals</Text>
            {userProfile.goals.map((goal, index) => (
              <View key={index} style={styles.goalItem}>
                <Ionicons name="flag-outline" size={16} color="#f97316" />
                <Text style={styles.goalText}>{goal}</Text>
              </View>
            ))}
          </View>
        )}
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  backButton: {
    backgroundColor: '#f97316',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  moreBtn: {
    padding: 8,
  },
  profileSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#f97316',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginRight: 8,
  },
  coachBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  coachBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 4,
  },
  specialization: {
    fontSize: 16,
    color: '#f97316',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  location: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  separator: {
    fontSize: 14,
    color: '#6b7280',
    marginHorizontal: 8,
  },
  age: {
    fontSize: 14,
    color: '#6b7280',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    justifyContent: 'center',
  },
  messageBtn: {
    backgroundColor: '#f97316',
  },
  messageBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  followBtn: {
    backgroundColor: '#111827',
  },
  followingBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#f97316',
  },
  followBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  followingBtnText: {
    color: '#f97316',
  },
  statsSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
  },
  fullWidthStat: {
    minWidth: '100%',
  },
  statValue: {
    fontSize: 20,
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
  bioSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginTop: 8,
  },
  bioText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
  },
  achievementsSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginTop: 8,
  },
  achievementItem: {
    marginBottom: 12,
  },
  achievementText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 20,
  },
  certificationsSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginTop: 8,
    marginBottom: 20,
  },
  certificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  certificationText: {
    fontSize: 15,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
  goalsSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginTop: 8,
    marginBottom: 20,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  goalText: {
    fontSize: 15,
    color: '#374151',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
});
