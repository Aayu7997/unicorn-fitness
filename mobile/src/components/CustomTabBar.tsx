import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme, Platform, Keyboard } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getTabBarBottomPadding } from '../constants/layout';

export function CustomTabBar({ state, descriptors, navigation }: any) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const show = () => setIsKeyboardVisible(true);
    const hide = () => setIsKeyboardVisible(false);

    const s1 = Keyboard.addListener('keyboardWillShow', show);
    const s2 = Keyboard.addListener('keyboardDidShow', show);
    const s3 = Keyboard.addListener('keyboardWillHide', hide);
    const s4 = Keyboard.addListener('keyboardDidHide', hide);

    return () => {
      s1.remove();
      s2.remove();
      s3.remove();
      s4.remove();
    };
  }, []);

  // When keyboard is open (e.g. typing in chat/forms), hide bottom navigation completely
  if (isKeyboardVisible) {
    return null;
  }
  
  // UFC Theme Palette
  const activeColor = '#d96638'; // UFC Orange
  const inactiveColor = isDark ? '#8E8E93' : '#64748B';

  // Sub-routes belonging to 'more' menu to preserve active hierarchy
  const moreSubRoutes = [
    'goals', 'plans', 'programs', 'referrals', 'settings', 'support',
    'enquiries', 'measurements', 'invoices', 'expenses', 'content', 'trainers', 'advisory',
    'classes', 'inventory', 'analytics', 'bmi', 'communication', 'blog'
  ];

  const currentRoute = state.routes[state.index];

  // Strictly filter to visible tabs only (must not be href: null and must define a tabBarIcon)
  const visibleRoutes = state.routes.filter((route: any) => {
    const { options } = descriptors[route.key];
    if (options.href === null) return false;
    if (options.tabBarItemStyle?.display === 'none') return false;
    if (typeof options.tabBarIcon !== 'function') return false;
    return true;
  });

  // Calculate safe bottom padding ensuring icons stay above Android gestures & iOS home bar
  const bottomPadding = getTabBarBottomPadding(insets.bottom);

  return (
    <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      {/* Maximum Frosted Glass Blur */}
      <BlurView 
        tint={Platform.OS === 'ios' ? (isDark ? "systemChromeMaterialDark" : "systemChromeMaterialLight") : (isDark ? "dark" : "light")} 
        intensity={100} 
        style={StyleSheet.absoluteFill} 
      />
      {/* Frosted Glass Specular Gradient Layer for Luminous Depth */}
      <LinearGradient
        colors={
          isDark 
            ? ['rgba(255, 255, 255, 0.08)', 'rgba(25, 30, 38, 0.45)', 'rgba(13, 17, 23, 0.70)'] 
            : ['rgba(255, 255, 255, 0.82)', 'rgba(255, 255, 255, 0.48)', 'rgba(244, 247, 246, 0.65)']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Glass Top Edge Specular Rim Highlight */}
      <View style={[styles.topRimLight, isDark ? styles.topRimDark : styles.topRimLightColor]} />

      {/* Edge-to-edge Tab Items Row */}
      <View style={[styles.tabBarInner, { paddingBottom: bottomPadding }]}>
        <View style={styles.contentRow}>
          {visibleRoutes.map((route: any) => {
            const { options } = descriptors[route.key];
            
            // Check active state directly or if on a sub-screen belonging to this tab
            const isCurrentRouteVisible = visibleRoutes.some((r: any) => r.name === currentRoute?.name);
            const isDirectlyFocused = currentRoute?.key === route.key || currentRoute?.name === route.name;
            const isSubRouteFocused = route.name === 'more' && !isCurrentRouteVisible && moreSubRoutes.includes(currentRoute?.name);
            const isFocused = isDirectlyFocused || isSubRouteFocused;

            const label = options.title !== undefined
              ? options.title
              : options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : route.name;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate(route.name, route.params);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel || label}
                testID={options.tabBarTestID}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.tabItem}
                activeOpacity={0.7}
              >
                {/* Tab Icon */}
                <View style={[styles.iconWrapper, isFocused && styles.iconWrapperActive]}>
                  {options.tabBarIcon({
                    focused: isFocused,
                    color: isFocused ? activeColor : inactiveColor,
                    size: 22,
                  })}
                </View>

                {/* Tab Micro-label */}
                <Text 
                  style={[
                    styles.tabLabel, 
                    { color: isFocused ? activeColor : inactiveColor },
                    isFocused && styles.tabLabelActive
                  ]}
                  numberOfLines={1}
                >
                  {label}
                </Text>

                {/* Active Indicator Micro-dot */}
                <View 
                  style={[
                    styles.activeIndicator, 
                    { backgroundColor: isFocused ? activeColor : 'transparent' }
                  ]} 
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    zIndex: 1000,
    elevation: 24,
    overflow: 'hidden',
    borderTopWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
  },
  containerDark: {
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: Platform.OS === 'android' ? 'rgba(13, 17, 23, 0.85)' : 'transparent',
  },
  containerLight: {
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
    backgroundColor: Platform.OS === 'android' ? 'rgba(255, 255, 255, 0.88)' : 'transparent',
  },
  topRimLight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    zIndex: 2,
  },
  topRimDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  topRimLightColor: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  tabBarInner: {
    width: '100%',
    paddingTop: 8,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    paddingVertical: 2,
  },
  iconWrapper: {
    width: 36,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperActive: {
    backgroundColor: 'rgba(217, 102, 56, 0.12)',
    transform: [{ scale: 1.05 }],
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: -0.1,
    marginTop: 2,
    textAlign: 'center',
  },
  tabLabelActive: {
    fontWeight: '700',
  },
  activeIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 3,
  },
});
