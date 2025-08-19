import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, Image, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { analyzeNutrition, chatWithAI, generateDietPlan, generateInjuryAdvice, assessSymptoms, generateCareerGuidance, generateFinancialHelp } from '../../services/ai';
import RealVoiceAssistant from '../../components/RealVoiceAssistant';
import ttsService from '../../services/tts';
import speechRecognition from '../../services/speechRecognition';

export default function Chatbot({ navigation }) {
  const [tab, setTab] = useState('chat'); // chat | diet | injury | symptoms | nutrition
  const [messages, setMessages] = useState([
    { id: '1', from: 'bot', text: "Hi! I'm your AI assistant. Ask me anything about training, nutrition, or recovery." },
  ]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Diet form
  const [age, setAge] = useState('22');
  const [sex, setSex] = useState('male');
  const [heightCm, setHeightCm] = useState('175');
  const [weightKg, setWeightKg] = useState('70');
  const [sport, setSport] = useState('running');
  const [goal, setGoal] = useState('performance');
  const [restrictions, setRestrictions] = useState('');
  const [dietLoading, setDietLoading] = useState(false);
  const [dietResult, setDietResult] = useState(null);

  // Injury form
  const [injuryArea, setInjuryArea] = useState('knee');
  const [injuryDuration, setInjuryDuration] = useState('2 weeks');
  const [injuryPain, setInjuryPain] = useState('5');
  const [injuryDesc, setInjuryDesc] = useState('discomfort while running and stairs');
  const [injuryLoading, setInjuryLoading] = useState(false);
  const [injuryResult, setInjuryResult] = useState(null);

  // Symptoms form
  const [symptoms, setSymptoms] = useState('fatigue, mild headache after training');
  const [symptomLoading, setSymptomLoading] = useState(false);
  const [symptomResult, setSymptomResult] = useState(null);
  const listRef = useRef(null);

  // Career form
  const [careerSport, setCareerSport] = useState('running');
  const [careerAge, setCareerAge] = useState('22');
  const [careerLevel, setCareerLevel] = useState('amateur');
  const [careerGoals, setCareerGoals] = useState('become state-level athlete, explore coaching');
  const [careerLocation, setCareerLocation] = useState('');
  const [careerEducation, setCareerEducation] = useState('');
  const [careerInterests, setCareerInterests] = useState('analytics, coaching, content');
  const [careerLoading, setCareerLoading] = useState(false);
  const [careerResult, setCareerResult] = useState(null);

  // Financial form
  const [finSport, setFinSport] = useState('running');
  const [finAge, setFinAge] = useState('22');
  const [finLocation, setFinLocation] = useState('');
  const [finIncome, setFinIncome] = useState('15000');
  const [finExpenses, setFinExpenses] = useState('12000');
  const [finGoal, setFinGoal] = useState('save for equipment and travel');
  const [finSituation, setFinSituation] = useState('student, occasional part-time coaching');
  const [finLoading, setFinLoading] = useState(false);
  const [finResult, setFinResult] = useState(null);
  
  // Sponsorship fields
  const [sponsorshipType, setSponsorshipType] = useState('');
  const [achievementLevel, setAchievementLevel] = useState('');
  const [socialMedia, setSocialMedia] = useState('');

  // Nutrition tracker
  const [nutritionImage, setNutritionImage] = useState(null);
  const [foodDescription, setFoodDescription] = useState('');
  const [nutritionLoading, setNutritionLoading] = useState(false);
  const [nutritionResult, setNutritionResult] = useState(null);

  useEffect(() => {
    listRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now().toString(), from: 'me', text: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    const toSend = input.trim();
    setInput('');
    setChatLoading(true);
    try {
      // Map to AI format
      const history = messages.map((m) => ({ role: m.from === 'bot' ? 'assistant' : 'user', content: m.text }));
      const aiText = await chatWithAI({ messages: [...history, { role: 'user', content: toSend }] });
      const reply = { id: Date.now().toString() + '-b', from: 'bot', text: aiText };
      setMessages((prev) => [...prev, reply]);
    } catch (e) {
      console.log('Chatbot catch block error:', e);
      const reply = { id: Date.now().toString() + '-e', from: 'bot', text: 'Unexpected error occurred. Check console.' };
      setMessages((prev) => [...prev, reply]);
    } finally {
      setChatLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.bubble, item.from === 'me' ? styles.me : styles.bot]}>
      <Text style={[styles.bubbleText, item.from === 'me' ? styles.bubbleTextMe : styles.bubbleTextBot]}>{item.text}</Text>
    </View>
  );

  // Inline elements (not nested components) to avoid remounts that blur TextInput
  const TabBarEl = (
    <View style={styles.tabsBar}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
        {['chat','diet','injury','symptoms','nutrition','career','financial'].map((t) => (
          <TouchableOpacity key={t} style={[styles.tabBtn, tab === t && styles.tabBtnActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const ChatViewEl = (
    <View style={{ flex: 1 }}>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        keyboardShouldPersistTaps="handled"
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type a message"
          placeholderTextColor="#9ca3af"
          value={input}
          onChangeText={setInput}
          blurOnSubmit={false}
          onSubmitEditing={send}
        />
        <TouchableOpacity style={[styles.send, chatLoading && { opacity: 0.6 }]} onPress={send} disabled={chatLoading}>
          {chatLoading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700' }}>Send</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );

  const DietViewEl = (
    <ScrollView contentContainerStyle={styles.section} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Age</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={age} onChangeText={setAge} blurOnSubmit={false} />
      <Text style={styles.label}>Sex (male/female)</Text>
      <TextInput style={styles.input} value={sex} onChangeText={setSex} blurOnSubmit={false} />
      <Text style={styles.label}>Height (cm)</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={heightCm} onChangeText={setHeightCm} blurOnSubmit={false} />
      <Text style={styles.label}>Weight (kg)</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={weightKg} onChangeText={setWeightKg} blurOnSubmit={false} />
      <Text style={styles.label}>Sport</Text>
      <TextInput style={styles.input} value={sport} onChangeText={setSport} blurOnSubmit={false} />
      <Text style={styles.label}>Goal</Text>
      <TextInput style={styles.input} value={goal} onChangeText={setGoal} blurOnSubmit={false} />
      <Text style={styles.label}>Restrictions</Text>
      <TextInput style={styles.input} value={restrictions} onChangeText={setRestrictions} placeholder="e.g., vegetarian, lactose-free" blurOnSubmit={false} />
      <TouchableOpacity
        style={[styles.primaryBtn, dietLoading && { opacity: 0.6 }]}
        onPress={async () => {
          setDietLoading(true);
          setDietResult(null);
          try {
            const res = await generateDietPlan({
              age: Number(age) || age,
              sex,
              heightCm: Number(heightCm) || heightCm,
              weightKg: Number(weightKg) || weightKg,
              sport,
              goal,
              restrictions,
            });
            setDietResult(res);
          } catch (e) {
            setDietResult({ title: 'Diet Plan (Error)', notes: 'Could not generate diet plan.' });
          } finally {
            setDietLoading(false);
          }
        }}
        disabled={dietLoading}
      >
        {dietLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Generate Diet Plan</Text>}
      </TouchableOpacity>
      {dietResult && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{dietResult.title || 'Diet Plan'}</Text>
          {dietResult.calories != null && (
            <Text style={styles.cardSub}>Calories: {dietResult.calories}</Text>
          )}
          {dietResult.macros && (
            <Text style={styles.cardSub}>Macros: P {dietResult.macros.protein}, C {dietResult.macros.carbs}, F {dietResult.macros.fat}</Text>
          )}
          {Array.isArray(dietResult.meals) && dietResult.meals.map((m, idx) => (
            <View key={idx} style={{ marginTop: 8 }}>
              <Text style={styles.cardItemTitle}>{m.name} {m.calories ? `• ${m.calories} kcal` : ''}</Text>
              <Text style={styles.cardItemText}>{Array.isArray(m.items) ? m.items.join(', ') : ''}</Text>
            </View>
          ))}
          {dietResult.notes && <Text style={[styles.cardItemText, { marginTop: 8 }]}>{dietResult.notes}</Text>}
        </View>
      )}
    </ScrollView>
  );

  const InjuryViewEl = (
    <ScrollView contentContainerStyle={styles.section} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Injury Area</Text>
      <TextInput style={styles.input} value={injuryArea} onChangeText={setInjuryArea} blurOnSubmit={false} />
      <Text style={styles.label}>Duration</Text>
      <TextInput style={styles.input} value={injuryDuration} onChangeText={setInjuryDuration} blurOnSubmit={false} />
      <Text style={styles.label}>Pain Scale (0-10)</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={injuryPain} onChangeText={setInjuryPain} blurOnSubmit={false} />
      <Text style={styles.label}>Description</Text>
      <TextInput style={styles.input} value={injuryDesc} onChangeText={setInjuryDesc} placeholder="what makes it worse/better" blurOnSubmit={false} />
      <TouchableOpacity
        style={[styles.primaryBtn, injuryLoading && { opacity: 0.6 }]}
        onPress={async () => {
          setInjuryLoading(true);
          setInjuryResult(null);
          try {
            const res = await generateInjuryAdvice({ area: injuryArea, duration: injuryDuration, painScale: Number(injuryPain) || injuryPain, description: injuryDesc });
            setInjuryResult(res);
          } catch (e) {
            setInjuryResult({ summary: 'Could not generate advice.' });
          } finally {
            setInjuryLoading(false);
          }
        }}
        disabled={injuryLoading}
      >
        {injuryLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Get Injury Advice</Text>}
      </TouchableOpacity>
      {injuryResult && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Summary</Text>
          <Text style={styles.cardItemText}>{injuryResult.summary}</Text>
          {Array.isArray(injuryResult.immediateCare) && (
            <View style={{ marginTop: 8 }}>
              <Text style={styles.cardItemTitle}>Immediate Care</Text>
              <Text style={styles.cardItemText}>{injuryResult.immediateCare.join(', ')}</Text>
            </View>
          )}
          {Array.isArray(injuryResult.recommendedActions) && (
            <View style={{ marginTop: 8 }}>
              <Text style={styles.cardItemTitle}>Recommended Actions</Text>
              <Text style={styles.cardItemText}>{injuryResult.recommendedActions.join(', ')}</Text>
            </View>
          )}
          {Array.isArray(injuryResult.warningSigns) && (
            <View style={{ marginTop: 8 }}>
              <Text style={styles.cardItemTitle}>Warning Signs</Text>
              <Text style={styles.cardItemText}>{injuryResult.warningSigns.join(', ')}</Text>
            </View>
          )}
          {typeof injuryResult.seeDoctor === 'boolean' && (
            <Text style={[styles.cardSub, { marginTop: 8 }]}>See Doctor: {injuryResult.seeDoctor ? 'Yes' : 'No'}</Text>
          )}
        </View>
      )}
    </ScrollView>
  );

  const SymptomsViewEl = (
    <ScrollView contentContainerStyle={styles.section} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Describe your symptoms</Text>
      <TextInput style={styles.input} value={symptoms} onChangeText={setSymptoms} placeholder="e.g., cough, sore throat" blurOnSubmit={false} />
      <TouchableOpacity
        style={[styles.primaryBtn, symptomLoading && { opacity: 0.6 }]}
        onPress={async () => {
          setSymptomLoading(true);
          setSymptomResult(null);
          try {
            const res = await assessSymptoms({ symptoms });
            setSymptomResult(res);
          } catch (e) {
            setSymptomResult({ advice: 'Could not assess symptoms.' });
          } finally {
            setSymptomLoading(false);
          }
        }}
        disabled={symptomLoading}
      >
        {symptomLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Assess Symptoms</Text>}
      </TouchableOpacity>
      {symptomResult && (
        <View style={styles.card}>
          {Array.isArray(symptomResult.possibleCauses) && (
            <View>
              <Text style={styles.cardItemTitle}>Possible Causes</Text>
              <Text style={styles.cardItemText}>{symptomResult.possibleCauses.join(', ')}</Text>
            </View>
          )}
          {symptomResult.urgency && (
            <Text style={[styles.cardSub, { marginTop: 8 }]}>Urgency: {symptomResult.urgency}</Text>
          )}
          {symptomResult.advice && (
            <Text style={[styles.cardItemText, { marginTop: 8 }]}>{symptomResult.advice}</Text>
          )}
        </View>
      )}
    </ScrollView>
  );

  const CareerViewEl = (
    <ScrollView contentContainerStyle={styles.section} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Sport</Text>
      <TextInput style={styles.input} value={careerSport} onChangeText={setCareerSport} blurOnSubmit={false} />
      <Text style={styles.label}>Age</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={careerAge} onChangeText={setCareerAge} blurOnSubmit={false} />
      <Text style={styles.label}>Level</Text>
      <TextInput style={styles.input} value={careerLevel} onChangeText={setCareerLevel} placeholder="amateur / semi-pro / pro" blurOnSubmit={false} />
      <Text style={styles.label}>Goals</Text>
      <TextInput style={styles.input} value={careerGoals} onChangeText={setCareerGoals} placeholder="e.g., selection, coaching, content" blurOnSubmit={false} />
      <Text style={styles.label}>Location</Text>
      <TextInput style={styles.input} value={careerLocation} onChangeText={setCareerLocation} placeholder="city, state" blurOnSubmit={false} />
      <Text style={styles.label}>Education</Text>
      <TextInput style={styles.input} value={careerEducation} onChangeText={setCareerEducation} placeholder="optional" blurOnSubmit={false} />
      <Text style={styles.label}>Interests</Text>
      <TextInput style={styles.input} value={careerInterests} onChangeText={setCareerInterests} placeholder="optional" blurOnSubmit={false} />
      <TouchableOpacity
        style={[styles.primaryBtn, careerLoading && { opacity: 0.6 }]}
        onPress={async () => {
          setCareerLoading(true);
          setCareerResult(null);
          try {
            const res = await generateCareerGuidance({
              sport: careerSport,
              age: Number(careerAge) || careerAge,
              level: careerLevel,
              goals: careerGoals,
              location: careerLocation,
              education: careerEducation,
              interests: careerInterests,
            });
            setCareerResult(res);
          } catch (e) {
            setCareerResult({ 
              summary: 'Unable to connect to AI service. Here are some general career guidance tips:',
              recommendedPaths: ['Coaching & Training', 'Sports Management', 'Fitness & Wellness', 'Sports Media'],
              skillsToDevelop: ['Leadership', 'Communication', 'Technical expertise', 'Business skills'],
              nextSteps: ['Network with professionals', 'Gain certifications', 'Build portfolio', 'Seek mentorship'],
              resources: [
                { name: 'Sports Career Resources', url: '' },
                { name: 'Professional Development', url: '' }
              ]
            });
          } finally {
            setCareerLoading(false);
          }
        }}
        disabled={careerLoading}
      >
        {careerLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Get Career Guidance</Text>}
      </TouchableOpacity>
      {careerResult && (
        <View style={styles.card}>
          {careerResult.summary && (
            <>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Career Guidance</Text>
                {careerResult.summary?.includes('Unable to connect') && (
                  <View style={styles.offlineIndicator}>
                    <Ionicons name="cloud-offline-outline" size={14} color="#ef4444" />
                    <Text style={styles.offlineText}>Offline</Text>
                  </View>
                )}
              </View>
              <Text style={styles.cardItemText}>{careerResult.summary}</Text>
            </>
          )}
          {Array.isArray(careerResult.recommendedPaths) && (
            <View style={{ marginTop: 8 }}>
              <Text style={styles.cardItemTitle}>Recommended Paths</Text>
              <Text style={styles.cardItemText}>{careerResult.recommendedPaths.join(', ')}</Text>
            </View>
          )}
          {Array.isArray(careerResult.skillsToDevelop) && (
            <View style={{ marginTop: 8 }}>
              <Text style={styles.cardItemTitle}>Skills To Develop</Text>
              <Text style={styles.cardItemText}>{careerResult.skillsToDevelop.join(', ')}</Text>
            </View>
          )}
          {Array.isArray(careerResult.nextSteps) && (
            <View style={{ marginTop: 8 }}>
              <Text style={styles.cardItemTitle}>Next Steps</Text>
              <Text style={styles.cardItemText}>{careerResult.nextSteps.join(', ')}</Text>
            </View>
          )}
          {Array.isArray(careerResult.resources) && careerResult.resources.length > 0 && (
            <View style={{ marginTop: 8 }}>
              <Text style={styles.cardItemTitle}>Resources</Text>
              <Text style={styles.cardItemText}>
                {careerResult.resources.map((r, idx) => `${r.name}${r.url ? ` (${r.url})` : ''}`).join('\n')}
              </Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );

  const NutritionViewEl = (
    <ScrollView contentContainerStyle={styles.section} keyboardShouldPersistTaps="handled">
      <Text style={styles.sectionTitle}>📸 AI Nutrition Tracker</Text>
      <Text style={styles.label}>Food Description (Optional)</Text>
      <TextInput 
        style={styles.input} 
        value={foodDescription} 
        onChangeText={setFoodDescription} 
        placeholder="e.g., grilled chicken with rice and vegetables" 
        blurOnSubmit={false} 
      />
      
      <View style={styles.cameraSection}>
        <TouchableOpacity
          style={styles.cameraBtn}
          onPress={async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission needed', 'Camera permission is required to take photos of food.');
              return;
            }
            
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
              base64: true,
            });

            if (!result.canceled) {
              setNutritionImage(result.assets[0]);
            }
          }}
        >
          <Ionicons name="camera" size={24} color="#f97316" />
          <Text style={styles.cameraBtnText}>Take Photo</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.cameraBtn}
          onPress={async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission needed', 'Photo library permission is required to select images.');
              return;
            }
            
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
              base64: true,
            });

            if (!result.canceled) {
              setNutritionImage(result.assets[0]);
            }
          }}
        >
          <Ionicons name="images" size={24} color="#f97316" />
          <Text style={styles.cameraBtnText}>Choose Photo</Text>
        </TouchableOpacity>
      </View>

      {nutritionImage && (
        <View style={styles.imagePreview}>
          <Image source={{ uri: nutritionImage.uri }} style={styles.previewImage} />
          <TouchableOpacity 
            style={styles.removeImageBtn}
            onPress={() => setNutritionImage(null)}
          >
            <Ionicons name="close-circle" size={24} color="#ef4444" />
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={[styles.primaryBtn, (nutritionLoading || !nutritionImage) && { opacity: 0.6 }]}
        onPress={async () => {
          if (!nutritionImage) {
            Alert.alert('No Image', 'Please take or select a photo of your food first.');
            return;
          }
          
          setNutritionLoading(true);
          setNutritionResult(null);
          try {
            const result = await analyzeNutrition({
              imageBase64: nutritionImage.base64,
              foodDescription: foodDescription
            });
            setNutritionResult(result);
          } catch (e) {
            setNutritionResult({
              foodName: 'Analysis Error',
              totalCalories: 0,
              error: 'Failed to analyze nutrition. Please try again.'
            });
          } finally {
            setNutritionLoading(false);
          }
        }}
        disabled={nutritionLoading || !nutritionImage}
      >
        {nutritionLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Analyze Nutrition</Text>}
      </TouchableOpacity>

      {nutritionResult && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>🥗 {nutritionResult.foodName}</Text>
            {nutritionResult.confidence && (
              <View style={[styles.confidenceBadge, { 
                backgroundColor: nutritionResult.confidence === 'high' ? '#dcfce7' : 
                                nutritionResult.confidence === 'medium' ? '#fef3c7' : '#fef2f2',
                borderColor: nutritionResult.confidence === 'high' ? '#bbf7d0' : 
                           nutritionResult.confidence === 'medium' ? '#fde68a' : '#fecaca'
              }]}>
                <Text style={[styles.confidenceText, {
                  color: nutritionResult.confidence === 'high' ? '#16a34a' : 
                         nutritionResult.confidence === 'medium' ? '#d97706' : '#dc2626'
                }]}>
                  {nutritionResult.confidence} confidence
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.nutritionGrid}>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{nutritionResult.totalCalories}</Text>
              <Text style={styles.nutritionLabel}>Calories</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{nutritionResult.servingSize}</Text>
              <Text style={styles.nutritionLabel}>Serving</Text>
            </View>
          </View>

          {nutritionResult.macros && (
            <View style={{ marginTop: 12 }}>
              <Text style={styles.cardItemTitle}>Macronutrients</Text>
              <View style={styles.macroGrid}>
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>{nutritionResult.macros.protein}</Text>
                  <Text style={styles.macroLabel}>Protein</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>{nutritionResult.macros.carbs}</Text>
                  <Text style={styles.macroLabel}>Carbs</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>{nutritionResult.macros.fat}</Text>
                  <Text style={styles.macroLabel}>Fat</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>{nutritionResult.macros.fiber}</Text>
                  <Text style={styles.macroLabel}>Fiber</Text>
                </View>
              </View>
            </View>
          )}

          {nutritionResult.micronutrients && (
            <View style={{ marginTop: 12 }}>
              <Text style={styles.cardItemTitle}>Key Micronutrients</Text>
              <Text style={styles.cardItemText}>
                Calcium: {nutritionResult.micronutrients.calcium} • Iron: {nutritionResult.micronutrients.iron} • 
                Vitamin C: {nutritionResult.micronutrients.vitaminC} • Sodium: {nutritionResult.micronutrients.sodium}
              </Text>
            </View>
          )}

          {nutritionResult.healthScore && (
            <View style={{ marginTop: 12 }}>
              <Text style={styles.cardItemTitle}>Health Score: {nutritionResult.healthScore}/10</Text>
              <View style={styles.healthScoreBar}>
                <View style={[styles.healthScoreFill, { width: `${(nutritionResult.healthScore / 10) * 100}%` }]} />
              </View>
            </View>
          )}

          {Array.isArray(nutritionResult.recommendations) && (
            <View style={{ marginTop: 12 }}>
              <Text style={styles.cardItemTitle}>💡 Recommendations</Text>
              <Text style={styles.cardItemText}>{nutritionResult.recommendations.join(' • ')}</Text>
            </View>
          )}

          {Array.isArray(nutritionResult.allergens) && nutritionResult.allergens.length > 0 && (
            <View style={{ marginTop: 12 }}>
              <Text style={styles.cardItemTitle}>⚠️ Potential Allergens</Text>
              <Text style={styles.cardItemText}>{nutritionResult.allergens.join(', ')}</Text>
            </View>
          )}

          {nutritionResult.error && (
            <View style={{ marginTop: 12 }}>
              <Text style={[styles.cardItemTitle, { color: '#ef4444' }]}>Error</Text>
              <Text style={styles.cardItemText}>{nutritionResult.error}</Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );

  const FinancialViewEl = (
    <ScrollView contentContainerStyle={styles.section} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Sport</Text>
      <TextInput style={styles.input} value={finSport} onChangeText={setFinSport} blurOnSubmit={false} />
      <Text style={styles.label}>Age</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={finAge} onChangeText={setFinAge} blurOnSubmit={false} />
      <Text style={styles.label}>Location</Text>
      <TextInput style={styles.input} value={finLocation} onChangeText={setFinLocation} placeholder="city, state" blurOnSubmit={false} />
      <Text style={styles.label}>Monthly Income (₹)</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={finIncome} onChangeText={setFinIncome} blurOnSubmit={false} />
      <Text style={styles.label}>Monthly Expenses (₹)</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={finExpenses} onChangeText={setFinExpenses} blurOnSubmit={false} />
      <Text style={styles.label}>Primary Goal</Text>
      <TextInput style={styles.input} value={finGoal} onChangeText={setFinGoal} placeholder="e.g., save for travel, need sponsorship" blurOnSubmit={false} />
      <Text style={styles.label}>Current Situation</Text>
      <TextInput style={styles.input} value={finSituation} onChangeText={setFinSituation} placeholder="e.g., need equipment funding, seeking sponsors" blurOnSubmit={false} />
      
      <Text style={styles.sectionTitle}>🤝 Sponsorship & Financial Assistance</Text>
      <Text style={styles.label}>Sponsorship Type Needed</Text>
      <TextInput 
        style={styles.input} 
        value={sponsorshipType} 
        onChangeText={setSponsorshipType} 
        placeholder="e.g., equipment, travel, training fees" 
        blurOnSubmit={false} 
      />
      <Text style={styles.label}>Achievement Level</Text>
      <TextInput 
        style={styles.input} 
        value={achievementLevel} 
        onChangeText={setAchievementLevel} 
        placeholder="e.g., state champion, national qualifier" 
        blurOnSubmit={false} 
      />
      <Text style={styles.label}>Social Media Following</Text>
      <TextInput 
        style={styles.input} 
        value={socialMedia} 
        onChangeText={setSocialMedia} 
        placeholder="e.g., Instagram 5k followers" 
        blurOnSubmit={false} 
      />
      <TouchableOpacity
        style={[styles.primaryBtn, finLoading && { opacity: 0.6 }]}
        onPress={async () => {
          setFinLoading(true);
          setFinResult(null);
          try {
            const res = await generateFinancialHelp({
              sport: finSport,
              age: Number(finAge) || finAge,
              location: finLocation,
              income: Number(finIncome) || finIncome,
              expenses: Number(finExpenses) || finExpenses,
              goal: finGoal,
              situation: finSituation,
              sponsorshipType,
              achievementLevel,
              socialMedia,
            });
            setFinResult(res);
          } catch (e) {
            setFinResult({ 
              summary: 'Unable to connect to AI service. Here are some general financial guidance tips:',
              budgetTips: ['Track all training expenses', 'Set aside 15-20% for equipment', 'Plan for competition travel costs', 'Consider seasonal income variations'],
              fundingOptions: ['Local business sponsorships', 'Sports federation grants', 'Crowdfunding campaigns', 'Part-time coaching', 'Equipment partnerships'],
              scholarships: ['Khelo India Scheme', 'State sports scholarships', 'University sports scholarships', 'Corporate CSR programs'],
              sponsorshipAdvice: ['Build strong social media presence', 'Document achievements and progress', 'Create professional athlete portfolio', 'Network at competitions'],
              nextSteps: ['Research 5 potential sponsors', 'Apply to 2 scholarship programs', 'Create monthly budget plan', 'Build media kit'],
              warnings: ['Avoid high-interest loans for equipment', 'Read sponsorship contracts carefully', 'Keep receipts for tax purposes']
            });
          } finally {
            setFinLoading(false);
          }
        }}
        disabled={finLoading}
      >
        {finLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Get Financial & Sponsorship Help</Text>}
      </TouchableOpacity>
      {finResult && (
        <View style={styles.card}>
          {finResult.summary && (
            <>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Financial Guidance</Text>
                {finResult.summary?.includes('Unable to connect') && (
                  <View style={styles.offlineIndicator}>
                    <Ionicons name="cloud-offline-outline" size={14} color="#ef4444" />
                    <Text style={styles.offlineText}>Offline</Text>
                  </View>
                )}
              </View>
              <Text style={styles.cardItemText}>{finResult.summary}</Text>
            </>
          )}
          {Array.isArray(finResult.budgetTips) && (
            <View style={{ marginTop: 8 }}>
              <Text style={styles.cardItemTitle}>Budget Tips</Text>
              <Text style={styles.cardItemText}>{finResult.budgetTips.join(', ')}</Text>
            </View>
          )}
          {Array.isArray(finResult.fundingOptions) && (
            <View style={{ marginTop: 8 }}>
              <Text style={styles.cardItemTitle}>Funding Options</Text>
              <Text style={styles.cardItemText}>{finResult.fundingOptions.join(', ')}</Text>
            </View>
          )}
          {Array.isArray(finResult.scholarships) && (
            <View style={{ marginTop: 8 }}>
              <Text style={styles.cardItemTitle}>Scholarships</Text>
              <Text style={styles.cardItemText}>{finResult.scholarships.join(', ')}</Text>
            </View>
          )}
          {Array.isArray(finResult.sponsorshipAdvice) && (
            <View style={{ marginTop: 8 }}>
              <Text style={styles.cardItemTitle}>🤝 Sponsorship Advice</Text>
              <Text style={styles.cardItemText}>{finResult.sponsorshipAdvice.join(', ')}</Text>
            </View>
          )}
          {Array.isArray(finResult.nextSteps) && (
            <View style={{ marginTop: 8 }}>
              <Text style={styles.cardItemTitle}>Next Steps</Text>
              <Text style={styles.cardItemText}>{finResult.nextSteps.join(', ')}</Text>
            </View>
          )}
          {Array.isArray(finResult.warnings) && (
            <View style={{ marginTop: 8 }}>
              <Text style={styles.cardItemTitle}>Warnings</Text>
              <Text style={styles.cardItemText}>{finResult.warnings.join(', ')}</Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {TabBarEl}
      {tab === 'chat' && ChatViewEl}
      {tab === 'diet' && DietViewEl}
      {tab === 'injury' && InjuryViewEl}
      {tab === 'symptoms' && SymptomsViewEl}
      {tab === 'nutrition' && NutritionViewEl}
      {tab === 'career' && CareerViewEl}
      {tab === 'financial' && FinancialViewEl}
      <RealVoiceAssistant 
        navigation={navigation} 
        screenName="Chatbot" 
        screenData={{
          currentTab: tab,
          messageCount: messages.length,
          onVoiceInput: (text) => setInput(text)
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  bubble: {
    maxWidth: '80%',
    marginVertical: 6,
    padding: 10,
    borderRadius: 12,
  },
  me: { alignSelf: 'flex-end', backgroundColor: '#f97316' },
  bot: { alignSelf: 'flex-start', backgroundColor: '#f3f4f6' },
  bubbleText: { color: '#111827' },
  bubbleTextMe: { color: '#ffffff' },
  bubbleTextBot: { color: '#111827' },
  inputRow: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb', backgroundColor: '#ffffff' },
  input: { flex: 1, backgroundColor: '#f9fafb', borderRadius: 10, paddingHorizontal: 12, color: '#111827', marginRight: 8 },
  send: { backgroundColor: '#f97316', paddingHorizontal: 16, justifyContent: 'center', borderRadius: 10 },
  tabsBar: { borderBottomWidth: 1, borderBottomColor: '#e5e7eb', backgroundColor: '#ffffff' },
  tabsRow: { flexDirection: 'row', justifyContent: 'flex-start', paddingVertical: 8, paddingHorizontal: 8 },
  tabBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 9999, backgroundColor: '#f3f4f6', marginRight: 8 },
  tabBtnActive: { backgroundColor: '#f97316' },
  tabText: { color: '#111827', fontWeight: '600' },
  tabTextActive: { color: '#ffffff' },
  section: { padding: 16 },
  label: { color: '#111827', marginTop: 10, marginBottom: 4, fontWeight: '600' },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 20,
    marginBottom: 8,
  },
  primaryBtn: { marginTop: 12, backgroundColor: '#f97316', paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  card: { marginTop: 14, backgroundColor: '#f9fafb', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  cardTitle: { fontWeight: '800', color: '#111827', fontSize: 16 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  offlineText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ef4444',
    marginLeft: 4,
  },
  cardSub: { color: '#111827', marginTop: 4 },
  cardItemTitle: { marginTop: 6, fontWeight: '700', color: '#111827' },
  cardItemText: { color: '#111827', marginTop: 2 },
  
  // Nutrition Tracker Styles
  cameraSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  cameraBtn: {
    flex: 1,
    backgroundColor: '#fff7ed',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  cameraBtnText: {
    color: '#f97316',
    fontWeight: '600',
    marginTop: 8,
    fontSize: 14,
  },
  imagePreview: {
    position: 'relative',
    alignSelf: 'center',
    marginVertical: 16,
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  removeImageBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: '600',
  },
  nutritionGrid: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  nutritionItem: {
    flex: 1,
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#f97316',
    marginBottom: 4,
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  macroGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  macroItem: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: 8,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  macroLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
  },
  healthScoreBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginTop: 8,
    overflow: 'hidden',
  },
  healthScoreFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
});

