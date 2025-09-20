import React, { useLayoutEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { usePlans } from '../../context/PlansContext';
import { generatePlanWithAI } from '../../services/ai';
import { SafeAreaView } from 'react-native-safe-area-context';
import LanguageToggle from '../../components/LanguageToggle'; 

export default function Plans() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { coachSchedules, myPlans, addUserPlan } = usePlans();

  // State for modals and forms
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => setShowAiModal(true)}>
          <Text style={{ color: '#f97316', fontWeight: '700' }}>{t('plans.generateWithAI')}</Text>
        </TouchableOpacity>
      ),
      title: t('plans.title'),
    });
  }, [navigation, t]);

  // Functions for handling modals and form submission
  const handleAddPlan = () => {
    if (!title.trim()) return;
    
    const newPlan = {
      id: Date.now().toString(),
      title: title.trim(),
      detail: detail.trim(),
      status: t('plans.planned'),
      schedule: []
    };
    
    addUserPlan(newPlan);
    setTitle('');
    setDetail('');
    setShowAddModal(false);
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) return;
    
    setLoading(true);
    try {
      const generatedPlan = await generatePlanWithAI(aiPrompt);
      addUserPlan(generatedPlan);
      setAiPrompt('');
      setShowAiModal(false);
    } catch (error) {
      console.error('AI generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>  {/* ✅ SafeAreaView wrapper */}
      <View style={styles.container}>
        {/* Header with Language Toggle */}
        <View style={styles.titleHeader}>
          <Text style={styles.screenTitle}>{t('plans.title')}</Text>
          <LanguageToggle showLabel={false} />
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          {/* Coach schedules */}
          <Text style={styles.sectionTitle}>{t('plans.coachSchedules')}</Text>
          {coachSchedules.length === 0 ? (
            <View style={styles.cardMuted}>
              <Text style={styles.mutedText}>{t('plans.noSchedulesAssigned')}</Text>
            </View>
          ) : (
            coachSchedules.map((c) => (
              <View key={c.id} style={styles.card}>
                <Text style={styles.planTitle}>{c.title}</Text>
                {!!c.detail && <Text style={styles.planDetail}>{c.detail}</Text>}
                <Text style={styles.planStatus}>{c.status || t('plans.assigned')}</Text>
                {Array.isArray(c.schedule) && c.schedule.length > 0 && (
                  <View style={{ marginTop: 10 }}>
                    {c.schedule.map((d, i) => (
                      <View key={i} style={styles.dayRow}>
                        <Text style={styles.dayLabel}>{d.day || `${t('plans.day')} ${i + 1}`}</Text>
                        <View style={styles.dayItemsCol}>
                          {(d.items || []).map((it, j) => (
                            <Text key={j} style={styles.dayItem}>• {it}</Text>
                          ))}
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))
          )}

          {/* My plans */}
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>{t('plans.myPlans')}</Text>
            <TouchableOpacity onPress={() => setShowAddModal(true)}>
              <Text style={styles.linkOrange}>{t('plans.addPlan')}</Text>
            </TouchableOpacity>
          </View>

          {myPlans.length === 0 ? (
            <View style={styles.cardMuted}>
              <Text style={styles.mutedText}>{t('plans.noSavedPlans')}</Text>
            </View>
          ) : (
            myPlans.map((p) => (
              <View key={p.id} style={styles.card}>
                <Text style={styles.planTitle}>{p.title}</Text>
                {!!p.detail && <Text style={styles.planDetail}>{p.detail}</Text>}
                <Text style={styles.planStatus}>{p.status || t('plans.planned')}</Text>
                {Array.isArray(p.schedule) && p.schedule.length > 0 && (
                  <View style={{ marginTop: 10 }}>
                    {p.schedule.map((d, i) => (
                      <View key={i} style={styles.dayRow}>
                        <Text style={styles.dayLabel}>{d.day || `${t('plans.day')} ${i + 1}`}</Text>
                        <View style={styles.dayItemsCol}>
                          {(d.items || []).map((it, j) => (
                            <Text key={j} style={styles.dayItem}>• {it}</Text>
                          ))}
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>

        {/* Add Plan Modal */}
        <Modal visible={showAddModal} transparent animationType="slide">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>{t('plans.addNewPlan')}</Text>
              
              <TextInput
                style={styles.input}
                placeholder={t('plans.planTitle')}
                value={title}
                onChangeText={setTitle}
              />
              
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                placeholder={t('plans.planDescription')}
                value={detail}
                onChangeText={setDetail}
                multiline
              />
              
              <View style={styles.rowRight}>
                <TouchableOpacity 
                  style={[styles.button, styles.ghostBtn, { marginRight: 10 }]}
                  onPress={() => setShowAddModal(false)}
                >
                  <Text style={[styles.buttonText, { color: '#f97316' }]}>{t('plans.cancel')}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.button, styles.primaryBtn]}
                  onPress={handleAddPlan}
                >
                  <Text style={styles.buttonText}>{t('plans.addPlan')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* AI Generation Modal */}
        <Modal visible={showAiModal} transparent animationType="slide">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>{t('plans.generateWithAI')}</Text>
              
              <TextInput
                style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                placeholder={t('plans.aiPromptPlaceholder')}
                value={aiPrompt}
                onChangeText={setAiPrompt}
                multiline
              />
              
              <View style={styles.rowRight}>
                <TouchableOpacity 
                  style={[styles.button, styles.ghostBtn, { marginRight: 10 }]}
                  onPress={() => setShowAiModal(false)}
                >
                  <Text style={[styles.buttonText, { color: '#f97316' }]}>{t('plans.cancel')}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.button, styles.primaryBtn]}
                  onPress={handleGenerateAI}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.buttonText}>{t('plans.generate')}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff', // match container
  },
  container: { flex: 1, backgroundColor: '#ffffff', padding: 16 },
  titleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    marginBottom: 16,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  sectionTitle: { color: '#111827', fontSize: 18, fontWeight: '700', marginBottom: 8, marginTop: 4 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowRight: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 10 },
  row: { flexDirection: 'row', alignItems: 'center' },
  card: { backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderWidth: 1, borderRadius: 12, padding: 12, marginVertical: 6 },
  cardMuted: { backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderWidth: 1, borderRadius: 12, padding: 12, marginVertical: 6 },
  mutedText: { color: '#6b7280' },
  planTitle: { color: '#111827', fontSize: 16, fontWeight: '700' },
  planDetail: { color: '#6b7280', marginTop: 4 },
  planStatus: { color: '#f97316', fontWeight: '700', marginTop: 6 },
  dayRow: { flexDirection: 'row', marginTop: 6 },
  dayLabel: { width: 48, color: '#111827', fontWeight: '700' },
  dayItemsCol: { flex: 1 },
  dayItem: { color: '#111827' },
  linkOrange: { color: '#f97316', fontWeight: '700' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.15)', padding: 16, justifyContent: 'center' },
  modalCard: { backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', padding: 16 },
  modalTitle: { color: '#111827', fontSize: 18, fontWeight: '800', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: '#111827', backgroundColor: '#ffffff', marginBottom: 10 },
  button: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  primaryBtn: { backgroundColor: '#f97316' },
  ghostBtn: { backgroundColor: '#fff7ed', borderWidth: 1, borderColor: '#fdba74' },
  buttonText: { color: '#ffffff', fontWeight: '700' },
  errorText: { color: '#b91c1c', marginBottom: 6 },
});
