import React from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, Easing } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

interface Props {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function AnimatedSaveButton({ onPress, loading, disabled }: Props) {
  const scale = useSharedValue(1);
  const hoverTranslateX = useSharedValue(0);
  const hoverScale = useSharedValue(1);
  const textOpacity = useSharedValue(1);

  const handlePressIn = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSpring(0.95, { damping: 10, stiffness: 400 });
    hoverTranslateX.value = withTiming(10, { duration: 300, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
    hoverScale.value = withTiming(1.1, { duration: 300, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
    textOpacity.value = withTiming(0, { duration: 300, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
  };

  const handlePressOut = () => {
    if (disabled || loading) return;
    scale.value = withSpring(1, { damping: 10, stiffness: 400 });
    hoverTranslateX.value = withTiming(0, { duration: 300, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
    hoverScale.value = withTiming(1, { duration: 300, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
    textOpacity.value = withTiming(1, { duration: 300, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
  };

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: hoverTranslateX.value },
      { scale: hoverScale.value }
    ]
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
    >
      <Animated.View style={[styles.button, containerStyle, (disabled || loading) && { opacity: 0.5 }]}>
        <Animated.View style={iconStyle}>
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Svg viewBox="0 0 24 24" width={30} height={30}>
              <Path 
                fill="#9b9999" 
                d="M22,15.04C22,17.23 20.24,19 18.07,19H5.93C3.76,19 2,17.23 2,15.04C2,13.07 3.43,11.44 5.31,11.14C5.28,11 5.27,10.86 5.27,10.71C5.27,9.33 6.38,8.2 7.76,8.2C8.37,8.2 8.94,8.43 9.37,8.8C10.14,7.05 11.13,5.44 13.91,5.44C17.28,5.44 18.87,8.06 18.87,10.83C18.87,10.94 18.87,11.06 18.86,11.17C20.65,11.54 22,13.13 22,15.04Z" 
              />
            </Svg>
          )}
        </Animated.View>
        <Animated.View style={[styles.textContainer, textStyle]}>
          <Text style={styles.text}>{loading ? 'Saving...' : 'Save'}</Text>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#212121',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingRight: 20,
    paddingLeft: 18,
    borderRadius: 15,
    minHeight: 56,
  },
  textContainer: {
    marginLeft: 6,
  },
  text: {
    color: 'white',
    fontSize: 20,
    fontWeight: '900',
  }
});
