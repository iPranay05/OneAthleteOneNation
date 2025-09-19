import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function MessageAthlete({ route, navigation }) {
  const { athlete } = route.params;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi coach! I completed today's workout. Feeling great!",
      sender: 'athlete',
      timestamp: '2 hours ago'
    },
    {
      id: 2,
      text: "Excellent work! Your form is improving. Keep it up!",
      sender: 'coach',
      timestamp: '1 hour ago'
    }
  ]);

  const sendMessage = () => {
    if (!message.trim()) return;
    
    const newMessage = {
      id: messages.length + 1,
      text: message,
      sender: 'coach',
      timestamp: 'Just now'
    };
    
    setMessages([...messages, newMessage]);
    setMessage('');
    Alert.alert('Message Sent', 'Your message has been sent to the athlete.');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.athleteInfo}>
          <Text style={styles.athleteName}>{athlete.name}</Text>
          <Text style={styles.athleteSport}>{athlete.sport}</Text>
        </View>
        <Text style={styles.athleteAvatar}>{athlete.avatar}</Text>
      </View>

      {/* Messages */}
      <ScrollView style={styles.messagesContainer}>
        {messages.map((msg) => (
          <View key={msg.id} style={[
            styles.messageCard,
            msg.sender === 'coach' ? styles.coachMessage : styles.athleteMessage
          ]}>
            <Text style={[
              styles.messageText,
              msg.sender === 'coach' ? styles.coachMessageText : styles.athleteMessageText
            ]}>
              {msg.text}
            </Text>
            <Text style={styles.timestamp}>{msg.timestamp}</Text>
          </View>
        ))}
      </ScrollView>

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
  },
  athleteInfo: {
    flex: 1,
    marginLeft: 16,
  },
  athleteName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  athleteSport: {
    fontSize: 14,
    color: '#6b7280',
  },
  athleteAvatar: {
    fontSize: 32,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageCard: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  coachMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#f97316',
  },
  athleteMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  coachMessageText: {
    color: '#ffffff',
  },
  athleteMessageText: {
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
