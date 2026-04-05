import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const inMemoryStorage = {};

const safeStorage = {
  getItem: async (key) => {
    try {
      if (Platform.OS === 'web') {
        return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
      }
      return await AsyncStorage.getItem(key);
    } catch (e) {
      console.log(`Error getting item ${key}, falling back to memory:`, e.message);
      return inMemoryStorage[key] || null;
    }
  },
  setItem: async (key, value) => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
      } else {
        await AsyncStorage.setItem(key, value);
      }
    } catch (e) {
      console.log(`Error setting item ${key}, falling back to memory:`, e.message);
      inMemoryStorage[key] = value;
    }
  },
  removeItem: async (key) => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') window.localStorage.removeItem(key);
      } else {
        await AsyncStorage.removeItem(key);
      }
    } catch (e) {
      console.log(`Error removing item ${key}, falling back to memory:`, e.message);
      delete inMemoryStorage[key];
    }
  }
};

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [backendToken, setBackendToken] = useState(null);
  const [backendUrl, setBackendUrlState] = useState('http://localhost:5000');
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    loadBackendUrl();
    checkOnboarding();
    
    if (!auth) {
      console.error("Firebase Auth instance is not available in AuthContext");
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // 1. Get Firebase ID Token
          const idToken = await firebaseUser.getIdToken();
          
          // 2. Exchange for Backend JWT
          // Note: We'll try to fetch from AsyncStorage first if already synced, or call backend
          const storedToken = await safeStorage.getItem('userToken');
          
          // Call backend to sync/login
          const baseUrl = await safeStorage.getItem('backend_base_url') || 'http://localhost:5000';
          console.log(`[Auth] Syncing with backend: ${baseUrl}/api/users/social`);
          
          try {
            const response = await fetch(`${baseUrl}/api/users/social`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ provider: 'google', idToken })
            });
            const data = await response.json();
            
            if (data.token) {
              await safeStorage.setItem('userToken', data.token);
              setBackendToken(data.token);
              console.log('[Auth] Backend token sync successful');
            }
          } catch (backendErr) {
            console.warn('[Auth] Backend sync failed, using stored token if available', backendErr.message);
            if (storedToken) setBackendToken(storedToken);
          }

          // 3. Fetch additional user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser({ ...firebaseUser, ...userDoc.data() });
          } else {
            setUser(firebaseUser);
          }
        } catch (error) {
          console.log("Error during auth state sync", error);
          setUser(firebaseUser);
        }
      } else {
        setUser(null);
        setBackendToken(null);
        await safeStorage.removeItem('userToken');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadBackendUrl = async () => {
    const stored = await safeStorage.getItem('backend_base_url');
    if (stored) setBackendUrlState(stored);
  };

  const setBackendUrl = async (url) => {
    await safeStorage.setItem('backend_base_url', url);
    setBackendUrlState(url);
  };

  const checkOnboarding = async () => {
    try {
      const onboarded = await safeStorage.getItem('hasSeenOnboarding');
      setHasSeenOnboarding(onboarded === 'true');
    } catch (e) {
      console.log('Failed to fetch onboarding status', e);
    }
  };

  const completeOnboarding = async () => {
    try {
      await safeStorage.setItem('hasSeenOnboarding', 'true');
      setHasSeenOnboarding(true);
    } catch (e) {
      console.log('Error saving onboarding status', e);
    }
  };

  const login = async (email, password) => {
    try {
      // 1. First attempt: Firebase Login
      // This is necessary for push notifications and other Firebase features
      try {
        await signInWithEmailAndPassword(auth, email, password);
        return { success: true };
      } catch (firebaseErr) {
        console.log('[Auth] Firebase login failed, attempting Backend MongoDB fallback...', firebaseErr.code);
        
        // 2. Fallback attempt: Backend API (MongoDB)
        // If Firebase fails (e.g. user exists in MongoDB only), we try the backend directly.
        const baseUrl = await safeStorage.getItem('backend_base_url') || 'http://localhost:5000';
        
        const response = await fetch(`${baseUrl}/api/users/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        
        const backendData = await response.json();
        
        if (response.ok && backendData.token) {
          // Success! User exists in MongoDB.
          await safeStorage.setItem('userToken', backendData.token);
          setBackendToken(backendData.token);
          
          // Set a minimal user object so the app thinks we are logged in
          setUser({
            uid: backendData.id,
            email: backendData.email,
            displayName: backendData.name,
            ...backendData
          });
          
          console.log('[Auth] Backend MongoDB login successful');
          return { success: true };
        } else {
          // Both failed
          let message = 'Đăng nhập thất bại';
          if (backendData.message) message = backendData.message;
          else if (firebaseErr.code === 'auth/invalid-credential') message = 'Email hoặc mật khẩu không đúng';
          else if (firebaseErr.code === 'auth/user-not-found') message = 'Tài khoản không tồn tại';
          
          return { success: false, message };
        }
      }
    } catch (e) {
      console.log('Dual Login error', e);
      return { success: false, message: 'Lỗi hệ thống khi đăng nhập' };
    }
  };

  const register = async (name, email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update profile with name
      await updateProfile(firebaseUser, { displayName: name });
      
      // Save additional user data to Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        name,
        email,
        createdAt: new Date().toISOString(),
        role: 'user'
      });
      
      return { success: true };
    } catch (e) {
      console.log('Register error', e);
      let message = 'Đăng ký thất bại';
      if (e.code === 'auth/email-already-in-use') message = 'Email này đã được sử dụng';
      if (e.code === 'auth/weak-password') message = 'Mật khẩu quá yếu (ít nhất 6 ký tự)';
      if (e.code === 'auth/invalid-email') message = 'Email không hợp lệ';
      return { success: false, message };
    }
  };

  const forgotPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (e) {
      console.log('Forgot password error', e);
      let message = 'Có lỗi xảy ra';
      if (e.code === 'auth/user-not-found') message = 'Không tìm thấy tài khoản với email này';
      if (e.code === 'auth/invalid-email') message = 'Email không hợp lệ';
      return { success: false, message };
    }
  };

  const socialLogin = async (provider, socialToken) => {
    console.log(`Social login requested for ${provider}, but native modules are not available in Expo Go.`);
    return { success: false, message: `Đăng nhập ${provider} yêu cầu bản build native (Dev Client). Vui lòng dùng Email/Mật khẩu.` };
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.log('Logout error', e);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token: backendToken || (user ? user.uid : null), 
      backendToken,
      backendUrl,
      setBackendUrl,
      isLoading, 
      hasSeenOnboarding, 
      completeOnboarding, 
      login, 
      register, 
      forgotPassword, 
      socialLogin, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

