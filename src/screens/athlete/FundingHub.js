import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FundingHub({ navigation }) {
  const [activeTab, setActiveTab] = useState('browse');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignGoal, setCampaignGoal] = useState('');
  const [campaignDescription, setCampaignDescription] = useState('');

  const campaigns = [
    {
      id: '1',
      title: 'Help Priya Compete in Paralympics 2024',
      athlete: 'Priya Sharma',
      sport: 'Swimming',
      disability: 'Visual Impairment',
      goal: 500000,
      raised: 325000,
      supporters: 234,
      daysLeft: 45,
      image: 'https://via.placeholder.com/300x200',
      description: 'Support Priya\'s journey to represent India in Paralympic swimming. Funds will cover training, equipment, and travel expenses.',
      verified: true
    },
    {
      id: '2',
      title: 'Adaptive Cricket Equipment for Rural Athletes',
      athlete: 'Rajesh Kumar',
      sport: 'Cricket',
      disability: 'Mobility Impairment',
      goal: 200000,
      raised: 89000,
      supporters: 156,
      daysLeft: 23,
      image: 'https://via.placeholder.com/300x200',
      description: 'Providing specialized cricket equipment to disabled athletes in rural areas who cannot afford adaptive gear.',
      verified: true
    },
    {
      id: '3',
      title: 'Training Camp for Deaf Football Team',
      athlete: 'Mumbai Deaf FC',
      sport: 'Football',
      disability: 'Hearing Impairment',
      goal: 300000,
      raised: 45000,
      supporters: 67,
      daysLeft: 60,
      image: 'https://via.placeholder.com/300x200',
      description: 'Funding intensive training camp for our deaf football team preparing for national championships.',
      verified: false
    }
  ];

  const sponsorships = [
    {
      id: '1',
      company: 'TechCorp India',
      type: 'Equipment Sponsor',
      amount: '₹2,00,000',
      sport: 'Wheelchair Basketball',
      requirements: 'National level athletes, social media presence',
      deadline: '2024-03-15',
      logo: 'https://via.placeholder.com/80x80'
    },
    {
      id: '2',
      company: 'SportGear Ltd',
      type: 'Travel & Training',
      amount: '₹5,00,000',
      sport: 'Paralympic Swimming',
      requirements: 'International competition experience',
      deadline: '2024-02-28',
      logo: 'https://via.placeholder.com/80x80'
    }
  ];

  const nftCollectibles = [
    {
      id: '1',
      title: 'Golden Victory Moment',
      athlete: 'Priya Sharma',
      price: '₹2,500',
      rarity: 'Rare',
      image: 'https://via.placeholder.com/150x150',
      description: 'Commemorating Priya\'s record-breaking swim at nationals'
    },
    {
      id: '2',
      title: 'Determination Badge',
      athlete: 'Rajesh Kumar',
      price: '₹1,200',
      rarity: 'Common',
      image: 'https://via.placeholder.com/150x150',
      description: 'Supporting adaptive sports development'
    }
  ];

  const renderCampaignCard = (campaign) => {
    const progressPercentage = (campaign.raised / campaign.goal) * 100;
    
    return (
      <View key={campaign.id} style={styles.campaignCard}>
        <Image source={{ uri: campaign.image }} style={styles.campaignImage} />
        
        <View style={styles.campaignContent}>
          <View style={styles.campaignHeader}>
            <Text style={styles.campaignTitle}>{campaign.title}</Text>
            {campaign.verified && (
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            )}
          </View>
          
          <View style={styles.athleteInfo}>
            <Ionicons name="person" size={16} color="#6b7280" />
            <Text style={styles.athleteName}>{campaign.athlete}</Text>
            <Text style={styles.sportTag}>{campaign.sport}</Text>
          </View>
          
          <Text style={styles.disabilityTag}>{campaign.disability}</Text>
          <Text style={styles.campaignDescription}>{campaign.description}</Text>
          
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
            </View>
            
            <View style={styles.campaignStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>₹{campaign.raised.toLocaleString()}</Text>
                <Text style={styles.statLabel}>raised of ₹{campaign.goal.toLocaleString()}</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{campaign.supporters}</Text>
                <Text style={styles.statLabel}>supporters</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{campaign.daysLeft}</Text>
                <Text style={styles.statLabel}>days left</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.campaignActions}>
            <TouchableOpacity style={styles.donateButton}>
              <Ionicons name="heart" size={18} color="#fff" />
              <Text style={styles.donateButtonText}>Support</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.shareButton}>
              <Ionicons name="share-social" size={18} color="#f97316" />
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderSponsorshipCard = (sponsorship) => (
    <View key={sponsorship.id} style={styles.sponsorshipCard}>
      <View style={styles.sponsorHeader}>
        <Image source={{ uri: sponsorship.logo }} style={styles.sponsorLogo} />
        <View style={styles.sponsorInfo}>
          <Text style={styles.sponsorCompany}>{sponsorship.company}</Text>
          <Text style={styles.sponsorType}>{sponsorship.type}</Text>
        </View>
        <Text style={styles.sponsorAmount}>{sponsorship.amount}</Text>
      </View>
      
      <Text style={styles.sponsorSport}>Sport: {sponsorship.sport}</Text>
      <Text style={styles.sponsorRequirements}>{sponsorship.requirements}</Text>
      
      <View style={styles.sponsorFooter}>
        <Text style={styles.sponsorDeadline}>Deadline: {sponsorship.deadline}</Text>
        <TouchableOpacity style={styles.applyButton}>
          <Text style={styles.applyButtonText}>Apply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderNFTCard = (nft) => (
    <View key={nft.id} style={styles.nftCard}>
      <Image source={{ uri: nft.image }} style={styles.nftImage} />
      <Text style={styles.nftTitle}>{nft.title}</Text>
      <Text style={styles.nftAthlete}>{nft.athlete}</Text>
      <View style={styles.nftFooter}>
        <View style={styles.nftPricing}>
          <Text style={styles.nftPrice}>{nft.price}</Text>
          <Text style={[styles.nftRarity, { color: nft.rarity === 'Rare' ? '#f59e0b' : '#6b7280' }]}>
            {nft.rarity}
          </Text>
        </View>
        <TouchableOpacity style={styles.buyButton}>
          <Text style={styles.buyButtonText}>Buy</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Funding Hub</Text>
        <Text style={styles.headerSubtitle}>Support athletes, find sponsors, collect NFTs</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'browse' && styles.activeTab]}
          onPress={() => setActiveTab('browse')}
        >
          <Ionicons name="heart" size={20} color={activeTab === 'browse' ? '#f97316' : '#6b7280'} />
          <Text style={[styles.tabText, activeTab === 'browse' && styles.activeTabText]}>
            Crowdfunding
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'sponsors' && styles.activeTab]}
          onPress={() => setActiveTab('sponsors')}
        >
          <Ionicons name="business" size={20} color={activeTab === 'sponsors' ? '#f97316' : '#6b7280'} />
          <Text style={[styles.tabText, activeTab === 'sponsors' && styles.activeTabText]}>
            Sponsors
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'nft' && styles.activeTab]}
          onPress={() => setActiveTab('nft')}
        >
          <Ionicons name="diamond" size={20} color={activeTab === 'nft' ? '#f97316' : '#6b7280'} />
          <Text style={[styles.tabText, activeTab === 'nft' && styles.activeTabText]}>
            NFT Store
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'browse' && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Campaigns</Text>
              <TouchableOpacity 
                style={styles.createButton}
                onPress={() => setShowCreateModal(true)}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.createButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
            
            {campaigns.map(renderCampaignCard)}
          </View>
        )}

        {activeTab === 'sponsors' && (
          <View>
            <Text style={styles.sectionTitle}>Available Sponsorships</Text>
            {sponsorships.map(renderSponsorshipCard)}
          </View>
        )}

        {activeTab === 'nft' && (
          <View>
            <Text style={styles.sectionTitle}>Digital Collectibles</Text>
            <View style={styles.nftGrid}>
              {nftCollectibles.map(renderNFTCard)}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Create Campaign Modal */}
      <Modal visible={showCreateModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Campaign</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalForm}>
              <Text style={styles.formLabel}>Campaign Title</Text>
              <TextInput
                style={styles.formInput}
                value={campaignTitle}
                onChangeText={setCampaignTitle}
                placeholder="Enter campaign title"
              />
              
              <Text style={styles.formLabel}>Funding Goal (₹)</Text>
              <TextInput
                style={styles.formInput}
                value={campaignGoal}
                onChangeText={setCampaignGoal}
                placeholder="Enter target amount"
                keyboardType="numeric"
              />
              
              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={campaignDescription}
                onChangeText={setCampaignDescription}
                placeholder="Describe your campaign"
                multiline
                numberOfLines={4}
              />
              
              <TouchableOpacity style={styles.submitButton}>
                <Text style={styles.submitButtonText}>Create Campaign</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#fff7ed',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#f97316',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f97316',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
  },
  campaignCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  campaignImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  campaignContent: {
    padding: 20,
  },
  campaignHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  campaignTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginRight: 8,
  },
  athleteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  athleteName: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 6,
    marginRight: 12,
  },
  sportTag: {
    fontSize: 12,
    color: '#f97316',
    backgroundColor: '#fff7ed',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  disabilityTag: {
    fontSize: 12,
    color: '#8b5cf6',
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  campaignDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  campaignStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  campaignActions: {
    flexDirection: 'row',
    gap: 12,
  },
  donateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f97316',
    paddingVertical: 12,
    borderRadius: 8,
  },
  donateButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff7ed',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f97316',
  },
  shareButtonText: {
    color: '#f97316',
    fontWeight: '600',
    marginLeft: 6,
  },
  sponsorshipCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sponsorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sponsorLogo: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  sponsorInfo: {
    flex: 1,
  },
  sponsorCompany: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  sponsorType: {
    fontSize: 14,
    color: '#6b7280',
  },
  sponsorAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10b981',
  },
  sponsorSport: {
    fontSize: 14,
    color: '#f97316',
    marginBottom: 8,
  },
  sponsorRequirements: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  sponsorFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sponsorDeadline: {
    fontSize: 12,
    color: '#ef4444',
  },
  applyButton: {
    backgroundColor: '#f97316',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  nftGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nftCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  nftImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  nftTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  nftAthlete: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  nftFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nftPricing: {
    flex: 1,
  },
  nftPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  nftRarity: {
    fontSize: 12,
    fontWeight: '600',
  },
  buyButton: {
    backgroundColor: '#f97316',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  modalForm: {
    padding: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    marginTop: 16,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#f97316',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
