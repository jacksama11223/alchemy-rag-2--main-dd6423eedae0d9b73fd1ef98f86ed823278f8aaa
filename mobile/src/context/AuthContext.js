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
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    checkOnboarding();
    
    if (!auth) {
      console.error("Firebase Auth instance is not available in AuthContext");
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch additional user data from Firestore if needed
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser({ ...firebaseUser, ...userDoc.data() });
          } else {
            setUser(firebaseUser);
          }
        } catch (error) {
          console.log("Error fetching user data from Firestore", error);
          setUser(firebaseUser);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (e) {
      console.log('Login error', e);
      let message = 'Đăng nhập thất bại';
      if (e.code === 'auth/invalid-credential') message = 'Email hoặc mật khẩu không đúng';
      if (e.code === 'auth/user-not-found') message = 'Tài khoản không tồn tại';
      if (e.code === 'auth/wrong-password') message = 'Mật khẩu không đúng';
      return { success: false, message };
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
      token: user ? user.uid : null, 
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

