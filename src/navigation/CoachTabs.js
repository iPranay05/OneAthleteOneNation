import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';

// Coach screens
import CoachDashboard from '../screens/coach/Dashboard';
import AthleteManagement from '../screens/coach/AthleteManagement';
import WorkoutPlanner from '../screens/coach/WorkoutPlanner';
import Analytics from '../screens/coach/Analytics';
import CoachProfile from '../screens/coach/Profile';

const Tab = createBottomTabNavigator();

export default function CoachTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Athletes':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Workouts':
              iconName = focused ? 'fitness' : 'fitness-outline';
              break;
            case 'Analytics':
              iconName = focused ? 'analytics' : 'analytics-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'home-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#f97316',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e5e7eb',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: '#ffffff',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#e5e7eb',
        },
        headerTitleStyle: {
          fontWeight: '700',
          color: '#111827',
        },
        headerTintColor: '#f97316',
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={CoachDashboard}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Athletes" 
        component={AthleteManagement}
        options={{ title: 'My Athletes' }}
      />
      <Tab.Screen 
        name="Workouts" 
        component={WorkoutPlanner}
        options={{ title: 'Workout Planner' }}
      />
      <Tab.Screen 
        name="Analytics" 
        component={Analytics}
        options={{ title: 'Analytics' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={CoachProfile}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}
