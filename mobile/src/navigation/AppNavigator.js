import React, { useContext } from 'react';
import { ActivityIndicator, View, Text, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  Home, FlaskConical, User, Brain, NotebookPen,
  MessageCircle, Settings,
} from 'lucide-react-native';

import { AuthContext } from '../context/AuthContext';

// Auth screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

// Main screens
import DashboardScreen from '../screens/DashboardScreen';
import AIStudioScreen from '../screens/AIStudioScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NotificationScreen from '../screens/NotificationScreen';
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';

// New feature screens
import ChatbotScreen from '../screens/ChatbotScreen';
import NoteLabScreen from '../screens/NoteLabScreen';
import AdaptiveLearningScreen from '../screens/AdaptiveLearningScreen';
import SettingsScreen from '../screens/SettingsScreen';

// Alchemy (existing mobile component)
import Alchemy from '../../components/Alchemy';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ─── Tab Icon Map ─────────────────────────────────────────────────────────────
const TAB_ICONS = {
  Dashboard: Home,
  Alchemy: FlaskConical,
  Chat: MessageCircle,
  Adaptive: Brain,
  NoteLab: NotebookPen,
  Profile: User,
};

// ─── Main Bottom Tabs ─────────────────────────────────────────────────────────
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          const IconComponent = TAB_ICONS[route.name] || Home;
          return <IconComponent color={color} size={focused ? size + 2 : size} />;
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          position: 'absolute',
          borderTopWidth: 1,
          borderTopColor: 'rgba(0,0,0,0.06)',
          elevation: 24,
          shadowColor: '#6366f1',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 20,
          height: Platform.OS === 'ios' ? 86 : 68,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 0.2,
        },
        tabBarBackground: () => null,
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Trang chủ' }}
      />
      <Tab.Screen
        name="Alchemy"
        component={Alchemy}
        options={{ tabBarLabel: 'Giả Kim' }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatbotScreen}
        options={{ tabBarLabel: 'Chatbot' }}
      />
      <Tab.Screen
        name="Adaptive"
        component={AdaptiveLearningScreen}
        options={{ tabBarLabel: 'Lộ trình' }}
      />
      <Tab.Screen
        name="NoteLab"
        component={NoteLabScreen}
        options={{ tabBarLabel: 'NoteLab' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Hồ sơ' }}
      />
    </Tab.Navigator>
  );
}

// ─── Main Stack (includes Settings as stack screen, not tab) ─────────────────
function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen name="Notifications" component={NotificationScreen} />
      <Stack.Screen name="AIStudio" component={AIStudioScreen} />
      {/* Alias for Chatbot — so Dashboard can navigate('Chatbot') */}
      <Stack.Screen name="Chatbot" component={ChatbotScreen} />
    </Stack.Navigator>
  );
}

// ─── Auth Stack ───────────────────────────────────────────────────────────────
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// ─── Root Navigator ───────────────────────────────────────────────────────────
export default function AppNavigator() {
  const { user, isLoading, hasSeenOnboarding } = useContext(AuthContext);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      {!hasSeenOnboarding ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        </Stack.Navigator>
      ) : user ? (
        <MainStack />
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}
