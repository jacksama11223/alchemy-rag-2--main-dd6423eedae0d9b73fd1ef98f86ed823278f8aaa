import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "YOUR_APP_ID",
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || ""
};

// Initialize Firebase App
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Firebase Auth with persistence using a global singleton
let auth;
if (!global.firebaseAuth) {
  try {
    if (Platform.OS === 'web') {
      auth = initializeAuth(app, {
        persistence: browserLocalPersistence,
      });
    } else {
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    }
    global.firebaseAuth = auth;
  } catch (e) {
    // If initializeAuth fails, try to get existing auth instance
    try {
      auth = getAuth(app);
      global.firebaseAuth = auth;
    } catch (innerE) {
      console.error("Firebase Auth initialization failed:", innerE);
    }
  }
} else {
  auth = global.firebaseAuth;
}

// Initialize Firestore with specific database ID
const db = getFirestore(app, "ai-studio-214152c2-8a48-4bf4-96e2-ae77932e1db9");

export { auth, db };
