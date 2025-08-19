import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import Profile from '../screens/athlete/Profile';
import Chatbot from '../screens/athlete/Chatbot';
import CoachDirectory from '../screens/athlete/CoachDirectory';
import Plans from '../screens/athlete/Plans';
import Workout from '../screens/athlete/Workout';
import Progress from '../screens/athlete/Progress';
import Explore from '../screens/athlete/Explore';

const Tab = createBottomTabNavigator();

export default function AthleteTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Profile"
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: '#ffffff' },
        headerTintColor: '#111827',
        tabBarStyle: { backgroundColor: '#ffffff', borderTopColor: '#e5e7eb' },
        tabBarActiveTintColor: '#f97316',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'ellipse';
          switch (route.name) {
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            case 'Chatbot':
              iconName = focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
              break;
            case 'Plans':
              iconName = focused ? 'reader' : 'reader-outline';
              break;
            case 'Explore':
              iconName = focused ? 'compass' : 'compass-outline';
              break;
            case 'Workout':
              iconName = focused ? 'barbell' : 'barbell-outline';
              break;
            case 'Progress':
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
              break;
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        sceneContainerStyle: { backgroundColor: '#ffffff' },
      })}
    >
      <Tab.Screen name="Progress" component={Progress} />
      <Tab.Screen name="Plans" component={Plans} />
      <Tab.Screen name="Explore" component={Explore} />
      <Tab.Screen
        name="Chatbot"
        component={Chatbot}
        options={{
          title: 'AI Coach',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-ellipses" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="CoachDirectory"
        component={CoachDirectory}
        options={{
          title: 'Coaches',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      
      <Tab.Screen name="Workout" component={Workout} />
      
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}

