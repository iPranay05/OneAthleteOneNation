import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';

// Coach screens
import CoachDashboard from '../screens/coach/Dashboard';
import AthleteManagement from '../screens/coach/AthleteManagement';
import WorkoutPlanner from '../screens/coach/WorkoutPlanner';
import Analytics from '../screens/coach/Analytics';
import CoachProfile from '../screens/coach/Profile';
import MessageAthlete from '../screens/coach/MessageAthlete';
import AssignWorkout from '../screens/coach/AssignWorkout';
import ViewProgress from '../screens/coach/ViewProgress';
import ScheduleSession from '../screens/coach/ScheduleSession';

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
          return <Ionicons name={iconName} size={29} color={color} />;
        },
        tabBarActiveTintColor: '#f97316',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e5e7eb',
          paddingBottom: 5,
          paddingTop: 8,
          height: 75,
          marginHorizontal: 1,
          paddingHorizontal: 45,
          
          justifyContent: 'space-around',  // Add this line
        },
        tabBarLabelStyle: {
          fontSize: 8,
          fontWeight: '500',
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingHorizontal: 2,
          marginHorizontal: 1,
          minWidth: 60,
          paddingLeft: 8,
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
        options={{ 
          title: 'Dashboard',
          tabBarLabel: 'Home'
        }}
      />

      <Tab.Screen 
        name="Athletes" 
        component={AthleteManagement}
        options={{ 
          title: 'My Athletes',
          tabBarLabel: 'Athletes'
        }}
      />
      <Tab.Screen 
        name="Workouts" 
        component={WorkoutPlanner}
        options={{ 
          title: 'Workout Planner',
          tabBarLabel: 'Plans'
        }}
      />
      <Tab.Screen 
        name="Analytics" 
        component={Analytics}
        options={{ 
          title: 'Analytics',
          tabBarLabel: 'Stats'
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={CoachProfile}
        options={{ 
          title: 'Profile',
          tabBarLabel: 'Profile'
        }}
      />
      
      {/* Hidden screens for coach actions */}
      <Tab.Screen name="MessageAthlete" component={MessageAthlete} options={{ tabBarButton: () => null }} />
      <Tab.Screen name="AssignWorkout" component={AssignWorkout} options={{ tabBarButton: () => null }} />
      <Tab.Screen name="ViewProgress" component={ViewProgress} options={{ tabBarButton: () => null }} />
      <Tab.Screen name="ScheduleSession" component={ScheduleSession} options={{ tabBarButton: () => null }} />
    </Tab.Navigator>
  );
}
