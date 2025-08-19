import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
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

export default function App() {
  const Stack = createNativeStackNavigator();
  return (
    <PlansProvider>
      <ActivitiesProvider>
        <PostsProvider>
          <WorkoutProvider>
            <ProgressProvider>
              <NavigationContainer>
          <StatusBar style="dark" />
          <Stack.Navigator
        initialRouteName="RoleSelect"
        screenOptions={{
          headerStyle: { backgroundColor: '#ffffff' },
          headerTintColor: '#111827',
          headerTitleStyle: { fontWeight: '600' },
          contentStyle: { backgroundColor: '#ffffff' },
        }}
      >
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
        <Stack.Screen
          name="AthleteHome"
          component={AthleteTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CoachHome"
          component={CoachTabs}
          options={{ headerShown: false }}
        />
          </Stack.Navigator>
              </NavigationContainer>
            </ProgressProvider>
          </WorkoutProvider>
        </PostsProvider>
      </ActivitiesProvider>
    </PlansProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
