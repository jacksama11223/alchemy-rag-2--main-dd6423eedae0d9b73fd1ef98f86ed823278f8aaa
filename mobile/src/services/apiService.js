/**
 * apiService.js
 * Centralized HTTP client for backend calls.
 * Auto-injects:
 *   - x-gemini-api-key header from AsyncStorage
 *   - Authorization: Bearer <firebaseIdToken> (if available)
 * 
 * Usage:
 *   import { apiPost, apiGet } from './apiService';
 *   const data = await apiPost('/api/chat/ai', { message: 'hello' });
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../firebase';

const STORAGE_KEY_API = 'custom_gemini_api_key';
const STORAGE_KEY_BACKEND = 'backend_base_url';
const FALLBACK_BACKEND = 'http://192.168.1.100:5000';

const getBaseUrl = async () => {
  try {
    const url = await AsyncStorage.getItem(STORAGE_KEY_BACKEND);
    return url || FALLBACK_BACKEND;
  } catch {
    return FALLBACK_BACKEND;
  }
};

const buildHeaders = async () => {
  const headers = { 'Content-Type': 'application/json' };

  // Gemini API Key
  try {
    const geminiKey = await AsyncStorage.getItem(STORAGE_KEY_API);
    if (geminiKey) headers['x-gemini-api-key'] = geminiKey;
  } catch {}

  // Firebase ID Token for backend auth
  try {
    const firebaseUser = auth?.currentUser;
    if (firebaseUser) {
      const token = await firebaseUser.getIdToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
  } catch {}

  return headers;
};

export const apiGet = async (path, timeout = 15000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const [baseUrl, headers] = await Promise.all([getBaseUrl(), buildHeaders()]);
    const res = await fetch(`${baseUrl}${path}`, {
      method: 'GET',
      headers,
      signal: controller.signal,
    });

    clearTimeout(timer);
    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.message || `HTTP ${res.status}`);
    }
    return { success: true, data: json };
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      return { success: false, error: 'Request timeout. Kiểm tra backend đang chạy không?' };
    }
    return { success: false, error: err.message };
  }
};

export const apiPost = async (path, body, timeout = 30000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const [baseUrl, headers] = await Promise.all([getBaseUrl(), buildHeaders()]);
    const res = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timer);
    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.message || `HTTP ${res.status}`);
    }
    return { success: true, data: json };
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      return { success: false, error: 'Request timeout. Kiểm tra backend đang chạy không?' };
    }
    return { success: false, error: err.message };
  }
};

export const apiPut = async (path, body, timeout = 15000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const [baseUrl, headers] = await Promise.all([getBaseUrl(), buildHeaders()]);
    const res = await fetch(`${baseUrl}${path}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timer);
    const json = await res.json();

    if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`);
    return { success: true, data: json };
  } catch (err) {
    clearTimeout(timer);
    return { success: false, error: err.message };
  }
};

export const apiDelete = async (path, timeout = 15000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const [baseUrl, headers] = await Promise.all([getBaseUrl(), buildHeaders()]);
    const res = await fetch(`${baseUrl}${path}`, {
      method: 'DELETE',
      headers,
      signal: controller.signal,
    });

    clearTimeout(timer);
    const json = await res.json();

    if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`);
    return { success: true, data: json };
  } catch (err) {
    clearTimeout(timer);
    return { success: false, error: err.message };
  }
};
