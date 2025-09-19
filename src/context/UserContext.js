import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState({
    id: null,
    name: '',
    email: '',
    role: '', // 'athlete' or 'coach'
    disabilityType: '', // 'blind', 'deaf', 'mobility', 'cognitive', 'speech', 'none'
    disabilitySeverity: '', // 'mild', 'moderate', 'severe'
    assistiveAids: [], // ['screen_reader', 'voice_commands', 'large_text', etc.]
    communicationPreferences: {
      preferVoice: false,
      preferText: false,
      preferVisual: false,
      speechRate: 0.5, // 0.1 to 1.0
      fontSize: 'medium', // 'small', 'medium', 'large', 'extra_large'
    },
    accessibilitySettings: {
      highContrast: false,
      reducedMotion: false,
      voiceAssistantEnabled: false,
      autoReadScreens: false,
    }
  });

  const updateUserProfile = (updates) => {
    setUserProfile(prev => ({
      ...prev,
      ...updates
    }));
  };

  const updateAccessibilitySettings = (settings) => {
    setUserProfile(prev => ({
      ...prev,
      accessibilitySettings: {
        ...prev.accessibilitySettings,
        ...settings
      }
    }));
  };

  const updateCommunicationPreferences = (preferences) => {
    setUserProfile(prev => ({
      ...prev,
      communicationPreferences: {
        ...prev.communicationPreferences,
        ...preferences
      }
    }));
  };

  const setBlindUserProfile = (name, email) => {
    setUserProfile({
      id: Date.now(),
      name,
      email,
      role: 'athlete',
      disabilityType: 'blind',
      disabilitySeverity: 'severe',
      assistiveAids: ['screen_reader', 'voice_commands'],
      communicationPreferences: {
        preferVoice: true,
        preferText: false,
        preferVisual: false,
        speechRate: 0.5,
        fontSize: 'large',
      },
      accessibilitySettings: {
        highContrast: true,
        reducedMotion: true,
        voiceAssistantEnabled: true,
        autoReadScreens: true,
      }
    });
  };

  const isBlindUser = () => {
    return userProfile.disabilityType === 'blind';
  };

  const shouldAutoActivateVoiceAssistant = () => {
    return userProfile.disabilityType === 'blind' || 
           userProfile.accessibilitySettings.voiceAssistantEnabled ||
           userProfile.communicationPreferences.preferVoice;
  };

  return (
    <UserContext.Provider value={{
      userProfile,
      updateUserProfile,
      updateAccessibilitySettings,
      updateCommunicationPreferences,
      setBlindUserProfile,
      isBlindUser,
      shouldAutoActivateVoiceAssistant,
    }}>
      {children}
    </UserContext.Provider>
  );
};
