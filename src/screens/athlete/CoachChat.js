import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function CoachChat({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock coaches data
  const [coaches, setCoaches] = useState([
    {
      id: '1',
      name: 'Coach Sarah Johnson',
      sport: 'Track & Field',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      lastMessage: 'Great progress on your sprint times!',
      lastMessageTime: '2 hours ago',
      unreadCount: 2,
      isOnline: true
    },
    {
      id: '2',
      name: 'Coach Mike Chen',
      sport: 'Swimming',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      lastMessage: 'Remember to focus on your breathing technique',
      lastMessageTime: '1 day ago',
      unreadCount: 0,
      isOnline: false
    },
    {
      id: '3',
      name: 'Coach Lisa Rodriguez',
      sport: 'Basketball',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      lastMessage: 'See you at practice tomorrow',
      lastMessageTime: '3 days ago',
      unreadCount: 1,
      isOnline: true
    },
    {
      id: '4',
      name: 'Coach David Wilson',
      sport: 'Weightlifting',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      lastMessage: 'Your form is improving nicely',
      lastMessageTime: '1 week ago',
      unreadCount: 0,
      isOnline: false
    }
  ]);

  const filteredCoaches = coaches.filter(coach =>
    coach.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coach.sport.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openChat = (coach) => {
    navigation.navigate('MessageCoach', { coach });
  };

  const renderCoachItem = ({ item }) => (
    <TouchableOpacity style={styles.coachItem} onPress={() => openChat(item)}>
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        {item.isOnline && <View style={styles.onlineIndicator} />}
      </View>
      
      <View style={styles.coachInfo}>
        <View style={styles.coachHeader}>
          <Text style={styles.coachName}>{item.name}</Text>
          <Text style={styles.messageTime}>{item.lastMessageTime}</Text>
        </View>
        <Text style={styles.coachSport}>{item.sport}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>
      
      <View style={styles.rightSection}>
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadCount}>{item.unreadCount}</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <Text style={styles.headerSubtitle}>Chat with your coaches</Text>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search coaches..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={filteredCoaches}
        renderItem={renderCoachItem}
        keyExtractor={item => item.id}
        style={styles.coachList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
  },
  coachList: {
    flex: 1,
  },
  coachItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f3f4f6',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    backgroundColor: '#10b981',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  coachInfo: {
    flex: 1,
  },
  coachHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  coachName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  messageTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  coachSport: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#9ca3af',
  },
  rightSection: {
    alignItems: 'center',
    gap: 8,
  },
  unreadBadge: {
    backgroundColor: '#f97316',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
});
