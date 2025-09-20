import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { messagingService } from '../../services/messagingService';

export default function DirectMessage({ route, navigation }) {
  const { recipientId, recipientName, recipientAvatar, recipientRole } = route?.params || {};
  const { user: currentUser, profile: currentProfile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);
  const conversationKey = useRef(null);

  // Load conversation and set up real-time subscription
  useEffect(() => {
    if (!currentUser?.id || !recipientId) {
      setLoading(false);
      return;
    }

    loadConversation();
    setupRealtimeSubscription();

    // Cleanup subscription on unmount
    return () => {
      if (conversationKey.current) {
        messagingService.unsubscribeFromConversation(conversationKey.current);
      }
    };
  }, [currentUser?.id, recipientId]);

  const loadConversation = async () => {
    try {
      setLoading(true);
      console.log('📱 Loading conversation between:', currentUser.id, 'and', recipientId);
      
      const conversationMessages = await messagingService.getConversationMessages(
        currentUser.id,
        recipientId
      );

      // Transform messages to match UI format
      const formattedMessages = conversationMessages.map(msg => ({
        id: msg.id,
        senderId: msg.sender_id,
        senderName: msg.sender_id === currentUser.id 
          ? (currentProfile?.full_name || currentUser.email || 'You')
          : recipientName,
        senderAvatar: msg.sender_id === currentUser.id 
          ? (currentProfile?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face')
          : recipientAvatar,
        content: msg.message,
        timestamp: msg.created_at,
        isRead: msg.status === 'read',
        status: msg.status,
        messageType: msg.message_type
      }));

      setMessages(formattedMessages);
      
      // Mark messages as read
      await messagingService.markMessagesAsRead(currentUser.id, recipientId);
      
      console.log('✅ Conversation loaded:', formattedMessages.length, 'messages');
    } catch (error) {
      console.error('❌ Error loading conversation:', error);
      Alert.alert('Error', 'Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!currentUser?.id || !recipientId) return;

    console.log('🔔 Setting up real-time subscription');
    
    conversationKey.current = messagingService.subscribeToConversation(
      currentUser.id,
      recipientId,
      (newMessage, eventType = 'insert') => {
        console.log('📨 Real-time message received:', newMessage, eventType);
        
        if (eventType === 'insert') {
          // Check if message already exists (avoid duplicates)
          setMessages(prev => {
            const messageExists = prev.some(msg => msg.id === newMessage.id);
            if (messageExists) {
              console.log('📨 Message already exists, skipping duplicate');
              return prev;
            }

            // Add new message to the list
            const formattedMessage = {
              id: newMessage.id,
              senderId: newMessage.sender_id,
              senderName: newMessage.sender_id === currentUser.id 
                ? (currentProfile?.full_name || currentUser.email || 'You')
                : recipientName,
              senderAvatar: newMessage.sender_id === currentUser.id 
                ? (currentProfile?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face')
                : recipientAvatar,
              content: newMessage.message,
              timestamp: newMessage.created_at,
              isRead: newMessage.status === 'read',
              status: newMessage.status,
              messageType: newMessage.message_type,
              isOptimistic: false
            };

            console.log('📨 Adding new real-time message:', formattedMessage.id);
            return [...prev, formattedMessage];
          });
          
          // Auto-scroll to bottom
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
          
          // Mark as read if it's from the other person
          if (newMessage.sender_id !== currentUser.id) {
            messagingService.markMessagesAsRead(currentUser.id, recipientId);
          }
        } else if (eventType === 'update') {
          // Update message status (read receipts)
          setMessages(prev => prev.map(msg => 
            msg.id === newMessage.id 
              ? { ...msg, isRead: newMessage.status === 'read', status: newMessage.status }
              : msg
          ));
        }
      }
    );
  };

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || sending || !currentUser?.id || !recipientId) return;

    const messageText = inputText.trim();
    setInputText('');
    setSending(true);

    // Create optimistic message (shows immediately)
    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentProfile?.full_name || currentUser.email || 'You',
      senderAvatar: currentProfile?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      content: messageText,
      timestamp: new Date().toISOString(),
      isRead: false,
      status: 'sending',
      messageType: 'text',
      isOptimistic: true
    };

    // Add optimistic message immediately
    setMessages(prev => [...prev, optimisticMessage]);

    // Auto-scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      console.log('📤 Sending message:', messageText);
      
      const sentMessage = await messagingService.sendMessage(
        currentUser.id,
        recipientId,
        messageText,
        'text'
      );

      console.log('✅ Message sent successfully:', sentMessage);

      // Replace optimistic message with real message
      setMessages(prev => {
        // Check if real message already exists from real-time subscription
        const realMessageExists = prev.some(msg => msg.id === sentMessage.id && !msg.isOptimistic);
        
        if (realMessageExists) {
          // Real message already added by real-time, just remove optimistic
          console.log('📨 Real message already exists, removing optimistic');
          return prev.filter(msg => msg.id !== optimisticMessage.id);
        } else {
          // Replace optimistic with real message
          console.log('📨 Replacing optimistic message with real message');
          return prev.map(msg => 
            msg.id === optimisticMessage.id 
              ? {
                  id: sentMessage.id,
                  senderId: sentMessage.sender_id,
                  senderName: currentProfile?.full_name || currentUser.email || 'You',
                  senderAvatar: currentProfile?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
                  content: sentMessage.message,
                  timestamp: sentMessage.created_at,
                  isRead: sentMessage.status === 'read',
                  status: sentMessage.status,
                  messageType: sentMessage.message_type,
                  isOptimistic: false
                }
              : msg
          );
        }
      });

    } catch (error) {
      console.error('❌ Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
      
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
      
      // Restore the message text if sending failed
      setInputText(messageText);
    } finally {
      setSending(false);
    }
  };

  const startVideoCall = () => {
    if (!recipientId || !recipientName) {
      Alert.alert('Error', 'Cannot start video call - recipient information missing');
      return;
    }

    navigation.navigate('VideoCall', {
      isIncoming: false,
      recipientId: recipientId,
      recipientName: recipientName,
      recipientAvatar: recipientAvatar,
      recipientRole: recipientRole
    });
  };

  const startAudioCall = () => {
    Alert.alert('Audio Call', 'Audio-only calling will be available in the next update!');
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderMessage = ({ item }) => {
    const isCurrentUser = item.senderId === (currentUser?.id || 'current-user');
    
    return (
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
      ]}>
        {!isCurrentUser && (
          <Image source={{ uri: item.senderAvatar }} style={styles.messageAvatar} />
        )}
        
        <View style={[
          styles.messageBubble,
          isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble
        ]}>
          <Text style={[
            styles.messageText,
            isCurrentUser ? styles.currentUserText : styles.otherUserText
          ]}>
            {item.content}
          </Text>
          <Text style={[
            styles.messageTime,
            isCurrentUser ? styles.currentUserTime : styles.otherUserTime
          ]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
        
        {isCurrentUser && (
          <Image source={{ uri: item.senderAvatar }} style={styles.messageAvatar} />
        )}
      </View>
    );
  };

  const handleProfilePress = () => {
    if (!recipientId) {
      console.warn('Cannot navigate to profile: recipientId is undefined');
      return;
    }

    navigation.navigate('UserProfile', {
      userId: recipientId,
      userType: recipientRole,
      userName: recipientName,
      userAvatar: recipientAvatar,
    });
  };

  if (!recipientId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Message</Text>
            <View style={styles.moreBtn} />
          </View>
          <View style={styles.errorContent}>
            <Ionicons name="chatbubble-outline" size={64} color="#9ca3af" />
            <Text style={styles.errorText}>Invalid Conversation</Text>
            <Text style={styles.errorSubtext}>Unable to load conversation. Please try again.</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.profileSection}
            onPress={() => navigation.navigate('UserProfile', {
              userId: recipientId,
              userName: recipientName,
              userRole: recipientRole
            })}
          >
            <Image 
              source={{ uri: recipientAvatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' }}
              style={styles.avatar}
            />
            <View style={styles.headerInfo}>
              <Text style={styles.recipientName}>{recipientName}</Text>
              <Text style={styles.recipientRole}>{recipientRole === 'coach' ? 'Coach' : 'Athlete'}</Text>
            </View>
          </TouchableOpacity>

          {/* Video Call Buttons */}
          <View style={styles.callButtons}>
            <TouchableOpacity 
              style={styles.callButton}
              onPress={startVideoCall}
            >
              <Ionicons name="videocam" size={20} color="#4f46e5" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.callButton}
              onPress={startAudioCall}
            >
              <Ionicons name="call" size={20} color="#4f46e5" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
        />

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              placeholderTextColor="#9ca3af"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity 
              style={[styles.sendButton, (inputText.trim() && !sending) && styles.sendButtonActive]}
              onPress={sendMessage}
              disabled={!inputText.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Ionicons 
                  name="send" 
                  size={20} 
                  color={(inputText.trim() && !sending) ? "#ffffff" : "#9ca3af"} 
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backBtn: {
    padding: 8,
    marginRight: 8,
  },
  profileInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginRight: 6,
  },
  headerCoachBadge: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerStatus: {
    fontSize: 12,
    color: '#10b981',
    marginTop: 2,
  },
  moreBtn: {
    padding: 8,
  },
  callButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  messagesList: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  messagesContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  currentUserMessage: {
    justifyContent: 'flex-end',
  },
  otherUserMessage: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginHorizontal: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  currentUserBubble: {
    backgroundColor: '#f97316',
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
  },
  currentUserText: {
    color: '#ffffff',
  },
  otherUserText: {
    color: '#111827',
  },
  messageTime: {
    fontSize: 11,
    fontWeight: '500',
  },
  currentUserTime: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  otherUserTime: {
    color: '#9ca3af',
  },
  inputContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f3f4f6',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#f97316',
  },
  errorContainer: {
    flex: 1,
  },
  errorContent: {
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
    textAlign: 'center',
    lineHeight: 20,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
  },
});
