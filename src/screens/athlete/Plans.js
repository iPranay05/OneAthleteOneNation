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
import { usePlans } from '../../context/PlansContext';
import { generatePlanWithAI } from '../../services/ai';

export default function Plans() {
  const navigation = useNavigation();
  const { coachSchedules, myPlans, addUserPlan } = usePlans();

  // Add plan modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDetail, setNewDetail] = useState('');

  // AI modal state
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiSport, setAiSport] = useState('Track & Field');
  const [aiGoal, setAiGoal] = useState('Improve 200m sprint time');
  const [aiWeeks, setAiWeeks] = useState('4');
  const [aiDays, setAiDays] = useState('5');
  const [aiInjuries, setAiInjuries] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => setShowAiModal(true)}>
          <Text style={{ color: '#f97316', fontWeight: '700' }}>Generate with AI</Text>
        </TouchableOpacity>
      ),
      title: 'Personalized Plans',
    });
  }, [navigation]);

  const onAddPlan = () => {
    if (!newTitle.trim()) return;
    addUserPlan({ title: newTitle.trim(), detail: newDetail.trim() });
    setNewTitle('');
    setNewDetail('');
    setShowAddModal(false);
  };

  const onGenerateAI = async () => {
    setAiLoading(true);
    setAiError('');
    try {
      const weeks = Math.max(1, parseInt(aiWeeks || '4', 10) || 4);
      const daysPerWeek = Math.min(7, Math.max(1, parseInt(aiDays || '5', 10) || 5));
      const plan = await generatePlanWithAI({
        sport: aiSport || 'General',
        goal: aiGoal || 'Get fitter',
        weeks,
        daysPerWeek,
        injuries: aiInjuries || '',
      });
      addUserPlan(plan);
      setShowAiModal(false);
    } catch (e) {
      setAiError(e?.message || 'Failed to generate plan.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Coach schedules */}
        <Text style={styles.sectionTitle}>Coach Schedules</Text>
        {coachSchedules.length === 0 ? (
          <View style={styles.cardMuted}>
            <Text style={styles.mutedText}>No schedules assigned yet.</Text>
          </View>
        ) : (
          coachSchedules.map((c) => (
            <View key={c.id} style={styles.card}>
              <Text style={styles.planTitle}>{c.title}</Text>
              {!!c.detail && <Text style={styles.planDetail}>{c.detail}</Text>}
              <Text style={styles.planStatus}>{c.status || 'Assigned'}</Text>

              {Array.isArray(c.schedule) && c.schedule.length > 0 && (
                <View style={{ marginTop: 10 }}>
                  {c.schedule.map((d, i) => (
                    <View key={i} style={styles.dayRow}>
                      <Text style={styles.dayLabel}>{d.day || `Day ${i + 1}`}</Text>
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
          <Text style={styles.sectionTitle}>My Plans</Text>
          <TouchableOpacity onPress={() => setShowAddModal(true)}>
            <Text style={styles.linkOrange}>Add Plan</Text>
          </TouchableOpacity>
        </View>

        {myPlans.length === 0 ? (
          <View style={styles.cardMuted}>
            <Text style={styles.mutedText}>You have no saved plans. Add one or generate with AI.</Text>
          </View>
        ) : (
          myPlans.map((p) => (
            <View key={p.id} style={styles.card}>
              <Text style={styles.planTitle}>{p.title}</Text>
              {!!p.detail && <Text style={styles.planDetail}>{p.detail}</Text>}
              <Text style={styles.planStatus}>{p.status || 'Planned'}</Text>

              {Array.isArray(p.schedule) && p.schedule.length > 0 && (
                <View style={{ marginTop: 10 }}>
                  {p.schedule.map((d, i) => (
                    <View key={i} style={styles.dayRow}>
                      <Text style={styles.dayLabel}>{d.day || `Day ${i + 1}`}</Text>
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
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Plan</Text>
            <TextInput
              placeholder="Title"
              placeholderTextColor="#9ca3af"
              value={newTitle}
              onChangeText={setNewTitle}
              style={styles.input}
            />
            <TextInput
              placeholder="Detail (optional)"
              placeholderTextColor="#9ca3af"
              value={newDetail}
              onChangeText={setNewDetail}
              style={[styles.input, { height: 90 }]} multiline
            />
            <View style={styles.rowRight}>
              <TouchableOpacity style={[styles.button, styles.ghostBtn]} onPress={() => setShowAddModal(false)}>
                <Text style={[styles.buttonText, { color: '#f97316' }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.primaryBtn, { marginLeft: 10 }]} onPress={onAddPlan}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* AI Modal */}
      <Modal visible={showAiModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Generate with AI</Text>
            <TextInput
              placeholder="Sport (e.g., Track & Field)"
              placeholderTextColor="#9ca3af"
              value={aiSport}
              onChangeText={setAiSport}
              style={styles.input}
            />
            <TextInput
              placeholder="Goal (e.g., Improve 200m time)"
              placeholderTextColor="#9ca3af"
              value={aiGoal}
              onChangeText={setAiGoal}
              style={styles.input}
            />
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <TextInput
                  placeholder="Weeks"
                  placeholderTextColor="#9ca3af"
                  value={aiWeeks}
                  onChangeText={setAiWeeks}
                  keyboardType="number-pad"
                  style={styles.input}
                />
              </View>
              <View style={{ width: 10 }} />
              <View style={{ flex: 1 }}>
                <TextInput
                  placeholder="Days/week"
                  placeholderTextColor="#9ca3af"
                  value={aiDays}
                  onChangeText={setAiDays}
                  keyboardType="number-pad"
                  style={styles.input}
                />
              </View>
            </View>
            <TextInput
              placeholder="Injuries/constraints (optional)"
              placeholderTextColor="#9ca3af"
              value={aiInjuries}
              onChangeText={setAiInjuries}
              style={[styles.input, { height: 80 }]} multiline
            />

            {!!aiError && <Text style={styles.errorText}>{aiError}</Text>}

            <View style={styles.rowRight}>
              <TouchableOpacity style={[styles.button, styles.ghostBtn]} onPress={() => setShowAiModal(false)} disabled={aiLoading}>
                <Text style={[styles.buttonText, { color: '#f97316' }]}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.primaryBtn, { marginLeft: 10, minWidth: 120, alignItems: 'center' }]} onPress={onGenerateAI} disabled={aiLoading}>
                {aiLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.buttonText}>Generate</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff', padding: 16 },
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

