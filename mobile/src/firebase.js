import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  projectId: "the-delight-473201-h0",
  appId: "1:132639860431:web:1c3f8641c2a1afc90af9ba",
  apiKey: "AIzaSyA61PAlXCaUhoMfPZ0wYfrlwFhtQm9vpeI",
  authDomain: "the-delight-473201-h0.firebaseapp.com",
  storageBucket: "the-delight-473201-h0.firebasestorage.app",
  messagingSenderId: "132639860431",
  measurementId: ""
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
