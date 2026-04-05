import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const STORAGE_KEY_API = 'custom_gemini_api_key';
const STORAGE_KEY_BACKEND = 'backend_base_url';

// Default backend URL - user changes this in Settings
// On Web, localhost:5000 is usually the right default for development. 
// On Mobile, we provide a placeholder that the user should update.
const DEFAULT_BACKEND_URL = Platform.OS === 'web' 
  ? 'http://localhost:5000' 
  : 'http://192.168.1.100:5000';

export const ApiKeyContext = createContext({
  apiKey: '',
  backendUrl: DEFAULT_BACKEND_URL,
  setApiKey: () => {},
  setBackendUrl: () => {},
  hasApiKey: false,
  isLoaded: false,
});

export const ApiKeyProvider = ({ children }) => {
  const [apiKey, setApiKeyState] = useState('');
  const [backendUrl, setBackendUrlState] = useState(DEFAULT_BACKEND_URL);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [storedKey, storedUrl] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY_API),
          AsyncStorage.getItem(STORAGE_KEY_BACKEND),
        ]);
        if (storedKey) setApiKeyState(storedKey);
        if (storedUrl) setBackendUrlState(storedUrl);
      } catch (e) {
        console.warn('[ApiKeyContext] Load error:', e.message);
      } finally {
        setIsLoaded(true);
      }
    };
    load();
  }, []);

  const setApiKey = useCallback(async (key) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_API, key);
      setApiKeyState(key);
    } catch (e) {
      console.warn('[ApiKeyContext] Save API key error:', e.message);
    }
  }, []);

  const setBackendUrl = useCallback(async (url) => {
    try {
      const clean = url.replace(/\/$/, ''); // remove trailing slash
      await AsyncStorage.setItem(STORAGE_KEY_BACKEND, clean);
      setBackendUrlState(clean);
    } catch (e) {
      console.warn('[ApiKeyContext] Save backend URL error:', e.message);
    }
  }, []);

  return (
    <ApiKeyContext.Provider
      value={{
        apiKey,
        backendUrl,
        setApiKey,
        setBackendUrl,
        hasApiKey: apiKey.trim().length > 10,
        isLoaded,
      }}
    >
      {children}
    </ApiKeyContext.Provider>
  );
};

export const useApiKey = () => useContext(ApiKeyContext);
