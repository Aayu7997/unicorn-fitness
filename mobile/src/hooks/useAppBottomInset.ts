import { useState, useEffect } from 'react';
import { Platform, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getTabBarTotalHeight, getTabBarBottomPadding, TAB_BAR_CONTENT_HEIGHT } from '../constants/layout';

export interface AppBottomInsetOptions {
  hasTabBar?: boolean;
}

/**
 * Unified architectural hook for managing content spacing,
 * bottom navigation clearance, sticky CTAs, and keyboard-aware chat composers.
 */
export function useAppBottomInset(options: AppBottomInsetOptions = {}) {
  const { hasTabBar = true } = options;
  const insets = useSafeAreaInsets();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const tabBarHeight = hasTabBar ? getTabBarTotalHeight(insets.bottom) : 0;
  const bottomPadding = getTabBarBottomPadding(insets.bottom);

  // 1. Scroll inset for ScrollViews, FlatLists, SectionLists
  // Guarantees that the last item scrolls completely past the frosted tab bar with 24px breathing space.
  const scrollInset = hasTabBar ? tabBarHeight + 24 : Math.max(insets.bottom, 16) + 24;

  // 2. Fixed bottom action inset (for sticky CTAs / action bars positioned at bottom)
  const fixedActionBottom = isKeyboardVisible ? 0 : tabBarHeight;

  // 3. Chat composer inset (for AI Coach / AI Admin / Enquiries chat inputs)
  // When keyboard is open: anchored to 0 (above keyboard via KeyboardAvoidingView).
  // When keyboard is closed: anchored directly above the tab bar at tabBarHeight.
  const chatComposerBottom = isKeyboardVisible ? 0 : tabBarHeight;

  // Internal bottom padding for the composer container
  const chatComposerPaddingBottom = isKeyboardVisible 
    ? (Platform.OS === 'ios' ? 8 : 6) 
    : 8;

  // Scroll padding for chat messages list to ensure the latest bubble is never obstructed
  const chatListScrollInset = (isKeyboardVisible ? 80 : tabBarHeight + 80) + 16;

  return {
    insets,
    isKeyboardVisible,
    tabBarHeight,
    bottomPadding,
    scrollInset,
    fixedActionBottom,
    chatComposerBottom,
    chatComposerPaddingBottom,
    chatListScrollInset,
  };
}
