import 'react-native-get-random-values';
import 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import Toast from 'react-native-toast-message';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { apiPost } from './src/services/apiService';

import { AuthProvider } from './src/context/AuthContext';
import { ApiKeyProvider } from './src/context/ApiKeyContext';
import AppNavigator from './src/navigation/AppNavigator';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'web') return null;
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: 'the-delight-473201-h0', // Placeholder: should match app.json
    })).data;
    console.log('Mobile Expo Push Token:', token);
  } else {
    alert('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
        // Save token to backend
        apiPost('/api/users/push-token', { token, platform: 'expo' })
          .then(res => console.log('Push token saved to backend:', res.success))
          .catch(err => console.error('Error saving push token:', err));
      }
    });

    if (Platform.OS !== 'web') {
      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        setNotification(notification);
      });

      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('Notification response received:', response);
      });
    }

    return () => {
      if (Platform.OS !== 'web') {
        Notifications.removeNotificationSubscription(notificationListener.current);
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ApiKeyProvider>
          <AuthProvider>
            <BottomSheetModalProvider>
              <AppNavigator />
              <StatusBar style="light" />
              <Toast />
            </BottomSheetModalProvider>
          </AuthProvider>
        </ApiKeyProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
