import 'react-native-gesture-handler';
import 'react-native-reanimated';
import '../global.css';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme, View, Image, StyleSheet, Dimensions, Platform } from 'react-native';
import { useEffect, useState } from 'react';
import { Slot, useRouter } from 'expo-router';
// import * as Notifications from 'expo-notifications';
import { useAuth } from '../hooks/useAuth';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Animated, { 
  FadeOut, 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { GlobalToast } from '../components/GlobalToast';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

/*
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});
*/

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      gcTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: true, // Keep data fresh when coming back to the app
      retry: 1, // Only retry once to avoid freezing UI for too long
    },
  },
});

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});
const { width, height } = Dimensions.get('window');

const CustomSplashScreen = () => {
  useEffect(() => {
    // Hide the native splash screen immediately so we see our custom one
    SplashScreen.hideAsync();
  }, []);

  return (
    <Animated.View exiting={FadeOut.duration(500)} style={styles.splashContainer} />
  );
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isLoading, checkSession } = useAuth();
  const router = useRouter();
  // const lastNotificationResponse = Notifications.useLastNotificationResponse();
  
  // Custom theme colors based on brand
  const ufcDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: '#000000',
      primary: '#D7C8B4',
      card: '#1C1C1E',
      text: '#FFFFFF',
      border: '#38383A'
    }
  };

  const ufcLightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: '#F2F2F7',
      primary: '#D7C8B4',
      card: '#FFFFFF',
      text: '#000000',
      border: '#C6C6C8'
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  /*
  useEffect(() => {
    if (
      lastNotificationResponse &&
      lastNotificationResponse.notification.request.content.data?.url &&
      lastNotificationResponse.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER
    ) {
      // If the user tapped on a notification, we can deep link them to the URL
      const url = lastNotificationResponse.notification.request.content.data.url;
      try {
        router.push(url as any);
      } catch (e) {
        console.log("Could not deep link to", url, e);
      }
    }
  }, [lastNotificationResponse]);
  */

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PersistQueryClientProvider client={queryClient} persistOptions={{ persister: asyncStoragePersister }}>
          <ThemeProvider value={colorScheme === 'dark' ? ufcDarkTheme : ufcLightTheme}>
            <Slot />
            {/* Render Custom Splash Screen over the app while auth is loading */}
            {isLoading && <CustomSplashScreen />}
            <GlobalToast />
          </ThemeProvider>
        </PersistQueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000000',
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  splashLogo: {
    width: 150,
    height: 150,
  }
});
