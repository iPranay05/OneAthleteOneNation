import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  mediaDevices
} from 'react-native-webrtc';
import { supabase } from './supabaseConfig';

export class VideoCallService {
  constructor() {
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.callId = null;
    this.isInitiator = false;
    this.callSubscription = null;
    
    // WebRTC configuration with free STUN servers
    this.configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ]
    };
  }

  // Initialize peer connection
  async initializePeerConnection() {
    try {
      console.log('🔄 Initializing peer connection...');
      
      this.peerConnection = new RTCPeerConnection(this.configuration);
      
      // Handle ICE candidates
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate && this.callId) {
          console.log('🧊 Sending ICE candidate');
          this.sendSignalingMessage({
            type: 'ice-candidate',
            candidate: event.candidate
          });
        }
      };
      
      // Handle remote stream
      this.peerConnection.onaddstream = (event) => {
        console.log('📺 Received remote stream');
        this.remoteStream = event.stream;
        if (this.onRemoteStreamReceived) {
          this.onRemoteStreamReceived(event.stream);
        }
      };
      
      // Handle connection state changes
      this.peerConnection.onconnectionstatechange = () => {
        console.log('🔗 Connection state:', this.peerConnection.connectionState);
        if (this.onConnectionStateChange) {
          this.onConnectionStateChange(this.peerConnection.connectionState);
        }
      };
      
      console.log('✅ Peer connection initialized');
      return true;
    } catch (error) {
      console.error('❌ Error initializing peer connection:', error);
      return false;
    }
  }

  // Get user media (camera and microphone)
  async getUserMedia(videoEnabled = true, audioEnabled = true) {
    try {
      console.log('📷 Getting user media...', { videoEnabled, audioEnabled });
      
      const constraints = {
        audio: audioEnabled,
        video: videoEnabled ? {
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 },
          frameRate: { min: 15, ideal: 30, max: 30 }
        } : false
      };
      
      const stream = await mediaDevices.getUserMedia(constraints);
      this.localStream = stream;
      
      console.log('✅ Got user media:', stream.getTracks().length, 'tracks');
      return stream;
    } catch (error) {
      console.error('❌ Error getting user media:', error);
      throw error;
    }
  }

  // Start a video call
  async startCall(callerId, calleeId, callerName, calleeName) {
    try {
      console.log('📞 Starting call:', { callerId, calleeId });
      
      // Initialize peer connection
      await this.initializePeerConnection();
      
      // Get user media
      const stream = await this.getUserMedia();
      this.peerConnection.addStream(stream);
      
      // Create call record in database
      this.callId = await this.createCallRecord(callerId, calleeId, callerName, calleeName);
      this.isInitiator = true;
      
      // Create offer
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      
      // Send offer to callee
      await this.sendSignalingMessage({
        type: 'offer',
        offer: offer
      });
      
      // Start listening for signaling messages
      this.subscribeToSignaling();
      
      console.log('✅ Call started with ID:', this.callId);
      return { callId: this.callId, localStream: stream };
    } catch (error) {
      console.error('❌ Error starting call:', error);
      throw error;
    }
  }

  // Answer an incoming call
  async answerCall(callId) {
    try {
      console.log('📞 Answering call:', callId);
      
      this.callId = callId;
      this.isInitiator = false;
      
      // Initialize peer connection
      await this.initializePeerConnection();
      
      // Get user media
      const stream = await this.getUserMedia();
      this.peerConnection.addStream(stream);
      
      // Update call status to accepted
      await this.updateCallStatus(callId, 'accepted');
      
      // Start listening for signaling messages
      this.subscribeToSignaling();
      
      console.log('✅ Call answered');
      return { callId, localStream: stream };
    } catch (error) {
      console.error('❌ Error answering call:', error);
      throw error;
    }
  }

  // End the call
  async endCall() {
    try {
      console.log('📞 Ending call...');
      
      // Close peer connection
      if (this.peerConnection) {
        this.peerConnection.close();
        this.peerConnection = null;
      }
      
      // Stop local stream
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop());
        this.localStream = null;
      }
      
      // Update call status
      if (this.callId) {
        await this.updateCallStatus(this.callId, 'ended');
      }
      
      // Unsubscribe from signaling
      if (this.callSubscription) {
        supabase.removeChannel(this.callSubscription);
        this.callSubscription = null;
      }
      
      this.callId = null;
      this.remoteStream = null;
      
      console.log('✅ Call ended');
    } catch (error) {
      console.error('❌ Error ending call:', error);
    }
  }

  // Reject an incoming call
  async rejectCall(callId) {
    try {
      console.log('📞 Rejecting call:', callId);
      await this.updateCallStatus(callId, 'rejected');
      console.log('✅ Call rejected');
    } catch (error) {
      console.error('❌ Error rejecting call:', error);
    }
  }

  // Toggle video on/off
  async toggleVideo() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        console.log('📹 Video toggled:', videoTrack.enabled ? 'ON' : 'OFF');
        return videoTrack.enabled;
      }
    }
    return false;
  }

  // Toggle audio on/off
  async toggleAudio() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        console.log('🎤 Audio toggled:', audioTrack.enabled ? 'ON' : 'OFF');
        return audioTrack.enabled;
      }
    }
    return false;
  }

  // Create call record in database
  async createCallRecord(callerId, calleeId, callerName, calleeName) {
    try {
      const { data, error } = await supabase
        .from('video_calls')
        .insert({
          caller_id: callerId,
          callee_id: calleeId,
          caller_name: callerName,
          callee_name: calleeName,
          status: 'calling',
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('❌ Error creating call record:', error);
      throw error;
    }
  }

  // Update call status
  async updateCallStatus(callId, status) {
    try {
      const updateData = { status };
      
      if (status === 'accepted') {
        updateData.accepted_at = new Date().toISOString();
      } else if (status === 'ended' || status === 'rejected') {
        updateData.ended_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('video_calls')
        .update(updateData)
        .eq('id', callId);

      if (error) throw error;
    } catch (error) {
      console.error('❌ Error updating call status:', error);
    }
  }

  // Send signaling message
  async sendSignalingMessage(message) {
    try {
      const { error } = await supabase
        .from('call_signaling')
        .insert({
          call_id: this.callId,
          message_type: message.type,
          message_data: message,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('❌ Error sending signaling message:', error);
    }
  }

  // Subscribe to signaling messages
  subscribeToSignaling() {
    if (!this.callId) return;

    console.log('🔔 Subscribing to signaling for call:', this.callId);

    this.callSubscription = supabase
      .channel(`call-signaling-${this.callId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'call_signaling',
          filter: `call_id=eq.${this.callId}`
        },
        (payload) => {
          this.handleSignalingMessage(payload.new);
        }
      )
      .subscribe();
  }

  // Handle incoming signaling messages
  async handleSignalingMessage(message) {
    try {
      console.log('📡 Received signaling message:', message.message_type);
      
      const data = message.message_data;
      
      switch (data.type) {
        case 'offer':
          if (!this.isInitiator) {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);
            
            await this.sendSignalingMessage({
              type: 'answer',
              answer: answer
            });
          }
          break;
          
        case 'answer':
          if (this.isInitiator) {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
          }
          break;
          
        case 'ice-candidate':
          await this.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
          break;
      }
    } catch (error) {
      console.error('❌ Error handling signaling message:', error);
    }
  }

  // Check for incoming calls
  async checkIncomingCalls(userId, onIncomingCall) {
    const subscription = supabase
      .channel(`incoming-calls-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'video_calls',
          filter: `callee_id=eq.${userId}`
        },
        (payload) => {
          const call = payload.new;
          if (call.status === 'calling') {
            console.log('📞 Incoming call from:', call.caller_name);
            onIncomingCall(call);
          }
        }
      )
      .subscribe();

    return subscription;
  }
}

// Export singleton instance
export const videoCallService = new VideoCallService();
