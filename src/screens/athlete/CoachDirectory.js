import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Linking, Alert } from 'react-native';

const mockCoaches = [
  {
    id: 1,
    name: 'Rajesh Kumar',
    sport: 'Running',
    specialization: 'Marathon & Long Distance',
    experience: '15 years',
    location: 'Mumbai, Maharashtra',
    contact: '+91 98765 43210',
    email: 'rajesh.coach@gmail.com',
    achievements: 'Coached 5 national champions, Former Olympic athlete',
    rating: 4.8,
    fee: '₹3000-5000/month'
  },
  {
    id: 2,
    name: 'Priya Sharma',
    sport: 'Swimming',
    specialization: 'Freestyle & Butterfly',
    experience: '12 years',
    location: 'Delhi, NCR',
    contact: '+91 87654 32109',
    email: 'priya.swim@yahoo.com',
    achievements: 'National swimming coach, Commonwealth Games medalist',
    rating: 4.9,
    fee: '₹4000-6000/month'
  },
  {
    id: 3,
    name: 'Arjun Singh',
    sport: 'Cricket',
    specialization: 'Batting & Fielding',
    experience: '20 years',
    location: 'Bangalore, Karnataka',
    contact: '+91 76543 21098',
    email: 'arjun.cricket@hotmail.com',
    achievements: 'Former IPL player, Level 3 certified coach',
    rating: 4.7,
    fee: '₹5000-8000/month'
  },
  {
    id: 4,
    name: 'Meera Patel',
    sport: 'Badminton',
    specialization: 'Singles & Doubles',
    experience: '10 years',
    location: 'Ahmedabad, Gujarat',
    contact: '+91 65432 10987',
    email: 'meera.badminton@gmail.com',
    achievements: 'State champion, BWF certified coach',
    rating: 4.6,
    fee: '₹2500-4000/month'
  },
  {
    id: 5,
    name: 'Vikram Reddy',
    sport: 'Football',
    specialization: 'Goalkeeping & Defense',
    experience: '18 years',
    location: 'Hyderabad, Telangana',
    contact: '+91 54321 09876',
    email: 'vikram.football@outlook.com',
    achievements: 'I-League coach, UEFA B license',
    rating: 4.8,
    fee: '₹3500-5500/month'
  }
];

const mockOrganizations = [
  {
    id: 1,
    name: 'Sports Authority of India (SAI)',
    type: 'Government',
    location: 'New Delhi',
    contact: '+91 11 2436 1532',
    email: 'info@sai.gov.in',
    website: 'https://sai.gov.in',
    services: 'Training facilities, Scholarships, Equipment support',
    description: 'Premier sports organization providing world-class training facilities'
  },
  {
    id: 2,
    name: 'Khelo India Foundation',
    type: 'Government Initiative',
    location: 'Pan India',
    contact: '+91 11 2338 4768',
    email: 'contact@kheloindia.gov.in',
    website: 'https://kheloindia.gov.in',
    services: 'Youth development, Scholarships, Talent identification',
    description: 'National program for development of sports at grassroot level'
  },
  {
    id: 3,
    name: 'Olympic Gold Quest (OGQ)',
    type: 'NGO',
    location: 'Bangalore',
    contact: '+91 80 4112 5400',
    email: 'info@olympicgoldquest.in',
    website: 'https://olympicgoldquest.in',
    services: 'Financial support, Training programs, Sports science',
    description: 'Supporting Indian athletes to win Olympic and Paralympic medals'
  },
  {
    id: 4,
    name: 'Reliance Foundation Youth Sports',
    type: 'Corporate',
    location: 'Mumbai',
    contact: '+91 22 3555 5000',
    email: 'sports@reliancefoundation.org',
    website: 'https://reliancefoundation.org/sports',
    services: 'Youth development, Infrastructure, Coaching',
    description: 'Developing sporting talent across multiple disciplines'
  }
];

