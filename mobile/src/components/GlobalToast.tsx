import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, Platform } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  withDelay, 
  runOnJS 
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle2, XCircle, Info } from 'lucide-react-native';
import { useUIStore } from '../store/useUIStore';

const { width } = Dimensions.get('window');

export function GlobalToast() {
  const { toast, hideToast } = useUIStore();
  const insets = useSafeAreaInsets();
  
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (toast?.visible) {
      translateY.value = withSpring(insets.top + 10, { damping: 15, stiffness: 100 });
      opacity.value = withTiming(1, { duration: 300 });

      // Auto-hide after 3 seconds
      const timeout = setTimeout(() => {
        closeToast();
      }, 3000);
      
      return () => clearTimeout(timeout);
    }
  }, [toast?.visible]);

  const closeToast = () => {
    translateY.value = withTiming(-100, { duration: 300 }, () => {
      runOnJS(hideToast)();
    });
    opacity.value = withTiming(0, { duration: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={[styles.toast, isSuccess && styles.success, isError && styles.error]}>
        {isSuccess && <CheckCircle2 color="#FFFFFF" size={20} style={styles.icon} />}
        {isError && <XCircle color="#FFFFFF" size={20} style={styles.icon} />}
        {!isSuccess && !isError && <Info color="#FFFFFF" size={20} style={styles.icon} />}
        <Text style={styles.message}>{toast.message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3A4C56',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    maxWidth: width * 0.9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  success: {
    backgroundColor: '#D7C8B4',
  },
  error: {
    backgroundColor: '#FF453A',
  },
  icon: {
    marginRight: 8,
  },
  message: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  }
});
