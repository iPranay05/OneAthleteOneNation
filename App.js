import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RoleSelect from './src/screens/RoleSelect';
import AthleteLogin from './src/screens/AthleteLogin';
import CoachLogin from './src/screens/CoachLogin';
import AthleteTabs from './src/navigation/AthleteTabs';
import CoachTabs from './src/navigation/CoachTabs';
import { PostsProvider } from './src/context/PostsContext';
import { PlansProvider } from './src/context/PlansContext';
import { ActivitiesProvider } from './src/context/ActivitiesContext';
import { WorkoutProvider } from './src/context/WorkoutContext';
import { ProgressProvider } from './src/context/ProgressContext';
import { UserProvider } from './src/context/UserContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { InjuryProvider } from './src/context/InjuryContext';
import { CoachAssignmentProvider } from './src/context/CoachAssignmentContext';
import './src/i18n'; // Initialize i18n
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import RoleSelectionScreen from './src/screens/auth/RoleSelectionScreen';
import ProfileSetupScreen from './src/screens/auth/ProfileSetupScreen';

// Navigation component that handles auth flow
function AppNavigator() {
  const Stack = createNativeStackNavigator();
  const { isAuthenticated, isProfileComplete, initializing, loading, profile } = useAuth();

  // Show loading screen while initializing
  if (initializing || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Debug logging
  console.log('Navigation Debug:', {
    isAuthenticated,
    hasProfile: !!profile,
    role: profile?.role,
    isProfileComplete,
    showRoleSelection: !profile || !profile.role,
    showProfileSetup: !isProfileComplete,
    showMainApp: isAuthenticated && profile?.role && isProfileComplete,
  });

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#ffffff' },
          headerTintColor: '#111827',
          headerTitleStyle: { fontWeight: '600' },
          contentStyle: { backgroundColor: '#ffffff' },
        }}
      >
        {!isAuthenticated ? (
          // Auth Stack
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : !profile || !profile.role ? (
          // Role Selection Stack - show if no profile or no role
          <Stack.Screen
            name="RoleSelection"
            component={RoleSelectionScreen}
            options={{ headerShown: false }}
          />
        ) : !isProfileComplete ? (
          // Profile Setup Stack
          <Stack.Screen
            name="ProfileSetup"
            component={ProfileSetupScreen}
            options={{ headerShown: false }}
          />
        ) : (
          // Main App Stack
          <>
            {profile?.role === 'athlete' ? (
              <Stack.Screen
                name="AthleteHome"
                component={AthleteTabs}
                options={{ headerShown: false }}
              />
            ) : (
              <Stack.Screen
                name="CoachHome"
                component={CoachTabs}
                options={{ headerShown: false }}
              />
            )}
            {/* Keep legacy screens for now */}
            <Stack.Screen
              name="RoleSelect"
              component={RoleSelect}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AthleteLogin"
              component={AthleteLogin}
              options={{ title: 'Athlete Login' }}
            />
            <Stack.Screen
              name="CoachLogin"
              component={CoachLogin}
              options={{ title: 'Coach Login' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <UserProvider>
          <PlansProvider>
            <ActivitiesProvider>
              <PostsProvider>
                <WorkoutProvider>
                  <ProgressProvider>
                    <InjuryProvider>
                      <CoachAssignmentProvider>
                        <AppNavigator />
                      </CoachAssignmentProvider>
                    </InjuryProvider>
                  </ProgressProvider>
                </WorkoutProvider>
              </PostsProvider>
            </ActivitiesProvider>
          </PlansProvider>
        </UserProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
});
