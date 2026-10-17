import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UIState {
  isOffline: boolean;
  setOffline: (status: boolean) => void;
  // Generic global toast/alert state
  toast: { visible: boolean; message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
  // User preferences
  themePreference: 'system' | 'light' | 'dark';
  setThemePreference: (theme: 'system' | 'light' | 'dark') => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isOffline: false,
      setOffline: (status) => set({ isOffline: status }),
      toast: null,
      showToast: (message, type = 'info') =>
        set({ toast: { visible: true, message, type } }),
      hideToast: () => set({ toast: null }),
      themePreference: 'system',
      setThemePreference: (theme) => set({ themePreference: theme }),
    }),
    {
      name: 'ufc-ui-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist theme preference
      partialize: (state) => ({ themePreference: state.themePreference }),
    }
  )
);
