import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getApiUrl = () => {
  // Use EXPO_PUBLIC_API_URL if it's explicitly set (and not the old hardcoded IP)
  if (process.env.EXPO_PUBLIC_API_URL && !process.env.EXPO_PUBLIC_API_URL.includes('10.192.47.41')) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Dynamic IP detection for local development with Expo Go
  if (__DEV__) {
    const debuggerHost = Constants.expoConfig?.hostUri;
    if (debuggerHost) {
      const ip = debuggerHost.split(':')[0];
      // Defaulting to port 3333 as defined in package.json "dev: next dev -p 3333"
      return `http://${ip}:3333/api`;
    }
    // Fallback for emulators if hostUri is unavailable
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3333/api';
    }
    return 'http://localhost:3333/api';
  }

  // Production fallback — enforce HTTPS (OWASP Mobile M5: Insecure Communication)
  const prodUrl = process.env.EXPO_PUBLIC_API_URL || 'https://unicornfitnessclub.com/api';
  if (!__DEV__ && prodUrl.startsWith('http://')) {
    console.warn('Insecure cleartext HTTP detected in production build. Upgrading to HTTPS.');
    return prodUrl.replace(/^http:\/\//i, 'https://');
  }
  return prodUrl;
};

export const API_URL = getApiUrl();

if (__DEV__) {
  if (API_URL.includes('10.0.2.2') || API_URL.includes('localhost')) {
    console.warn(`⚠️ USING EMULATOR IP (${API_URL}). IF USING A PHYSICAL DEVICE, ENSURE YOUR PHONE AND COMPUTER ARE ON THE SAME WI-FI.`);
  } else {
    console.log(`🔌 API URL Set to: ${API_URL}`);
  }
}

export const api = axios.create({
  baseURL: API_URL,
  timeout: 60000, // 60 seconds timeout for AI processing
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('auth_session');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error fetching token from secure store', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Better Network Error Handling for physical devices
    if (!error.response && error.message === 'Network Error') {
      return Promise.reject(
        new Error(`Network Error: Cannot connect to ${API_URL}. Ensure your backend is running, and your device is on the same Wi-Fi network.`)
      );
    }

    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error(`Connection Timeout: The server at ${API_URL} took too long to respond. Check your local IP configuration.`));
    }

    if (error.response?.status === 401) {
      // Clear local auth token
      try {
        await SecureStore.deleteItemAsync('auth_session');
      } catch (e) {
        console.error('Error clearing secure store', e);
      }

      try {
        // Removed dynamic requires of useAuth and expo-router that cause Metro 99.9% hang
        // The UI should handle 401s by checking session state, or we can use an event emitter.
      } catch (e) {
        console.error('Error during auto-logout', e);
      }
    }
    return Promise.reject(error);
  }
);
