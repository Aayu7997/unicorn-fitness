import React, { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  interpolateColor
} from 'react-native-reanimated';
import Svg, { Path, Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  // 0 = Light mode, 1 = Dark mode
  const progress = useSharedValue(isDark ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isDark ? 1 : 0, { duration: 320 });
  }, [isDark]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle();
  };

  const containerStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        progress.value,
        [0, 1],
        ['#FCE7DB', '#131B26'] // Warm UFC sunrise tone on light, deep titanium obsidian on dark
      ),
      borderColor: interpolateColor(
        progress.value,
        [0, 1],
        ['rgba(217, 102, 56, 0.35)', 'rgba(255, 255, 255, 0.12)']
      ),
    };
  });

  const thumbStyle = useAnimatedStyle(() => {
    const translateX = isDark 
      ? withSpring(0, { damping: 20, stiffness: 180 })
      : withSpring(28, { damping: 20, stiffness: 180 });
      
    return {
      transform: [{ translateX }],
    };
  });

  const starStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isDark ? 1 : 0, { duration: 300 }),
    };
  });

  const cloudStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isDark ? 0 : 0.95, { duration: 300 }),
    };
  });

  const moonOpacity = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isDark ? 1 : 0, { duration: 240 }),
      position: 'absolute',
    };
  });

  const sunOpacity = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isDark ? 0 : 1, { duration: 240 }),
      position: 'absolute',
    };
  });

  return (
    <Pressable onPress={handlePress} accessible role="switch" accessibilityState={{ checked: !isDark }}>
      <Animated.View style={[styles.container, containerStyle]}>
        
        {/* Stars (Visible in Dark Mode) */}
        <Animated.View style={[styles.star, styles.star1, starStyle]} />
        <Animated.View style={[styles.star, styles.star2, starStyle]} />
        <Animated.View style={[styles.star, styles.star3, starStyle]} />

        {/* Cloud (Visible in Light Mode) */}
        <Animated.View style={[styles.cloud, cloudStyle]}>
          <Svg viewBox="0 0 16 16" width="56" height="56">
            <Path 
              transform="matrix(0.77976 0 0 0.78395 -299.99 -418.63)" 
              fill="#FFFFFF" 
              d="m391.84 540.91c-.421-.329-.949-.524-1.523-.524-1.351 0-2.451 1.084-2.485 2.435-1.395.526-2.388 1.88-2.388 3.466 0 1.874 1.385 3.423 3.182 3.667v.034h12.73v-.006c1.775-.104 3.182-1.584 3.182-3.395 0-1.747-1.309-3.186-2.994-3.379.007-.106.011-.214.011-.322 0-2.707-2.271-4.901-5.072-4.901-2.073 0-3.856 1.202-4.643 2.925" 
            />
          </Svg>
        </Animated.View>

        {/* Thumb */}
        <Animated.View style={[styles.thumb, thumbStyle]}>
          <Animated.View style={sunOpacity}>
            <Svg height="20" width="20" viewBox="0 0 24 24">
              <Circle cx="12" cy="12" r="10" fill="#EA580C" />
              <Circle cx="12" cy="12" r="6" fill="#FDBA74" />
            </Svg>
          </Animated.View>
          <Animated.View style={moonOpacity}>
            <Svg height="20" width="20" viewBox="0 0 24 24">
              <Path fill="#F1F5F9" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </Svg>
          </Animated.View>
        </Animated.View>

      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 64,
    height: 35,
    borderRadius: 30,
    borderWidth: 1.5,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: 'absolute',
    left: 8,
    top: 6.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  star: {
    backgroundColor: '#94A3B8',
    borderRadius: 2.5,
    position: 'absolute',
    width: 4,
    height: 4,
  },
  star1: { left: 40, top: 8 },
  star2: { left: 35, top: 19 },
  star3: { left: 48, top: 14 },
  cloud: {
    position: 'absolute',
    bottom: -15,
    left: -15,
  }
});
