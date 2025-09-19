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
import EquipmentMarketplace from '../screens/athlete/EquipmentMarketplace';
import KnowledgeHub from '../screens/athlete/KnowledgeHub';
import FundingHub from '../screens/athlete/FundingHub';
import CoachChat from '../screens/athlete/CoachChat';
import MessageCoach from '../screens/athlete/MessageCoach';
import ViewCertificates from '../screens/athlete/ViewCertificates';

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
            case 'EquipmentMarketplace':
              iconName = focused ? 'storefront' : 'storefront-outline';
              break;
            case 'KnowledgeHub':
              iconName = focused ? 'library' : 'library-outline';
              break;
            case 'FundingHub':
              iconName = focused ? 'card' : 'card-outline';
              break;
            case 'CoachChat':
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
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
      
      <Tab.Screen 
        name="EquipmentMarketplace" 
        component={EquipmentMarketplace}
        options={{
          title: 'Marketplace',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="storefront" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen 
        name="KnowledgeHub" 
        component={KnowledgeHub}
        options={{
          title: 'Knowledge',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="library" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen 
        name="FundingHub" 
        component={FundingHub}
        options={{
          title: 'Funding',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="card" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen 
        name="CoachChat" 
        component={CoachChat}
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles" size={size} color={color} />
          ),
        }}
      />
      
      <Tab.Screen name="Profile" component={Profile} />

      {/* Hidden screens for navigation */}
      <Tab.Screen name="MessageCoach" component={MessageCoach} options={{ tabBarButton: () => null }} />
      <Tab.Screen name="ViewCertificates" component={ViewCertificates} options={{ tabBarButton: () => null }} />
    </Tab.Navigator>
  );
}

