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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export default function DirectMessage({ route, navigation }) {
  const { recipientId, recipientName, recipientAvatar, recipientRole } = route?.params || {};
  const { user: currentUser, profile: currentProfile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef(null);

  // Mock conversation data
  const mockMessages = [
    {
      id: '1',
      senderId: recipientId,
      senderName: recipientName,
      senderAvatar: recipientAvatar,
      content: 'Hi! I saw your post about training techniques. Great insights!',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      isRead: true,
    },
    {
      id: '2',
      senderId: currentUser?.id || 'current-user',
      senderName: currentProfile?.full_name || currentUser?.email || 'You',
      senderAvatar: currentProfile?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      content: 'Thank you! I\'m always happy to share knowledge with fellow athletes.',
      timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      isRead: true,
    },
    {
      id: '3',
      senderId: recipientId,
      senderName: recipientName,
      senderAvatar: recipientAvatar,
      content: 'I\'m particularly interested in your approach to adaptive training. Could you share more about your methodology?',
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      isRead: true,
    },
    {
      id: '4',
      senderId: currentUser?.id || 'current-user',
      senderName: currentProfile?.full_name || currentUser?.email || 'You',
      senderAvatar: currentProfile?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      content: 'Absolutely! I focus on personalized assessments first, then create adaptive programs based on individual capabilities and goals. Would you like to schedule a call to discuss this further?',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      isRead: false,
    },
  ];

  useEffect(() => {
    // Check if we have required params
    if (!recipientId) {
      setLoading(false);
      return;
    }

    // Simulate loading messages
    setTimeout(() => {
      setMessages(mockMessages);
      setLoading(false);
    }, 1000);
  }, [recipientId]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const sendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      senderId: currentUser?.id || 'current-user',
      senderName: currentProfile?.full_name || currentUser?.email || 'You',
      senderAvatar: currentProfile?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      content: inputText.trim(),
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Simulate recipient response after a delay
    setTimeout(() => {
      const responses = [
        "That sounds great! Let me know when you're available.",
        "Thanks for the information. Very helpful!",
        "I appreciate your time and expertise.",
        "Looking forward to working together!",
        "That makes perfect sense. Thank you for explaining.",
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const responseMessage = {
        id: (Date.now() + 1).toString(),
        senderId: recipientId,
        senderName: recipientName,
        senderAvatar: recipientAvatar,
        content: randomResponse,
        timestamp: new Date().toISOString(),
        isRead: false,
      };

      setMessages(prev => [...prev, responseMessage]);
    }, 2000 + Math.random() * 3000); // Random delay between 2-5 seconds
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
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.profileInfo} onPress={handleProfilePress}>
            <Image source={{ uri: recipientAvatar }} style={styles.headerAvatar} />
            <View style={styles.headerTextContainer}>
              <View style={styles.headerNameContainer}>
                <Text style={styles.headerName}>{recipientName}</Text>
                {recipientRole === 'coach' && (
                  <View style={styles.headerCoachBadge}>
                    <Ionicons name="school" size={10} color="#ffffff" />
                  </View>
                )}
              </View>
              <Text style={styles.headerStatus}>Active now</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.moreBtn}>
            <Ionicons name="ellipsis-horizontal" size={24} color="#111827" />
          </TouchableOpacity>
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
              style={[styles.sendButton, inputText.trim() && styles.sendButtonActive]}
              onPress={sendMessage}
              disabled={!inputText.trim()}
            >
              <Ionicons 
                name="send" 
                size={20} 
                color={inputText.trim() ? "#ffffff" : "#9ca3af"} 
              />
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
