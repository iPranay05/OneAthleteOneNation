import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, FlatList } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import BlindUserVoiceAssistant from '../../components/BlindUserVoiceAssistant';

export default function KnowledgeHub({ navigation }) {
  const [activeTab, setActiveTab] = useState('schemes'); // schemes | rights | documents | tournaments

  const governmentSchemes = [
    {
      id: '1',
      title: 'National Sports Talent Search Scheme (NSTSS)',
      category: 'funding',
      amount: '₹1,500/month',
      eligibility: 'Age 8-14, selected through talent search',
      description: 'Monthly stipend for promising young athletes with disabilities.',
      howToApply: 'Apply through Sports Authority of India (SAI) regional centers.',
      documents: ['Birth certificate', 'Disability certificate', 'School certificate'],
      deadline: 'March 31 annually'
    },
    {
      id: '2',
      title: 'Paralympic Committee of India (PCI) Support',
      category: 'funding',
      amount: '₹25,000-₹1,00,000',
      eligibility: 'National/International para-athletes',
      description: 'Financial support for training, equipment, and competition expenses.',
      howToApply: 'Submit application to Paralympic Committee of India with performance records.',
      documents: ['Disability certificate', 'Performance certificates', 'Bank details'],
      deadline: 'Ongoing applications'
    },
    {
      id: '3',
      title: 'Rajiv Gandhi Khel Ratna Award',
      category: 'recognition',
      amount: '₹25,00,000 cash prize',
      eligibility: 'Outstanding performance in sports over 4 years',
      description: 'Highest sporting honor in India for exceptional athletes.',
      howToApply: 'Nominated by Sports Federation or State Government.',
      documents: ['Performance records', 'Recommendation letters', 'Medical certificates'],
      deadline: 'May 31 annually'
    },
    {
      id: '4',
      title: 'Travel Reimbursement for Competitions',
      category: 'travel',
      amount: 'Full travel expenses',
      eligibility: 'Athletes representing India in international competitions',
      description: 'Complete reimbursement of travel, accommodation, and meal expenses.',
      howToApply: 'Apply through respective Sports Federation before travel.',
      documents: ['Competition invitation', 'Travel receipts', 'Performance report'],
      deadline: '30 days before competition'
    },
    {
      id: '5',
      title: 'Equipment Subsidy Scheme',
      category: 'equipment',
      amount: 'Up to ₹50,000',
      eligibility: 'Certified para-athletes with income below ₹3 lakhs',
      description: 'Subsidy for purchasing adaptive sports equipment and prosthetics.',
      howToApply: 'Apply through District Sports Officer with income certificate.',
      documents: ['Income certificate', 'Disability certificate', 'Equipment quotation'],
      deadline: 'Ongoing applications'
    }
  ];

  const disabilityRights = [
    {
      id: '1',
      title: 'Rights of Persons with Disabilities Act, 2016',
      category: 'legal',
      description: 'Comprehensive law ensuring equal rights and opportunities for disabled persons.',
      keyPoints: [
        '21 types of disabilities recognized',
        'Reservation in education and employment',
        'Accessibility in public buildings',
        'Free education up to 18 years',
        'Legal capacity and equal recognition'
      ],
      helpline: '1800-233-5956'
    },
    {
      id: '2',
      title: 'Sports Participation Rights',
      category: 'sports',
      description: 'Equal opportunity to participate in sports and physical activities.',
      keyPoints: [
        'Access to sports facilities',
        'Adaptive equipment provision',
        'Qualified coaching support',
        'Competition opportunities',
        'Anti-discrimination protection'
      ],
      helpline: '1800-180-1551'
    },
    {
      id: '3',
      title: 'Travel and Transport Rights',
      category: 'transport',
      description: 'Concessions and accessibility in public transportation.',
      keyPoints: [
        '75% discount in Indian Railways',
        '50% discount in air travel (some airlines)',
        'Reserved parking spaces',
        'Wheelchair accessible transport',
        'Companion travel allowance'
      ],
      helpline: '139 (Railway Helpline)'
    }
  ];

  const tournaments = [
    {
      id: '1',
      title: 'National Para Athletics Championship',
      date: '2024-03-15 to 2024-03-18',
      location: 'New Delhi',
      sports: ['Athletics', 'Track & Field'],
      registrationDeadline: '2024-02-28',
      eligibility: 'National level para-athletes with valid classification',
      contact: 'para-athletics@sai.gov.in',
      fee: '₹500'
    },
    {
      id: '2',
      title: 'All India Para Swimming Championship',
      date: '2024-04-10 to 2024-04-13',
      location: 'Bangalore',
      sports: ['Swimming'],
      registrationDeadline: '2024-03-25',
      eligibility: 'State level swimmers with medical classification',
      contact: 'swimming@pci.org.in',
      fee: '₹750'
    },
    {
      id: '3',
      title: 'Wheelchair Basketball League',
      date: '2024-05-01 to 2024-05-15',
      location: 'Mumbai',
      sports: ['Basketball'],
      registrationDeadline: '2024-04-15',
      eligibility: 'Team registration with minimum 8 players',
      contact: 'basketball@disabilitysports.in',
      fee: '₹2000 per team'
    }
  ];

  const renderSchemeCard = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => showSchemeDetails(item)}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <View style={[styles.categoryTag, styles[`${item.category}Tag`]]}>
          <Text style={styles.categoryText}>{item.category.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.amount}>{item.amount}</Text>
      <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.deadline}>Deadline: {item.deadline}</Text>
        <Ionicons name="chevron-forward" size={16} color="#666" />
      </View>
    </TouchableOpacity>
  );

  const renderRightCard = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => showRightDetails(item)}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <View style={styles.helplineTag}>
          <Ionicons name="call" size={12} color="#fff" />
          <Text style={styles.helplineText}>Helpline</Text>
        </View>
      </View>
      <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      <Text style={styles.helpline}>📞 {item.helpline}</Text>
    </TouchableOpacity>
  );

  const renderTournamentCard = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => showTournamentDetails(item)}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.fee}>{item.fee}</Text>
      </View>
      <Text style={styles.tournamentDate}>📅 {item.date}</Text>
      <Text style={styles.tournamentLocation}>📍 {item.location}</Text>
      <Text style={styles.deadline}>Registration: {item.registrationDeadline}</Text>
    </TouchableOpacity>
  );

  const showSchemeDetails = (scheme) => {
    Alert.alert(
      scheme.title,
      `Amount: ${scheme.amount}\n\nEligibility: ${scheme.eligibility}\n\nHow to Apply: ${scheme.howToApply}\n\nRequired Documents:\n${scheme.documents.map(doc => `• ${doc}`).join('\n')}\n\nDeadline: ${scheme.deadline}`,
      [
        { text: 'Apply Now', onPress: () => Alert.alert('Redirect', 'Opening application portal...') },
        { text: 'Close' }
      ]
    );
  };

  const showRightDetails = (right) => {
    Alert.alert(
      right.title,
      `${right.description}\n\nKey Rights:\n${right.keyPoints.map(point => `• ${point}`).join('\n')}\n\nHelpline: ${right.helpline}`,
      [
        { text: 'Call Helpline', onPress: () => Alert.alert('Calling', `Dialing ${right.helpline}...`) },
        { text: 'Close' }
      ]
    );
  };

  const showTournamentDetails = (tournament) => {
    Alert.alert(
      tournament.title,
      `Date: ${tournament.date}\nLocation: ${tournament.location}\nSports: ${tournament.sports.join(', ')}\n\nEligibility: ${tournament.eligibility}\nFee: ${tournament.fee}\nRegistration Deadline: ${tournament.registrationDeadline}\n\nContact: ${tournament.contact}`,
      [
        { text: 'Register', onPress: () => Alert.alert('Registration', 'Opening registration form...') },
        { text: 'Close' }
      ]
    );
  };

  const SchemesTab = (
    <FlatList
      data={governmentSchemes}
      renderItem={renderSchemeCard}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
    />
  );

  const RightsTab = (
    <FlatList
      data={disabilityRights}
      renderItem={renderRightCard}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
    />
  );

  const TournamentsTab = (
    <FlatList
      data={tournaments}
      renderItem={renderTournamentCard}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
    />
  );

  const DocumentsTab = (
    <ScrollView style={styles.documentsContainer} contentContainerStyle={styles.listContainer}>
      <Text style={styles.sectionTitle}>Essential Documents</Text>
      
      <TouchableOpacity style={styles.documentCard} onPress={() => Alert.alert('Document Info', 'Disability Certificate is issued by medical authorities certifying your disability percentage and type.')}>
        <Ionicons name="document-text" size={24} color="#2563eb" />
        <View style={styles.documentInfo}>
          <Text style={styles.documentTitle}>Disability Certificate</Text>
          <Text style={styles.documentDesc}>Required for all schemes and rights</Text>
        </View>
        <Ionicons name="cloud-upload" size={20} color="#666" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.documentCard} onPress={() => Alert.alert('Document Info', 'Athlete Registration Card from your respective Sports Federation.')}>
        <Ionicons name="card" size={24} color="#10b981" />
        <View style={styles.documentInfo}>
          <Text style={styles.documentTitle}>Athlete Registration Card</Text>
          <Text style={styles.documentDesc}>Sports federation membership</Text>
        </View>
        <Ionicons name="cloud-upload" size={20} color="#666" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.documentCard} onPress={() => Alert.alert('Document Info', 'Medical reports supporting your disability and fitness for sports.')}>
        <Ionicons name="medical" size={24} color="#f59e0b" />
        <View style={styles.documentInfo}>
          <Text style={styles.documentTitle}>Medical Reports</Text>
          <Text style={styles.documentDesc}>Health and fitness certificates</Text>
        </View>
        <Ionicons name="cloud-upload" size={20} color="#666" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.documentCard} onPress={() => Alert.alert('Document Info', 'Income certificate for financial assistance schemes.')}>
        <Ionicons name="receipt" size={24} color="#ef4444" />
        <View style={styles.documentInfo}>
          <Text style={styles.documentTitle}>Income Certificate</Text>
          <Text style={styles.documentDesc}>For financial assistance eligibility</Text>
        </View>
        <Ionicons name="cloud-upload" size={20} color="#666" />
      </TouchableOpacity>

      <Text style={styles.uploadNote}>
        📱 Tap any document to upload and store securely in your digital locker
      </Text>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Knowledge Hub</Text>
        <Text style={styles.headerSubtitle}>Government schemes, rights & tournaments</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'schemes' && styles.activeTab]}
          onPress={() => setActiveTab('schemes')}
        >
          <Ionicons name="wallet" size={18} color={activeTab === 'schemes' ? '#2563eb' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'schemes' && styles.activeTabText]}>Schemes</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'rights' && styles.activeTab]}
          onPress={() => setActiveTab('rights')}
        >
          <Ionicons name="shield-checkmark" size={18} color={activeTab === 'rights' ? '#2563eb' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'rights' && styles.activeTabText]}>Rights</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'tournaments' && styles.activeTab]}
          onPress={() => setActiveTab('tournaments')}
        >
          <Ionicons name="trophy" size={18} color={activeTab === 'tournaments' ? '#2563eb' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'tournaments' && styles.activeTabText]}>Tournaments</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'documents' && styles.activeTab]}
          onPress={() => setActiveTab('documents')}
        >
          <Ionicons name="folder" size={18} color={activeTab === 'documents' ? '#2563eb' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'documents' && styles.activeTabText]}>Documents</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'schemes' && SchemesTab}
      {activeTab === 'rights' && RightsTab}
      {activeTab === 'tournaments' && TournamentsTab}
      {activeTab === 'documents' && DocumentsTab}

      <BlindUserVoiceAssistant 
        navigation={navigation} 
        screenName="KnowledgeHub" 
        screenData={{
          activeTab: activeTab,
          totalSchemes: governmentSchemes.length,
          totalRights: disabilityRights.length,
          totalTournaments: tournaments.length
        }}
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 6,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#2563eb',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
    marginRight: 8,
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  fundingTag: {
    backgroundColor: '#10b981',
  },
  recognitionTag: {
    backgroundColor: '#f59e0b',
  },
  travelTag: {
    backgroundColor: '#2563eb',
  },
  equipmentTag: {
    backgroundColor: '#8b5cf6',
  },
  categoryText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2563eb',
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deadline: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '500',
  },
  helplineTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  helplineText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  helpline: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
  fee: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563eb',
  },
  tournamentDate: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  tournamentLocation: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  documentsContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  documentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  documentDesc: {
    fontSize: 13,
    color: '#64748b',
  },
  uploadNote: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
});
