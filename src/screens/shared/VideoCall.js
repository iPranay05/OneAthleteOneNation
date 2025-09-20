import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  StatusBar,
  SafeAreaView
} from 'react-native';
import { RTCView } from 'react-native-webrtc';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { videoCallService } from '../../services/videoCallService';

const { width, height } = Dimensions.get('window');

export default function VideoCall({ route, navigation }) {
  const { callId, isIncoming, recipientId, recipientName, recipientAvatar } = route?.params || {};
  const { user: currentUser, profile: currentProfile } = useAuth();
  
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callStatus, setCallStatus] = useState(isIncoming ? 'incoming' : 'calling');
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  
  const callTimer = useRef(null);

  useEffect(() => {
    initializeCall();
    
    // Setup video call service callbacks
    videoCallService.onRemoteStreamReceived = (stream) => {
      console.log('📺 Remote stream received in UI');
      setRemoteStream(stream);
      setCallStatus('connected');
      startCallTimer();
    };
    
    videoCallService.onConnectionStateChange = (state) => {
      console.log('🔗 Connection state changed:', state);
      if (state === 'connected') {
        setCallStatus('connected');
      } else if (state === 'disconnected' || state === 'failed') {
        endCall();
      }
    };
    
    return () => {
      cleanup();
    };
  }, []);

  const initializeCall = async () => {
    try {
      if (isIncoming && callId) {
        // Answer incoming call
        console.log('📞 Answering incoming call');
        const result = await videoCallService.answerCall(callId);
        setLocalStream(result.localStream);
        setCallStatus('connecting');
      } else {
        // Start outgoing call
        console.log('📞 Starting outgoing call');
        const result = await videoCallService.startCall(
          currentUser.id,
          recipientId,
          currentProfile?.full_name || currentUser.email,
          recipientName
        );
        setLocalStream(result.localStream);
        setCallStatus('calling');
      }
    } catch (error) {
      console.error('❌ Error initializing call:', error);
      Alert.alert('Call Error', 'Failed to initialize video call');
      navigation.goBack();
    }
  };

  const endCall = async () => {
    try {
      await videoCallService.endCall();
      cleanup();
      navigation.goBack();
    } catch (error) {
      console.error('❌ Error ending call:', error);
      navigation.goBack();
    }
  };

  const rejectCall = async () => {
    try {
      if (callId) {
        await videoCallService.rejectCall(callId);
      }
      cleanup();
      navigation.goBack();
    } catch (error) {
      console.error('❌ Error rejecting call:', error);
      navigation.goBack();
    }
  };

  const toggleVideo = async () => {
    const enabled = await videoCallService.toggleVideo();
    setIsVideoEnabled(enabled);
  };

  const toggleAudio = async () => {
    const enabled = await videoCallService.toggleAudio();
    setIsAudioEnabled(enabled);
  };

  const startCallTimer = () => {
    callTimer.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const cleanup = () => {
    if (callTimer.current) {
      clearInterval(callTimer.current);
      callTimer.current = null;
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusText = () => {
    switch (callStatus) {
      case 'incoming': return 'Incoming call...';
      case 'calling': return 'Calling...';
      case 'connecting': return 'Connecting...';
      case 'connected': return formatDuration(callDuration);
      default: return '';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Remote Video (Full Screen) */}
      <View style={styles.remoteVideoContainer}>
        {remoteStream ? (
          <RTCView
            style={styles.remoteVideo}
            streamURL={remoteStream.toURL()}
            objectFit="cover"
          />
        ) : (
          <View style={styles.avatarContainer}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {recipientName?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            </View>
            <Text style={styles.participantName}>{recipientName}</Text>
            <Text style={styles.callStatus}>{getStatusText()}</Text>
          </View>
        )}
      </View>

      {/* Local Video (Picture-in-Picture) */}
      {localStream && (
        <View style={styles.localVideoContainer}>
          <RTCView
            style={styles.localVideo}
            streamURL={localStream.toURL()}
            objectFit="cover"
            mirror={true}
          />
        </View>
      )}

      {/* Call Controls */}
      <View style={styles.controlsContainer}>
        {callStatus === 'incoming' ? (
          // Incoming call controls
          <View style={styles.incomingControls}>
            <TouchableOpacity 
              style={[styles.controlButton, styles.rejectButton]}
              onPress={rejectCall}
            >
              <Ionicons name="call" size={30} color="#ffffff" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.controlButton, styles.acceptButton]}
              onPress={() => setCallStatus('connecting')}
            >
              <Ionicons name="call" size={30} color="#ffffff" />
            </TouchableOpacity>
          </View>
        ) : (
          // Active call controls
          <View style={styles.activeControls}>
            <TouchableOpacity 
              style={[styles.controlButton, isVideoEnabled ? styles.activeControl : styles.inactiveControl]}
              onPress={toggleVideo}
            >
              <Ionicons 
                name={isVideoEnabled ? "videocam" : "videocam-off"} 
                size={24} 
                color="#ffffff" 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.controlButton, isAudioEnabled ? styles.activeControl : styles.inactiveControl]}
              onPress={toggleAudio}
            >
              <Ionicons 
                name={isAudioEnabled ? "mic" : "mic-off"} 
                size={24} 
                color="#ffffff" 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.controlButton, styles.endCallButton]}
              onPress={endCall}
            >
              <Ionicons name="call" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Call Info Overlay */}
      {callStatus !== 'incoming' && (
        <View style={styles.callInfoOverlay}>
          <Text style={styles.participantNameOverlay}>{recipientName}</Text>
          <Text style={styles.callStatusOverlay}>{getStatusText()}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  remoteVideoContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  remoteVideo: {
    flex: 1,
    backgroundColor: '#000000',
  },
  avatarContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#ffffff',
  },
  participantName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  callStatus: {
    fontSize: 16,
    color: '#9ca3af',
  },
  localVideoContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 120,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  localVideo: {
    flex: 1,
    backgroundColor: '#000000',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    paddingHorizontal: 40,
  },
  incomingControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  activeControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 30,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
    transform: [{ rotate: '135deg' }],
  },
  acceptButton: {
    backgroundColor: '#10b981',
  },
  endCallButton: {
    backgroundColor: '#ef4444',
    transform: [{ rotate: '135deg' }],
  },
  activeControl: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  inactiveControl: {
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
  },
  callInfoOverlay: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 140,
  },
  participantNameOverlay: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  callStatusOverlay: {
    fontSize: 14,
    color: '#9ca3af',
  },
});
