import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSimpleLanguage, SUPPORTED_LANGUAGES } from '../context/SimpleLanguageContext';

export default function SimpleLanguageToggle({ style, showLabel = false }) {
  const { currentLanguage, changeLanguage, getLanguageName } = useSimpleLanguage();
  const [modalVisible, setModalVisible] = useState(false);

  const handleLanguageSelect = async (languageCode) => {
    await changeLanguage(languageCode);
    setModalVisible(false);
  };

  const renderLanguageItem = ({ item }) => {
    const isSelected = item.code === currentLanguage;
    
    return (
      <TouchableOpacity
        style={[
          styles.languageItem,
          isSelected && styles.selectedLanguageItem
        ]}
        onPress={() => handleLanguageSelect(item.code)}
      >
        <View style={styles.languageInfo}>
          <Text style={[
            styles.languageName,
            isSelected && styles.selectedLanguageName
          ]}>
            {item.nativeName}
          </Text>
          <Text style={[
            styles.languageCode,
            isSelected && styles.selectedLanguageCode
          ]}>
            {item.name}
          </Text>
        </View>
        {isSelected && (
          <Ionicons name="checkmark" size={20} color="#f97316" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.toggleButton, style]}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="language" size={20} color="#6b7280" />
        {showLabel && (
          <Text style={styles.toggleButtonText}>
            {getLanguageName(currentLanguage)}
          </Text>
        )}
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Select Language
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={SUPPORTED_LANGUAGES}
              renderItem={renderLanguageItem}
              keyExtractor={(item) => item.code}
              style={styles.languageList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

// Compact version for headers
export function CompactSimpleLanguageToggle({ style }) {
  const { currentLanguage, changeLanguage } = useSimpleLanguage();
  
  const getNextLanguage = () => {
    const currentIndex = SUPPORTED_LANGUAGES.findIndex(lang => lang.code === currentLanguage);
    const nextIndex = (currentIndex + 1) % SUPPORTED_LANGUAGES.length;
    return SUPPORTED_LANGUAGES[nextIndex].code;
  };

  const handleToggle = () => {
    const nextLang = getNextLanguage();
    changeLanguage(nextLang);
  };

  const getCurrentLanguageDisplay = () => {
    const lang = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage);
    return lang ? lang.nativeName.substring(0, 3).toUpperCase() : 'EN';
  };

  return (
    <TouchableOpacity
      style={[styles.compactToggle, style]}
      onPress={handleToggle}
    >
      <Text style={styles.compactToggleText}>
        {getCurrentLanguageDisplay()}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  toggleButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  languageList: {
    paddingHorizontal: 20,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
  },
  selectedLanguageItem: {
    backgroundColor: '#fef3e2',
    borderWidth: 1,
    borderColor: '#f97316',
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  selectedLanguageName: {
    color: '#f97316',
  },
  languageCode: {
    fontSize: 14,
    color: '#6b7280',
  },
  selectedLanguageCode: {
    color: '#ea580c',
  },
  compactToggle: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#f97316',
    minWidth: 40,
    alignItems: 'center',
  },
  compactToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
});
