import React, { useEffect } from 'react';
import { View, Text, useColorScheme } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { 
  useSharedValue, 
  useAnimatedProps, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CircularProgressProps {
  percentage: number;
  radius?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
}

export function CircularProgress({
  percentage,
  radius = 40,
  strokeWidth = 8,
  color,
  trackColor,
  label,
}: CircularProgressProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const finalColor = color || '#F97316'; // Primary Orange
  const finalTrackColor = trackColor || (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)');

  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(percentage, {
      duration: 1500,
      easing: Easing.out(Easing.cubic)
    });
  }, [percentage]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference - (animatedProgress.value / 100) * circumference;
    return {
      strokeDashoffset,
    };
  });

  return (
    <View className="items-center justify-center relative">
      <Svg height={radius * 2} width={radius * 2}>
        {/* Track */}
        <Circle
          stroke={finalTrackColor}
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Progress */}
        <AnimatedCircle
          stroke={finalColor}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference + ' ' + circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          rotation="-90"
          originX={radius}
          originY={radius}
        />
      </Svg>
      <View className="absolute inset-0 items-center justify-center">
        <Text className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {Math.round(percentage)}%
        </Text>
        {label && <Text className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{label}</Text>}
      </View>
    </View>
  );
}
