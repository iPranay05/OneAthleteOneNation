import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image, FlatList, Modal } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import BlindUserVoiceAssistant from '../../components/BlindUserVoiceAssistant';

export default function EquipmentMarketplace({ navigation }) {
  const [activeTab, setActiveTab] = useState('browse'); // browse | sell | rent | my-listings
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showListingModal, setShowListingModal] = useState(false);
  
  // Mock equipment data
  const [equipmentListings, setEquipmentListings] = useState([
    {
      id: '1',
      title: 'Racing Wheelchair - Ultra Light',
      category: 'wheelchair',
      price: 1200,
      type: 'sale',
      condition: 'excellent',
      location: 'Mumbai, India',
      seller: 'Priya Sharma',
      sellerRating: 4.8,
      description: 'Professional racing wheelchair, barely used. Perfect for track events.',
      images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxObiJTYottXrQiq-lCFJFUStrIoh7qdkII5fnjisjRrfGkn-hRMECrHz1_fGwv-ONwniZPSRY3Ow5PqtAC195os1YbeXPsEoddJ34mQ'],
      disability: 'mobility',
      sport: 'athletics'
    },
    {
      id: '2',
      title: 'Prosthetic Running Blade',
      category: 'prosthetic',
      price: 80,
      type: 'rent',
      condition: 'good',
      location: 'Delhi, India',
      seller: 'Arjun Patel',
      sellerRating: 4.9,
      description: 'Carbon fiber running blade for sprint training. Available for weekly rental.',
      images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMAGYfKGffvNZvCJxBTHflY0r9dJMeny9_HQ&s'],
      disability: 'amputee',
      sport: 'running'
    },
    {
      id: '3',
      title: 'Adaptive Swimming Fins',
      category: 'swimming',
      price: 45,
      type: 'sale',
      condition: 'new',
      location: 'Bangalore, India',
      seller: 'Kavya Reddy',
      sellerRating: 4.7,
      description: 'Specially designed fins for swimmers with limb differences.',
      images: ['https://m.media-amazon.com/images/I/61IKll3W5oL._UF894,1000_QL80_.jpg'],
      disability: 'limb_difference',
      sport: 'swimming'
    },
    {
      id: '4',
      title: 'Smart Guide Dog Harness',
      category: 'vision',
      price: 150,
      type: 'sale',
      condition: 'good',
      location: 'Chennai, India',
      seller: 'Rajesh Kumar',
      sellerRating: 4.6,
      description: 'GPS-enabled guide dog harness with vibration feedback for navigation.',
      images: ['https://via.placeholder.com/300x200'],
      disability: 'vision',
      sport: 'general'
    },
    {
      id: '5',
      title: 'Basketball Wheelchair',
      category: 'wheelchair',
      price: 200,
      type: 'rent',
      condition: 'excellent',
      location: 'Pune, India',
      seller: 'Meera Singh',
      sellerRating: 4.9,
      description: 'Professional basketball wheelchair with anti-tip wheels and quick release.',
      images: ['https://via.placeholder.com/300x200'],
      disability: 'mobility',
      sport: 'basketball'
    },
    {
      id: '6',
      title: 'Waterproof Hearing Aids',
      category: 'hearing',
      price: 60,
      type: 'rent',
      condition: 'excellent',
      location: 'Hyderabad, India',
      seller: 'Suresh Nair',
      sellerRating: 4.8,
      description: 'Waterproof hearing aids perfect for swimming and water sports.',
      images: ['https://via.placeholder.com/300x200'],
      disability: 'hearing',
      sport: 'swimming'
    },
    {
      id: '7',
      title: 'Adaptive Tennis Racket',
      category: 'other',
      price: 85,
      type: 'sale',
      condition: 'good',
      location: 'Kolkata, India',
      seller: 'Anita Das',
      sellerRating: 4.5,
      description: 'Lightweight tennis racket with extended grip for players with limited mobility.',
      images: ['https://via.placeholder.com/300x200'],
      disability: 'mobility',
      sport: 'tennis'
    },
    {
      id: '8',
      title: 'Prosthetic Arm - Myoelectric',
      category: 'prosthetic',
      price: 2500,
      type: 'sale',
      condition: 'excellent',
      location: 'Mumbai, India',
      seller: 'Dr. Vikram Shah',
      sellerRating: 5.0,
      description: 'Advanced myoelectric prosthetic arm with multiple grip patterns.',
      images: ['https://via.placeholder.com/300x200'],
      disability: 'amputee',
      sport: 'general'
    },
    {
      id: '9',
      title: 'Adaptive Ski Equipment Set',
      category: 'other',
      price: 300,
      type: 'rent',
      condition: 'good',
      location: 'Shimla, India',
      seller: 'Mountain Sports Co.',
      sellerRating: 4.7,
      description: 'Complete adaptive skiing set with sit-ski and outriggers for disabled skiers.',
      images: ['https://via.placeholder.com/300x200'],
      disability: 'mobility',
      sport: 'skiing'
    },
    {
      id: '10',
      title: 'Braille Sports Watch',
      category: 'vision',
      price: 120,
      type: 'sale',
      condition: 'new',
      location: 'Jaipur, India',
      seller: 'Tech Accessibility',
      sellerRating: 4.8,
      description: 'Talking sports watch with Braille display for timing and lap counting.',
      images: ['https://via.placeholder.com/300x200'],
      disability: 'vision',
      sport: 'athletics'
    },
    {
      id: '11',
      title: 'Adaptive Cycling Handlebars',
      category: 'other',
      price: 95,
      type: 'sale',
      condition: 'excellent',
      location: 'Goa, India',
      seller: 'Cycle Adapt India',
      sellerRating: 4.6,
      description: 'Ergonomic handlebars for cyclists with limited grip strength or arm mobility.',
      images: ['https://via.placeholder.com/300x200'],
      disability: 'mobility',
      sport: 'cycling'
    },
    {
      id: '12',
      title: 'Swimming Pool Lift Chair',
      category: 'swimming',
      price: 180,
      type: 'rent',
      condition: 'good',
      location: 'Kochi, India',
      seller: 'AquaAccess',
      sellerRating: 4.9,
      description: 'Portable pool lift for safe water entry and exit for wheelchair users.',
      images: ['https://via.placeholder.com/300x200'],
      disability: 'mobility',
      sport: 'swimming'
    },
    {
      id: '13',
      title: 'Tactile Soccer Ball',
      category: 'vision',
      price: 35,
      type: 'sale',
      condition: 'new',
      location: 'Lucknow, India',
      seller: 'Blind Sports India',
      sellerRating: 4.7,
      description: 'Sound-enabled soccer ball with bells for visually impaired players.',
      images: ['https://via.placeholder.com/300x200'],
      disability: 'vision',
      sport: 'football'
    },
    {
      id: '14',
      title: 'Adaptive Archery Equipment',
      category: 'other',
      price: 220,
      type: 'sale',
      condition: 'excellent',
      location: 'Chandigarh, India',
      seller: 'Precision Sports',
      sellerRating: 4.8,
      description: 'Complete archery set with mouth tab and adaptive release for disabled archers.',
      images: ['https://via.placeholder.com/300x200'],
      disability: 'mobility',
      sport: 'archery'
    },
    {
      id: '15',
      title: 'Vibrating Alarm Clock',
      category: 'hearing',
      price: 40,
      type: 'sale',
      condition: 'good',
      location: 'Ahmedabad, India',
      seller: 'Deaf Sports Club',
      sellerRating: 4.5,
      description: 'Bed shaker alarm clock for deaf athletes to maintain training schedules.',
      images: ['https://via.placeholder.com/300x200'],
      disability: 'hearing',
      sport: 'general'
    }
  ]);

  // New listing form
  const [newListing, setNewListing] = useState({
    title: '',
    category: 'wheelchair',
    price: '',
    type: 'sale',
    condition: 'good',
    description: '',
    disability: 'mobility',
    sport: 'athletics',
    images: []
  });

  const categories = [
    { id: 'all', name: 'All Equipment', icon: 'grid' },
    { id: 'wheelchair', name: 'Wheelchairs', icon: 'accessibility' },
    { id: 'prosthetic', name: 'Prosthetics', icon: 'body' },
    { id: 'swimming', name: 'Swimming', icon: 'water' },
    { id: 'vision', name: 'Vision Aids', icon: 'eye' },
    { id: 'hearing', name: 'Hearing Aids', icon: 'ear' },
    { id: 'other', name: 'Other', icon: 'ellipsis-horizontal' }
  ];

  const filteredListings = equipmentListings.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setNewListing(prev => ({
        ...prev,
        images: [...prev.images, result.assets[0].uri]
      }));
    }
  };

  const submitListing = () => {
    if (!newListing.title || !newListing.price || !newListing.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const listing = {
      ...newListing,
      id: Date.now().toString(),
      seller: 'You',
      sellerRating: 5.0,
      location: 'Your Location',
      images: newListing.images.length > 0 ? newListing.images : ['https://via.placeholder.com/300x200']
    };

    setEquipmentListings(prev => [listing, ...prev]);
    setNewListing({
      title: '',
      category: 'wheelchair',
      price: '',
      type: 'sale',
      condition: 'good',
      description: '',
      disability: 'mobility',
      sport: 'athletics',
      images: []
    });
    setShowListingModal(false);
    Alert.alert('Success', 'Your listing has been posted!');
  };

  const handleBuyItem = (item) => {
    Alert.alert(
      `${item.type === 'rent' ? 'Rent' : 'Buy'} Equipment`,
      `Would you like to ${item.type === 'rent' ? 'rent' : 'purchase'} "${item.title}" for ₹${item.price}${item.type === 'rent' ? '/week' : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Contact Seller', onPress: () => contactSeller(item) },
        { text: item.type === 'rent' ? 'Rent Now' : 'Buy Now', onPress: () => processPurchase(item) }
      ]
    );
  };

  const contactSeller = (item) => {
    Alert.alert(
      'Contact Seller',
      `Seller: ${item.seller}\nLocation: ${item.location}\nRating: ${item.sellerRating}⭐\n\nThis will open your messaging app to contact the seller.`,
      [{ text: 'OK' }]
    );
  };

  const processPurchase = (item) => {
    Alert.alert(
      'Purchase Confirmation',
      `${item.type === 'rent' ? 'Rental' : 'Purchase'} initiated for "${item.title}"\n\nAmount: ₹${item.price}${item.type === 'rent' ? '/week' : ''}\nSeller will be notified and payment gateway will open.`,
      [{ text: 'OK' }]
    );
  };

  const renderEquipmentCard = ({ item }) => (
    <TouchableOpacity style={styles.equipmentCard} onPress={() => handleBuyItem(item)}>
      <Image source={{ uri: item.images[0] }} style={styles.equipmentImage} />
      <View style={styles.equipmentInfo}>
        <View style={styles.equipmentHeader}>
          <Text style={styles.equipmentTitle} numberOfLines={2}>{item.title}</Text>
          <View style={[styles.typeTag, item.type === 'rent' ? styles.rentTag : styles.saleTag]}>
            <Text style={styles.typeText}>{item.type.toUpperCase()}</Text>
          </View>
        </View>
        
        <Text style={styles.equipmentPrice}>
          ₹{item.price} {item.type === 'rent' ? '/week' : ''}
        </Text>
        
        <Text style={styles.equipmentDescription} numberOfLines={3}>
          {item.description}
        </Text>
        
        <View style={styles.equipmentMeta}>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color="#666" />
            <Text style={styles.locationText} numberOfLines={1}>{item.location}</Text>
          </View>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#fbbf24" />
            <Text style={styles.ratingText}>{item.sellerRating}</Text>
          </View>
        </View>
        
        <View style={styles.tagsRow}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{item.disability}</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{item.sport}</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{item.condition}</Text>
          </View>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={() => contactSeller(item)}
          >
            <Ionicons name="chatbubble" size={16} color="#666" />
            <Text style={styles.contactButtonText}>Contact</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.buyButton, item.type === 'rent' ? styles.rentButton : styles.purchaseButton]}
            onPress={() => processPurchase(item)}
          >
            <Ionicons name={item.type === 'rent' ? 'time' : 'card'} size={16} color="#fff" />
            <Text style={styles.buyButtonText}>
              {item.type === 'rent' ? 'Rent' : 'Buy'} Now
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const BrowseTab = (
    <View style={styles.tabContent}>
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search adaptive equipment..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.categoriesContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[styles.categoryChip, selectedCategory === category.id && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Ionicons 
                name={category.icon} 
                size={16} 
                color={selectedCategory === category.id ? '#fff' : '#666'} 
              />
              <Text style={[styles.categoryText, selectedCategory === category.id && styles.categoryTextActive]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredListings}
        renderItem={renderEquipmentCard}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listingsContainer}
      />
    </View>
  );

  const SellTab = (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>List Your Equipment</Text>
      <Text style={styles.sectionSubtitle}>Help other athletes by sharing or selling your adaptive equipment</Text>
      
      <TouchableOpacity 
        style={styles.createListingButton}
        onPress={() => setShowListingModal(true)}
      >
        <Ionicons name="add-circle" size={24} color="#fff" />
        <Text style={styles.createListingText}>Create New Listing</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Your Active Listings</Text>
      {equipmentListings.filter(item => item.seller === 'You').length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="storefront-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No listings yet</Text>
          <Text style={styles.emptySubtext}>Create your first listing to help other athletes</Text>
        </View>
      ) : (
        <FlatList
          data={equipmentListings.filter(item => item.seller === 'You')}
          renderItem={renderEquipmentCard}
          keyExtractor={item => item.id}
          scrollEnabled={false}
        />
      )}
    </ScrollView>
  );

  const ListingModal = (
    <Modal visible={showListingModal} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowListingModal(false)}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>New Listing</Text>
          <TouchableOpacity onPress={submitListing}>
            <Text style={styles.postButton}>Post</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <Text style={styles.fieldLabel}>Equipment Title *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., Racing Wheelchair - Ultra Light"
            value={newListing.title}
            onChangeText={(text) => setNewListing(prev => ({ ...prev, title: text }))}
          />

          <Text style={styles.fieldLabel}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categorySelector}>
            {categories.filter(c => c.id !== 'all').map(category => (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryOption, newListing.category === category.id && styles.categoryOptionActive]}
                onPress={() => setNewListing(prev => ({ ...prev, category: category.id }))}
              >
                <Ionicons name={category.icon} size={16} color={newListing.category === category.id ? '#fff' : '#666'} />
                <Text style={[styles.categoryOptionText, newListing.category === category.id && styles.categoryOptionTextActive]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.fieldLabel}>Price (₹) *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="1200"
                keyboardType="numeric"
                value={newListing.price}
                onChangeText={(text) => setNewListing(prev => ({ ...prev, price: text }))}
              />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.fieldLabel}>Type</Text>
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[styles.toggleOption, newListing.type === 'sale' && styles.toggleOptionActive]}
                  onPress={() => setNewListing(prev => ({ ...prev, type: 'sale' }))}
                >
                  <Text style={[styles.toggleText, newListing.type === 'sale' && styles.toggleTextActive]}>Sale</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleOption, newListing.type === 'rent' && styles.toggleOptionActive]}
                  onPress={() => setNewListing(prev => ({ ...prev, type: 'rent' }))}
                >
                  <Text style={[styles.toggleText, newListing.type === 'rent' && styles.toggleTextActive]}>Rent</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <Text style={styles.fieldLabel}>Description *</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Describe the equipment condition, features, and any special notes..."
            multiline
            numberOfLines={4}
            value={newListing.description}
            onChangeText={(text) => setNewListing(prev => ({ ...prev, description: text }))}
          />

          <Text style={styles.fieldLabel}>Photos</Text>
          <TouchableOpacity style={styles.imageUpload} onPress={pickImage}>
            <Ionicons name="camera" size={24} color="#666" />
            <Text style={styles.imageUploadText}>Add Photos</Text>
          </TouchableOpacity>
          
          {newListing.images.length > 0 && (
            <ScrollView horizontal style={styles.imagePreview}>
              {newListing.images.map((uri, index) => (
                <Image key={index} source={{ uri }} style={styles.previewImage} />
              ))}
            </ScrollView>
          )}
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Equipment Marketplace</Text>
        <Text style={styles.headerSubtitle}>Adaptive sports equipment for everyone</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'browse' && styles.activeTab]}
          onPress={() => setActiveTab('browse')}
        >
          <Ionicons name="search" size={20} color={activeTab === 'browse' ? '#2563eb' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'browse' && styles.activeTabText]}>Browse</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sell' && styles.activeTab]}
          onPress={() => setActiveTab('sell')}
        >
          <Ionicons name="storefront" size={20} color={activeTab === 'sell' ? '#2563eb' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'sell' && styles.activeTabText]}>Sell/Rent</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'browse' && BrowseTab}
      {activeTab === 'sell' && SellTab}
      {ListingModal}

      <BlindUserVoiceAssistant 
        navigation={navigation} 
        screenName="EquipmentMarketplace" 
        screenData={{
          totalListings: equipmentListings.length,
          activeCategory: selectedCategory,
          searchQuery: searchQuery
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
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#2563eb',
  },
  tabContent: {
    flex: 1,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 12,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingRight: 32,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 10,
    minWidth: 80,
    justifyContent: 'center',
  },
  categoryChipActive: {
    backgroundColor: '#2563eb',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  categoryTextActive: {
    color: '#fff',
  },
  listingsContainer: {
    padding: 16,
  },
  equipmentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  equipmentImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#f8fafc',
  },
  equipmentInfo: {
    padding: 14,
  },
  equipmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  equipmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
    marginRight: 8,
    lineHeight: 20,
  },
  typeTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  saleTag: {
    backgroundColor: '#10b981',
  },
  rentTag: {
    backgroundColor: '#f59e0b',
  },
  typeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  equipmentPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2563eb',
    marginBottom: 6,
  },
  equipmentDescription: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 10,
  },
  equipmentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748b',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  contactButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  buyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  purchaseButton: {
    backgroundColor: '#10b981',
  },
  rentButton: {
    backgroundColor: '#f59e0b',
  },
  buyButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 20,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  createListingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    marginHorizontal: 20,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 12,
    marginBottom: 32,
    elevation: 2,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  createListingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#94a3b8',
    marginTop: 20,
    marginBottom: 12,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 22,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  postButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
    marginTop: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categorySelector: {
    marginBottom: 8,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    gap: 6,
  },
  categoryOptionActive: {
    backgroundColor: '#2563eb',
  },
  categoryOptionText: {
    fontSize: 14,
    color: '#666',
  },
  categoryOptionTextActive: {
    color: '#fff',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfField: {
    flex: 1,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 4,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  toggleOptionActive: {
    backgroundColor: '#2563eb',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  toggleTextActive: {
    color: '#fff',
  },
  imageUpload: {
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 24,
    alignItems: 'center',
    gap: 8,
  },
  imageUploadText: {
    fontSize: 14,
    color: '#666',
  },
  imagePreview: {
    marginTop: 12,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },
});
