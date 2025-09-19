import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, FlatList, Image } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function MessageCoach({ route, navigation }) {
  const { coach } = route.params || { coach: { name: 'Coach Smith', sport: 'Track & Field', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' } };
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I have a question about my training plan.",
      sender: 'athlete',
      timestamp: '2 hours ago'
    },
    {
      id: 2,
      text: "Of course! What would you like to know?",
      sender: 'coach',
      timestamp: '1 hour ago'
    },
    {
      id: 3,
      text: "Should I increase my running distance this week?",
      sender: 'athlete',
      timestamp: '45 minutes ago'
    },
    {
      id: 4,
      text: "Let's stick to the current plan for now. Focus on form first, then we'll increase distance next week.",
      sender: 'coach',
      timestamp: '30 minutes ago'
    }
  ]);

  const sendMessage = () => {
    if (!message.trim()) return;
    
    const newMessage = {
      id: messages.length + 1,
      text: message,
      sender: 'athlete',
      timestamp: 'Just now'
    };
    
    setMessages([...messages, newMessage]);
    setMessage('');
    Alert.alert('Message Sent', 'Your message has been sent to your coach.');
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageCard,
      item.sender === 'athlete' ? styles.athleteMessage : styles.coachMessage
    ]}>
      <Text style={[
        styles.messageText,
        item.sender === 'athlete' ? styles.athleteMessageText : styles.coachMessageText
      ]}>
        {item.text}
      </Text>
      <Text style={styles.timestamp}>{item.timestamp}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.coachInfo}>
          <Text style={styles.coachName}>{coach.name}</Text>
          <Text style={styles.coachSport}>{coach.sport}</Text>
        </View>
        <Image source={{ uri: coach.avatar }} style={styles.coachAvatar} />
      </View>

      {/* Messages */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id.toString()}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Message Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.messageInput}
          placeholder="Type your message..."
          placeholderTextColor="#9ca3af"
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Ionicons name="send" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
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
    paddingTop: 60,
  },
  coachInfo: {
    flex: 1,
    marginLeft: 16,
  },
  coachName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  coachSport: {
    fontSize: 14,
    color: '#6b7280',
  },
  coachAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageCard: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  athleteMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#f97316',
  },
  coachMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  athleteMessageText: {
    color: '#ffffff',
  },
  coachMessageText: {
    color: '#111827',
  },
  timestamp: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 16,
    color: '#111827',
  },
  sendButton: {
    backgroundColor: '#f97316',
    borderRadius: 20,
    padding: 12,
  },
});
