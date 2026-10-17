import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { api } from '../lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  memberId?: string;
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, name: string) => Promise<User>;
  googleLogin: (accessToken: string) => Promise<User>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, token: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data;
      
      await SecureStore.setItemAsync('auth_session', token);
      set({ user, isLoading: false });
      return user;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  register: async (email, password, name) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/register', { email, password, name });
      const { user, token } = response.data;
      
      await SecureStore.setItemAsync('auth_session', token);
      set({ user, isLoading: false });
      return user;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  googleLogin: async (accessToken: string) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/google/verify-token', { access_token: accessToken });
      const { user, token } = response.data;
      
      await SecureStore.setItemAsync('auth_session', token);
      set({ user, isLoading: false });
      return user;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  forgotPassword: async (email: string) => {
    set({ isLoading: true });
    try {
      await api.post('/auth/forgot-password', { email });
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  resetPassword: async (email: string, token: string, password: string) => {
    set({ isLoading: true });
    try {
      await api.post('/auth/reset-password', { email, token, password });
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  logout: async () => {
    await SecureStore.deleteItemAsync('auth_session');
    set({ user: null });
  },
  checkSession: async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_session');
      if (token) {
        const response = await api.get('/auth/me');
        set({ user: response.data.user, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false, user: null });
    }
  },
}));
