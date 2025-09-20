import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, profileService } from '../services/supabaseConfig';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Get initial session
    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (session?.user) {
          setSession(session);
          setUser(session.user);
          await loadUserProfile(session.user.id);
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
        }
        
        setLoading(false);
        setInitializing(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const getInitialSession = async () => {
    try {
      const session = await authService.getSession();
      if (session?.user) {
        setSession(session);
        setUser(session.user);
        await loadUserProfile(session.user.id);
      }
    } catch (error) {
      console.error('Error getting initial session:', error);
    } finally {
      setLoading(false);
      setInitializing(false);
    }
  };

  const loadUserProfile = async (userId) => {
    try {
      const userProfile = await profileService.getProfile(userId);
      setProfile(userProfile);
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Profile might not exist yet, that's okay
      setProfile(null);
    }
  };

  const signUp = async (email, password, userData) => {
    try {
      setLoading(true);
      const { user, session } = await authService.signUp(email, password, userData);
      
      // Check if user is immediately confirmed (email confirmation disabled)
      if (user && user.email_confirmed_at) {
        // Email confirmation is disabled, user is immediately active
        if (session) {
          setUser(user);
          setSession(session);
          await loadUserProfile(user.id);
        }
        return { user, needsVerification: false };
      } else {
        // Email confirmation is enabled, user needs to verify
        return { user, needsVerification: true };
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      const { user, session } = await authService.signIn(email, password);
      
      if (user && session) {
        setUser(user);
        setSession(session);
        await loadUserProfile(user.id);
      }
      
      return { user, session };
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await authService.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    try {
      await authService.resetPassword(email);
    } catch (error) {
      throw error;
    }
  };

  const updatePassword = async (newPassword) => {
    try {
      await authService.updatePassword(newPassword);
    } catch (error) {
      throw error;
    }
  };

  const updateProfile = async (updates) => {
    try {
      if (!user?.id) throw new Error('No authenticated user');
      
      const updatedProfile = await profileService.updateProfile(user.id, updates);
      console.log('AuthContext: Profile updated, setting new profile state:', updatedProfile);
      setProfile(updatedProfile);
      
      // Small delay to ensure state propagation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return updatedProfile;
    } catch (error) {
      throw error;
    }
  };

  const completeProfile = async (profileData) => {
    try {
      if (!user?.id) throw new Error('No authenticated user');
      
      const completedProfile = await profileService.completeProfile(user.id, profileData);
      setProfile(completedProfile);
      return completedProfile;
    } catch (error) {
      throw error;
    }
  };

  const refreshProfile = async () => {
    try {
      if (!user?.id) return;
      await loadUserProfile(user.id);
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  const value = {
    // State
    user,
    profile,
    session,
    loading,
    initializing,
    
    // Computed values
    isAuthenticated: !!user && !!session,
    isProfileComplete: !!profile?.profile_completed,
    
    // Methods
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    completeProfile,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
