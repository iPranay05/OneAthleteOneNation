import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useInjury } from '../../context/InjuryContext';
import LanguageToggle from '../../components/LanguageToggle';

export default function InjuryReport({ route, navigation }) {
  const { t } = useTranslation();
  const { athlete } = route.params;
  const { reportInjury, analyzeSymptoms, loading } = useInjury();

  const [injuryData, setInjuryData] = useState({
    athleteId: athlete.id,
    athleteName: athlete.name,
    type: '',
    location: '',
    severity: 5,
    description: '',
    mechanism: '',
    symptoms: [],
    dateOccurred: new Date().toISOString().split('T')[0],
    timeOccurred: new Date().toTimeString().split(' ')[0].substring(0, 5)
  });

  const [currentSymptom, setCurrentSymptom] = useState({
    area: '',
    description: '',
    severity: 5,
    duration: ''
  });

  const [showSymptomModal, setShowSymptomModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [symptomAnalysis, setSymptomAnalysis] = useState(null);

  const injuryTypes = [
    'Muscle Strain', 'Ligament Sprain', 'Tendon Injury', 'Fracture',
    'Dislocation', 'Concussion', 'Contusion', 'Overuse Injury',
    'Joint Injury', 'Nerve Injury', 'Other'
  ];

  const bodyParts = [
    'Head/Neck', 'Shoulder', 'Arm', 'Elbow', 'Wrist/Hand',
    'Chest', 'Back', 'Abdomen', 'Hip', 'Thigh',
    'Knee', 'Shin/Calf', 'Ankle', 'Foot', 'Other'
  ];

  const mechanisms = [
    'Contact with opponent', 'Contact with equipment', 'Fall',
    'Overuse/Repetitive motion', 'Non-contact twist/turn',
    'Sudden acceleration/deceleration', 'Collision', 'Other'
  ];

  const handleAddSymptom = () => {
    if (!currentSymptom.area || !currentSymptom.description) {
      Alert.alert(t('common.error'), t('injury.fillSymptomFields'));
      return;
    }

    const newSymptom = {
      id: Date.now().toString(),
      ...currentSymptom
    };

    setInjuryData(prev => ({
      ...prev,
      symptoms: [...prev.symptoms, newSymptom]
    }));

    setCurrentSymptom({
      area: '',
      description: '',
      severity: 5,
      duration: ''
    });

    setShowSymptomModal(false);
  };

  const handleRemoveSymptom = (symptomId) => {
    setInjuryData(prev => ({
      ...prev,
      symptoms: prev.symptoms.filter(s => s.id !== symptomId)
    }));
  };

  const handleAnalyzeSymptoms = async () => {
    if (injuryData.symptoms.length === 0) {
      Alert.alert(t('common.error'), t('injury.addSymptomsFirst'));
      return;
    }

    try {
      const analysis = await analyzeSymptoms(injuryData.symptoms, athlete);
      setSymptomAnalysis(analysis);
      setShowAnalysisModal(true);
    } catch (error) {
      Alert.alert(t('common.error'), t('injury.analysisError'));
    }
  };

  const handleSubmitReport = async () => {
    if (!injuryData.type || !injuryData.location || !injuryData.description) {
      Alert.alert(t('common.error'), t('injury.fillRequiredFields'));
      return;
    }

    try {
      await reportInjury(injuryData);
      
      Alert.alert(
        t('common.success'),
        t('injury.reportSubmitted'),
        [
          {
            text: t('common.ok'),
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      Alert.alert(t('common.error'), t('injury.reportError'));
    }
  };

  const renderSeveritySelector = (value, onChange) => (
    <View style={styles.severityContainer}>
      <Text style={styles.severityLabel}>{t('injury.severity')}: {value}/10</Text>
      <View style={styles.severitySlider}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
          <TouchableOpacity
            key={num}
            style={[
              styles.severityButton,
              value === num && styles.activeSeverityButton,
              num <= 3 && { backgroundColor: '#10b981' },
              num >= 4 && num <= 6 && { backgroundColor: '#f59e0b' },
              num >= 7 && { backgroundColor: '#ef4444' }
            ]}
            onPress={() => onChange(num)}
          >
            <Text style={[
              styles.severityButtonText,
              value === num && styles.activeSeverityButtonText
            ]}>
              {num}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSelector = (title, options, value, onChange) => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorTitle}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
        {options.map(option => (
          <TouchableOpacity
            key={option}
            style={[
              styles.selectorOption,
              value === option && styles.activeSelectorOption
            ]}
            onPress={() => onChange(option)}
          >
            <Text style={[
              styles.selectorOptionText,
              value === option && styles.activeSelectorOptionText
            ]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>{t('injury.reportInjury')}</Text>
          <LanguageToggle showLabel={false} />
        </View>

        {/* Athlete Info */}
        <View style={styles.athleteInfo}>
          <Text style={styles.athleteName}>{athlete.name}</Text>
          <Text style={styles.athleteDetails}>{athlete.sport} • {athlete.disability}</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('injury.basicInformation')}</Text>
            
            {renderSelector(
              t('injury.injuryType'),
              injuryTypes,
              injuryData.type,
              (type) => setInjuryData(prev => ({ ...prev, type }))
            )}

            {renderSelector(
              t('injury.bodyPart'),
              bodyParts,
              injuryData.location,
              (location) => setInjuryData(prev => ({ ...prev, location }))
            )}

            {renderSeveritySelector(
              injuryData.severity,
              (severity) => setInjuryData(prev => ({ ...prev, severity }))
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('injury.description')} *</Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                placeholder={t('injury.descriptionPlaceholder')}
                value={injuryData.description}
                onChangeText={(description) => setInjuryData(prev => ({ ...prev, description }))}
                multiline
                numberOfLines={4}
              />
            </View>

            {renderSelector(
              t('injury.mechanism'),
              mechanisms,
              injuryData.mechanism,
              (mechanism) => setInjuryData(prev => ({ ...prev, mechanism }))
            )}
          </View>

          {/* Date and Time */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('injury.whenDidItHappen')}</Text>
            
            <View style={styles.dateTimeContainer}>
              <View style={styles.dateContainer}>
                <Text style={styles.inputLabel}>{t('injury.date')}</Text>
                <TextInput
                  style={styles.textInput}
                  value={injuryData.dateOccurred}
                  onChangeText={(dateOccurred) => setInjuryData(prev => ({ ...prev, dateOccurred }))}
                  placeholder="YYYY-MM-DD"
                />
              </View>
              
              <View style={styles.timeContainer}>
                <Text style={styles.inputLabel}>{t('injury.time')}</Text>
                <TextInput
                  style={styles.textInput}
                  value={injuryData.timeOccurred}
                  onChangeText={(timeOccurred) => setInjuryData(prev => ({ ...prev, timeOccurred }))}
                  placeholder="HH:MM"
                />
              </View>
            </View>
          </View>

          {/* Symptoms */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('injury.symptoms')}</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowSymptomModal(true)}
              >
                <Ionicons name="add" size={20} color="#f97316" />
                <Text style={styles.addButtonText}>{t('injury.addSymptom')}</Text>
              </TouchableOpacity>
            </View>

            {injuryData.symptoms.map(symptom => (
              <View key={symptom.id} style={styles.symptomCard}>
                <View style={styles.symptomInfo}>
                  <Text style={styles.symptomArea}>{symptom.area}</Text>
                  <Text style={styles.symptomDescription}>{symptom.description}</Text>
                  <Text style={styles.symptomDetails}>
                    {t('injury.severity')}: {symptom.severity}/10 • {t('injury.duration')}: {symptom.duration}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveSymptom(symptom.id)}
                >
                  <Ionicons name="close" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}

            {injuryData.symptoms.length > 0 && (
              <TouchableOpacity
                style={styles.analyzeButton}
                onPress={handleAnalyzeSymptoms}
              >
                <Ionicons name="analytics" size={20} color="#ffffff" />
                <Text style={styles.analyzeButtonText}>{t('injury.analyzeSymptoms')}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmitReport}
          >
            <Text style={styles.submitButtonText}>{t('injury.submitReport')}</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Add Symptom Modal */}
        <Modal
          visible={showSymptomModal}
          transparent
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('injury.addSymptom')}</Text>
                <TouchableOpacity onPress={() => setShowSymptomModal(false)}>
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t('injury.affectedArea')}</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder={t('injury.areaPlaceholder')}
                  value={currentSymptom.area}
                  onChangeText={(area) => setCurrentSymptom(prev => ({ ...prev, area }))}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t('injury.symptomDescription')}</Text>
                <TextInput
                  style={[styles.textInput, styles.multilineInput]}
                  placeholder={t('injury.symptomPlaceholder')}
                  value={currentSymptom.description}
                  onChangeText={(description) => setCurrentSymptom(prev => ({ ...prev, description }))}
                  multiline
                  numberOfLines={3}
                />
              </View>

              {renderSeveritySelector(
                currentSymptom.severity,
                (severity) => setCurrentSymptom(prev => ({ ...prev, severity }))
              )}

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t('injury.duration')}</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder={t('injury.durationPlaceholder')}
                  value={currentSymptom.duration}
                  onChangeText={(duration) => setCurrentSymptom(prev => ({ ...prev, duration }))}
                />
              </View>

              <TouchableOpacity
                style={styles.modalSubmitButton}
                onPress={handleAddSymptom}
              >
                <Text style={styles.modalSubmitButtonText}>{t('injury.addSymptom')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Symptom Analysis Modal */}
        <Modal
          visible={showAnalysisModal}
          transparent
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('injury.symptomAnalysis')}</Text>
                <TouchableOpacity onPress={() => setShowAnalysisModal(false)}>
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>

              {symptomAnalysis && (
                <ScrollView style={styles.analysisContent}>
                  <View style={[styles.urgencyBadge, {
                    backgroundColor: symptomAnalysis.urgency === 'Immediate' ? '#fee2e2' :
                                   symptomAnalysis.urgency === 'Urgent' ? '#fef3c7' : '#dcfce7'
                  }]}>
                    <Text style={[styles.urgencyText, {
                      color: symptomAnalysis.urgency === 'Immediate' ? '#dc2626' :
                             symptomAnalysis.urgency === 'Urgent' ? '#d97706' : '#16a34a'
                    }]}>
                      {t('injury.urgency')}: {symptomAnalysis.urgency}
                    </Text>
                  </View>

                  <View style={styles.analysisSection}>
                    <Text style={styles.analysisSectionTitle}>{t('injury.possibleConditions')}</Text>
                    {symptomAnalysis.possibleConditions?.map((condition, index) => (
                      <Text key={index} style={styles.analysisItem}>• {condition}</Text>
                    ))}
                  </View>

                  <View style={styles.analysisSection}>
                    <Text style={styles.analysisSectionTitle}>{t('injury.immediateCare')}</Text>
                    {symptomAnalysis.immediateCare?.map((care, index) => (
                      <Text key={index} style={styles.analysisItem}>• {care}</Text>
                    ))}
                  </View>

                  <View style={styles.analysisSection}>
                    <Text style={styles.analysisSectionTitle}>{t('injury.seekMedicalAttention')}</Text>
                    <Text style={styles.analysisItem}>{symptomAnalysis.seekMedicalAttention}</Text>
                  </View>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>

        {/* Loading Overlay */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#f97316" />
            <Text style={styles.loadingText}>{t('injury.analyzing')}</Text>
          </View>
        )}
      </View>
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
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  athleteInfo: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  athleteName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  athleteDetails: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectorContainer: {
    marginBottom: 20,
  },
  selectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  selectorScroll: {
    flexDirection: 'row',
  },
  selectorOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activeSelectorOption: {
    backgroundColor: '#f97316',
    borderColor: '#f97316',
  },
  selectorOptionText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeSelectorOptionText: {
    color: '#ffffff',
  },
  severityContainer: {
    marginBottom: 20,
  },
  severityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  severitySlider: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  severityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activeSeverityButton: {
    borderColor: '#ffffff',
    borderWidth: 2,
  },
  severityButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  activeSeverityButtonText: {
    color: '#ffffff',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateContainer: {
    flex: 1,
    marginRight: 8,
  },
  timeContainer: {
    flex: 1,
    marginLeft: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#f97316',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  symptomCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  symptomInfo: {
    flex: 1,
  },
  symptomArea: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  symptomDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  symptomDetails: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  removeButton: {
    padding: 4,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  analyzeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: '#f97316',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 20,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  modalSubmitButton: {
    backgroundColor: '#f97316',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  modalSubmitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  analysisContent: {
    maxHeight: 400,
  },
  urgencyBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  urgencyText: {
    fontSize: 14,
    fontWeight: '600',
  },
  analysisSection: {
    marginBottom: 16,
  },
  analysisSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  analysisItem: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
    lineHeight: 20,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 12,
  },
});
