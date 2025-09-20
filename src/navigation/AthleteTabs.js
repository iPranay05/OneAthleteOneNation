import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
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
import MyCoaches from '../screens/athlete/MyCoaches';
import UserProfile from '../screens/shared/UserProfile';
import DirectMessage from '../screens/shared/DirectMessage';

const Tab = createMaterialTopTabNavigator();

export default function AthleteTabs() {
  return (
    <Tab.Navigator
      tabBarPosition="bottom"
      screenOptions={({ route }) => ({
        tabBarScrollEnabled: true,
        tabBarShowIcon: true, // 👈 important for icons
        tabBarIndicatorStyle: { backgroundColor: '#f97316' },
        tabBarActiveTintColor: '#f97316',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarLabelStyle: { fontSize: 10 },
        tabBarItemStyle: { width: 100 }, // make each tab wider
        tabBarIcon: ({ focused, color }) => {
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
            case 'Marketplace':
              iconName = focused ? 'storefront' : 'storefront-outline';
              break;
            case 'Knowledge':
              iconName = focused ? 'library' : 'library-outline';
              break;
            case 'Funding':
              iconName = focused ? 'card' : 'card-outline';
              break;
            case 'Messages':
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              break;
          }
          return <Ionicons name={iconName} size={20} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Progress" component={Progress} />
      <Tab.Screen name="Plans" component={Plans} />
      <Tab.Screen name="Explore" component={Explore} />
      <Tab.Screen name="Chatbot" component={Chatbot} />
      <Tab.Screen name="CoachDirectory" component={CoachDirectory} options={{ title: 'Coaches' }} />
      <Tab.Screen name="Workout" component={Workout} />
      <Tab.Screen name="Marketplace" component={EquipmentMarketplace} />
      <Tab.Screen name="Knowledge" component={KnowledgeHub} />
      <Tab.Screen name="Funding" component={FundingHub} />
      <Tab.Screen name="Messages" component={CoachChat} />
      <Tab.Screen name="Profile" component={Profile} />
      
      {/* Hidden screens for navigation */}
      <Tab.Screen 
                                              name="MyCoaches" 
        component={MyCoaches} 
        options={{ 
          tabBarButton: () => null,
          tabBarStyle: { display: 'none' }
        }} 
      />
      <Tab.Screen 
        name="UserProfile" 
        component={UserProfile} 
        options={{ 
          tabBarButton: () => null,
          tabBarStyle: { display: 'none' }
        }} 
      />
      <Tab.Screen 
        name="DirectMessage" 
        component={DirectMessage} 
        options={{ 
          tabBarButton: () => null,
          tabBarStyle: { display: 'none' }
        }} 
      />
    </Tab.Navigator>
  );
}
