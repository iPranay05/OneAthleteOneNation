import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { coachAssignmentService } from '../../services/coachAssignmentService';
import { supabase } from '../../services/supabaseConfig';
import LanguageToggle from '../../components/LanguageToggle';

export default function CoachRequests({ navigation }) {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRequests();
  }, [user]);

  const loadRequests = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      console.log('🔍 Loading requests for coach:', user.id);
      const coachRequests = await coachAssignmentService.getCoachRequestsForCoach(user.id);
      console.log('📋 Raw coach requests:', coachRequests);
      
      // Enrich requests with athlete data
      const enrichedRequests = await Promise.all(
        coachRequests.map(async (request) => {
          console.log('🔍 Enriching request for athlete:', request.athlete_id);
          
          // Get athlete profile from Supabase
          try {
            const { data: athlete, error } = await supabase
              .from('profiles')
              .select('id, full_name, email, phone')
              .eq('id', request.athlete_id)
              .single();
            
            if (error) {
              console.error('❌ Error fetching athlete profile:', error);
            } else {
              console.log('✅ Found athlete profile:', athlete);
            }
            
            return {
              ...request,
              athlete: athlete || { 
                id: request.athlete_id,
                full_name: 'Unknown Athlete', 
                email: 'unknown@email.com' 
              }
            };
          } catch (error) {
            console.error('❌ Error fetching athlete data:', error);
            return {
              ...request,
              athlete: { 
                id: request.athlete_id,
                full_name: `Athlete ${request.athlete_id.slice(0, 8)}`, 
                email: 'unknown@email.com' 
              }
            };
          }
        })
      );

      // Sort by created date (newest first)
      enrichedRequests.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      setRequests(enrichedRequests);
      console.log('📋 Loaded coach requests:', enrichedRequests.length);
    } catch (error) {
      console.error('Error loading coach requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  };

  const handleRequestAction = async (requestId, action, response = '') => {
    try {
      await coachAssignmentService.updateRequestStatus(requestId, action, response);
      
      // Update local state
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status: action, coach_response: response, responded_at: new Date().toISOString() }
          : req
      ));

      const actionText = action === 'accepted' ? 'accepted' : 'rejected';
      Alert.alert('Success', `Request ${actionText} successfully!`);
      
      console.log(`✅ Request ${actionText}:`, requestId);
    } catch (error) {
      console.error('Error updating request:', error);
      Alert.alert('Error', 'Failed to update request. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'accepted': return '#10b981';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return 'time';
      case 'accepted': return 'checkmark-circle';
      case 'rejected': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const renderRequestCard = (request) => (
    <View key={request.id} style={styles.requestCard}>
      {/* Header */}
      <View style={styles.requestHeader}>
        <View style={styles.athleteInfo}>
          <View style={styles.athleteAvatar}>
            <Ionicons name="person" size={24} color="#f97316" />
          </View>
          <View style={styles.athleteDetails}>
            <Text style={styles.athleteName}>{request.athlete.full_name}</Text>
            <Text style={styles.athleteEmail}>{request.athlete.email}</Text>
          </View>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(request.status)}20` }]}>
          <Ionicons 
            name={getStatusIcon(request.status)} 
            size={16} 
            color={getStatusColor(request.status)} 
          />
          <Text style={[styles.statusText, { color: getStatusColor(request.status) }]}>
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </Text>
        </View>
      </View>

      {/* Message */}
      {request.message && (
        <View style={styles.messageSection}>
          <Text style={styles.messageLabel}>Message:</Text>
          <Text style={styles.messageText}>{request.message}</Text>
        </View>
      )}

      {/* Coach Response */}
      {request.coach_response && (
        <View style={styles.responseSection}>
          <Text style={styles.responseLabel}>Your Response:</Text>
          <Text style={styles.responseText}>{request.coach_response}</Text>
        </View>
      )}

      {/* Timestamps */}
      <View style={styles.timestampSection}>
        <Text style={styles.timestamp}>
          Requested: {new Date(request.created_at).toLocaleDateString()} at {new Date(request.created_at).toLocaleTimeString()}
        </Text>
        {request.responded_at && (
          <Text style={styles.timestamp}>
            Responded: {new Date(request.responded_at).toLocaleDateString()} at {new Date(request.responded_at).toLocaleTimeString()}
          </Text>
        )}
      </View>

      {/* Action Buttons */}
      {request.status === 'pending' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => handleRequestAction(request.id, 'accepted', 'Welcome! I accept you as my athlete.')}
          >
            <Ionicons name="checkmark" size={20} color="#ffffff" />
            <Text style={styles.actionButtonText}>Accept</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleRequestAction(request.id, 'rejected', 'Sorry, I cannot take on new athletes at this time.')}
          >
            <Ionicons name="close" size={20} color="#ffffff" />
            <Text style={styles.actionButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Contact Button */}
      <TouchableOpacity 
        style={styles.contactButton}
        onPress={() => navigation.navigate('DirectMessage', {
          recipientId: request.athlete_id,
          recipientName: request.athlete.full_name,
          recipientRole: 'athlete'
        })}
      >
        <Ionicons name="chatbubble" size={16} color="#3b82f6" />
        <Text style={styles.contactButtonText}>Message Athlete</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f97316" />
          <Text style={styles.loadingText}>Loading requests...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Coach Requests</Text>
          <LanguageToggle showLabel={false} />
        </View>

        {/* Debug Info */}
        <View style={styles.debugContainer}>
          <Text style={styles.debugTitle}>Debug Info:</Text>
          <Text style={styles.debugText}>Coach ID: {user?.id}</Text>
          <Text style={styles.debugText}>Coach Email: {user?.email}</Text>
          <Text style={styles.debugText}>Profile Role: {profile?.role}</Text>
          <Text style={styles.debugText}>Requests Found: {requests.length}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{requests.length}</Text>
            <Text style={styles.statLabel}>Total Requests</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{requests.filter(r => r.status === 'pending').length}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{requests.filter(r => r.status === 'accepted').length}</Text>
            <Text style={styles.statLabel}>Accepted</Text>
          </View>
        </View>

        {/* Requests List */}
        <ScrollView 
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {requests.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="mail-open" size={64} color="#9ca3af" />
              <Text style={styles.emptyTitle}>No Requests Yet</Text>
              <Text style={styles.emptyText}>
                Athletes will be able to send you coaching requests. They'll appear here.
              </Text>
            </View>
          ) : (
            requests.map(renderRequestCard)
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fafb',
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
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  debugContainer: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
  },
  debugText: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f97316',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  requestCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  athleteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  athleteAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fef3e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  athleteDetails: {
    flex: 1,
  },
  athleteName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  athleteEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  messageSection: {
    marginBottom: 12,
  },
  messageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  responseSection: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  responseLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  responseText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  timestampSection: {
    marginBottom: 12,
  },
  timestamp: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  acceptButton: {
    backgroundColor: '#10b981',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderRadius: 8,
  },
  contactButtonText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 32,
  },
});
