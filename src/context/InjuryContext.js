import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import geminiInjuryService from '../services/geminiInjuryService';

const InjuryContext = createContext();

export const useInjury = () => {
  const context = useContext(InjuryContext);
  if (!context) {
    throw new Error('useInjury must be used within an InjuryProvider');
  }
  return context;
};

const INJURY_STORAGE_KEY = '@OneNationOneAthlete:injuries';
const PREVENTION_PLANS_KEY = '@OneNationOneAthlete:preventionPlans';

export const InjuryProvider = ({ children }) => {
  const [injuries, setInjuries] = useState([]);
  const [preventionPlans, setPreventionPlans] = useState({});
  const [riskAssessments, setRiskAssessments] = useState({});
  const [loading, setLoading] = useState(false);

  // Load data on initialization
  useEffect(() => {
    loadInjuryData();
    loadPreventionPlans();
  }, []);

  const loadInjuryData = async () => {
    try {
      const storedInjuries = await AsyncStorage.getItem(INJURY_STORAGE_KEY);
      if (storedInjuries) {
        setInjuries(JSON.parse(storedInjuries));
      }
    } catch (error) {
      console.error('Error loading injury data:', error);
    }
  };

  const loadPreventionPlans = async () => {
    try {
      const storedPlans = await AsyncStorage.getItem(PREVENTION_PLANS_KEY);
      if (storedPlans) {
        setPreventionPlans(JSON.parse(storedPlans));
      }
    } catch (error) {
      console.error('Error loading prevention plans:', error);
    }
  };

  const saveInjuryData = async (injuryData) => {
    try {
      await AsyncStorage.setItem(INJURY_STORAGE_KEY, JSON.stringify(injuryData));
    } catch (error) {
      console.error('Error saving injury data:', error);
    }
  };

  const savePreventionPlans = async (plans) => {
    try {
      await AsyncStorage.setItem(PREVENTION_PLANS_KEY, JSON.stringify(plans));
    } catch (error) {
      console.error('Error saving prevention plans:', error);
    }
  };

  // Report a new injury
  const reportInjury = async (injuryData) => {
    const newInjury = {
      id: Date.now().toString(),
      ...injuryData,
      reportedAt: new Date().toISOString(),
      status: 'active',
      recoveryPhase: 'acute'
    };

    const updatedInjuries = [...injuries, newInjury];
    setInjuries(updatedInjuries);
    await saveInjuryData(updatedInjuries);

    return newInjury;
  };

  // Update injury status
  const updateInjury = async (injuryId, updates) => {
    const updatedInjuries = injuries.map(injury =>
      injury.id === injuryId ? { ...injury, ...updates, updatedAt: new Date().toISOString() } : injury
    );
    
    setInjuries(updatedInjuries);
    await saveInjuryData(updatedInjuries);
  };

  // Analyze injury risk for an athlete
  const analyzeInjuryRisk = async (athleteData) => {
    setLoading(true);
    try {
      const riskAnalysis = await geminiInjuryService.analyzeInjuryRisk(athleteData);
      
      // Store the risk assessment
      const updatedAssessments = {
        ...riskAssessments,
        [athleteData.id]: {
          ...riskAnalysis,
          assessedAt: new Date().toISOString(),
          athleteId: athleteData.id
        }
      };
      
      setRiskAssessments(updatedAssessments);
      return riskAnalysis;
    } catch (error) {
      console.error('Error analyzing injury risk:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Generate prevention plan
  const generatePreventionPlan = async (athleteData, riskAnalysis) => {
    setLoading(true);
    try {
      const preventionPlan = await geminiInjuryService.generatePreventionPlan(athleteData, riskAnalysis);
      
      const updatedPlans = {
        ...preventionPlans,
        [athleteData.id]: {
          ...preventionPlan,
          createdAt: new Date().toISOString(),
          athleteId: athleteData.id,
          riskLevel: riskAnalysis.riskLevel
        }
      };
      
      setPreventionPlans(updatedPlans);
      await savePreventionPlans(updatedPlans);
      
      return preventionPlan;
    } catch (error) {
      console.error('Error generating prevention plan:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Analyze symptoms
  const analyzeSymptoms = async (symptoms, athleteData) => {
    setLoading(true);
    try {
      const analysis = await geminiInjuryService.analyzeSymptoms(symptoms, athleteData);
      return analysis;
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Generate recovery protocol
  const generateRecoveryProtocol = async (injuryData, athleteData) => {
    setLoading(true);
    try {
      const protocol = await geminiInjuryService.generateRecoveryProtocol(injuryData, athleteData);
      
      // Update the injury with the recovery protocol
      await updateInjury(injuryData.id, { recoveryProtocol: protocol });
      
      return protocol;
    } catch (error) {
      console.error('Error generating recovery protocol:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get injuries for a specific athlete
  const getAthleteInjuries = (athleteId) => {
    return injuries.filter(injury => injury.athleteId === athleteId);
  };

  // Get active injuries for an athlete
  const getActiveInjuries = (athleteId) => {
    return injuries.filter(injury => 
      injury.athleteId === athleteId && 
      injury.status === 'active'
    );
  };

  // Get injury history for an athlete
  const getInjuryHistory = (athleteId) => {
    return injuries.filter(injury => injury.athleteId === athleteId)
                  .sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt));
  };

  // Get prevention plan for an athlete
  const getPreventionPlan = (athleteId) => {
    return preventionPlans[athleteId];
  };

  // Get risk assessment for an athlete
  const getRiskAssessment = (athleteId) => {
    return riskAssessments[athleteId];
  };

  // Get injury statistics
  const getInjuryStats = () => {
    const totalInjuries = injuries.length;
    const activeInjuries = injuries.filter(i => i.status === 'active').length;
    const recoveredInjuries = injuries.filter(i => i.status === 'recovered').length;
    
    const injuryTypes = {};
    injuries.forEach(injury => {
      injuryTypes[injury.type] = (injuryTypes[injury.type] || 0) + 1;
    });

    const mostCommonInjury = Object.keys(injuryTypes).reduce((a, b) => 
      injuryTypes[a] > injuryTypes[b] ? a : b, 'None'
    );

    return {
      totalInjuries,
      activeInjuries,
      recoveredInjuries,
      injuryTypes,
      mostCommonInjury,
      recoveryRate: totalInjuries > 0 ? (recoveredInjuries / totalInjuries * 100).toFixed(1) : 0
    };
  };

  // Mark injury as recovered
  const markAsRecovered = async (injuryId) => {
    await updateInjury(injuryId, {
      status: 'recovered',
      recoveredAt: new Date().toISOString()
    });
  };

  // Add symptom log to injury
  const addSymptomLog = async (injuryId, symptomData) => {
    const injury = injuries.find(i => i.id === injuryId);
    if (!injury) return;

    const symptomLog = {
      id: Date.now().toString(),
      ...symptomData,
      loggedAt: new Date().toISOString()
    };

    const updatedSymptomLogs = [...(injury.symptomLogs || []), symptomLog];
    await updateInjury(injuryId, { symptomLogs: updatedSymptomLogs });
  };

  const value = {
    // State
    injuries,
    preventionPlans,
    riskAssessments,
    loading,

    // Actions
    reportInjury,
    updateInjury,
    analyzeInjuryRisk,
    generatePreventionPlan,
    analyzeSymptoms,
    generateRecoveryProtocol,
    markAsRecovered,
    addSymptomLog,

    // Getters
    getAthleteInjuries,
    getActiveInjuries,
    getInjuryHistory,
    getPreventionPlan,
    getRiskAssessment,
    getInjuryStats,
  };

  return (
    <InjuryContext.Provider value={value}>
      {children}
    </InjuryContext.Provider>
  );
};