export default function CoachDirectory() {
  const [activeTab, setActiveTab] = useState('coaches');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('All');

  const sports = ['All', 'Running', 'Swimming', 'Cricket', 'Badminton', 'Football', 'Basketball', 'Tennis'];

  const filteredCoaches = mockCoaches.filter(coach => {
    const matchesSearch = coach.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         coach.sport.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         coach.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = selectedSport === 'All' || coach.sport === selectedSport;
    return matchesSearch && matchesSport;
  });

  const filteredOrganizations = mockOrganizations.filter(org => {
    return org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           org.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
           org.services.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleCall = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmail = (email) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleWebsite = (website) => {
    Linking.openURL(website);
  };

  const renderCoachCard = (coach) => (
    <View key={coach.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.coachName}>{coach.name}</Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>⭐ {coach.rating}</Text>
        </View>
      </View>
      
      <Text style={styles.sport}>{coach.sport} - {coach.specialization}</Text>
      <Text style={styles.experience}>📅 {coach.experience} experience</Text>
      <Text style={styles.location}>📍 {coach.location}</Text>
      <Text style={styles.fee}>💰 {coach.fee}</Text>
      <Text style={styles.achievements}>🏆 {coach.achievements}</Text>
      
      <View style={styles.contactButtons}>
        <TouchableOpacity 
          style={styles.callBtn} 
          onPress={() => handleCall(coach.contact)}
        >
          <Text style={styles.contactBtnText}>📞 Call</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.emailBtn} 
          onPress={() => handleEmail(coach.email)}
        >
          <Text style={styles.contactBtnText}>✉️ Email</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderOrganizationCard = (org) => (
    <View key={org.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.orgName}>{org.name}</Text>
        <Text style={styles.orgType}>{org.type}</Text>
      </View>
      
      <Text style={styles.location}>📍 {org.location}</Text>
      <Text style={styles.services}>🎯 {org.services}</Text>
      <Text style={styles.description}>{org.description}</Text>
      
      <View style={styles.contactButtons}>
        <TouchableOpacity 
          style={styles.callBtn} 
          onPress={() => handleCall(org.contact)}
        >
          <Text style={styles.contactBtnText}>📞 Call</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.emailBtn} 
          onPress={() => handleEmail(org.email)}
        >
          <Text style={styles.contactBtnText}>✉️ Email</Text>
        </TouchableOpacity>
        {org.website && (
          <TouchableOpacity 
            style={styles.websiteBtn} 
            onPress={() => handleWebsite(org.website)}
          >
            <Text style={styles.contactBtnText}>🌐 Website</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'coaches' && styles.activeTab]}
          onPress={() => setActiveTab('coaches')}
        >
          <Text style={[styles.tabText, activeTab === 'coaches' && styles.activeTabText]}>
            👨‍🏫 Coaches
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'organizations' && styles.activeTab]}
          onPress={() => setActiveTab('organizations')}
        >
          <Text style={[styles.tabText, activeTab === 'organizations' && styles.activeTabText]}>
            🏢 Organizations
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${activeTab}...`}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Sport Filter (only for coaches) */}
      {activeTab === 'coaches' && (
        <View style={styles.sportFilterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sportFilter}>
            {sports.map(sport => (
              <TouchableOpacity
                key={sport}
                style={[styles.sportChip, selectedSport === sport && styles.selectedSportChip]}
                onPress={() => setSelectedSport(sport)}
              >
                <Text style={[styles.sportChipText, selectedSport === sport && styles.selectedSportChipText]}>
                  {sport}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'coaches' ? (
          filteredCoaches.length > 0 ? (
            filteredCoaches.map(renderCoachCard)
          ) : (
            <Text style={styles.noResults}>No coaches found matching your criteria</Text>
          )
        ) : (
          filteredOrganizations.length > 0 ? (
            filteredOrganizations.map(renderOrganizationCard)
          ) : (
            <Text style={styles.noResults}>No organizations found matching your criteria</Text>
          )
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: '#f97316',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#ffffff',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  searchInput: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sportFilterContainer: {
    backgroundColor: '#f8f9fa',
    paddingBottom: 16,
  },
  sportFilter: {
    paddingHorizontal: 16,
    flexDirection: 'row',
  },
  sportChip: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedSportChip: {
    backgroundColor: '#f97316',
    borderColor: '#f97316',
  },
  sportChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
  },
  selectedSportChipText: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  coachName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  orgName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  orgType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f97316',
    backgroundColor: '#fef3e2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingContainer: {
    backgroundColor: '#fef3e2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f97316',
  },
  sport: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  experience: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  fee: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
    marginBottom: 4,
  },
  services: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  achievements: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  description: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
    lineHeight: 20,
  },
  contactButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  callBtn: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 4,
  },
  emailBtn: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 4,
  },
  websiteBtn: {
    flex: 1,
    backgroundColor: '#8b5cf6',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 4,
  },
  contactBtnText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  noResults: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6b7280',
    marginTop: 40,
    fontStyle: 'italic',
  },
});
