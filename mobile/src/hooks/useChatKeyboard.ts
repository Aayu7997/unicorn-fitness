import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform, Keyboard, LayoutAnimation, UIManager, BackHandler } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getTabBarTotalHeight } from '../constants/layout';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface ChatKeyboardOptions {
  hasTabBar?: boolean;
}

/**
 * Enterprise-grade keyboard and safe-area layout hook specifically designed
 * for chat and messaging surfaces (AI Coach, AI Admin, Enquiries).
 *
 * Guarantees:
 * 1. Safe Area Header -> Dynamic Message List (flex: 1) -> In-flow Composer -> Keyboard / TabBar.
 * 2. When keyboard is CLOSED: composer sits flush directly above the bottom tab bar.
 * 3. When keyboard is OPEN: tab bar hides and composer rests precisely above the soft keyboard.
 * 4. Automatically handles edge-to-edge Android, legacy adjustResize, and iOS home indicators.
 * 5. Handles Android hardware back button to cleanly dismiss keyboard first.
 */
export function useChatKeyboard(options: ChatKeyboardOptions = {}) {
  const { hasTabBar = true } = options;
  const insets = useSafeAreaInsets();

  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  
  const initialHeightRef = useRef(0);
  const [containerHeight, setContainerHeight] = useState(0);

  const tabBarHeight = hasTabBar ? getTabBarTotalHeight(insets.bottom) : 0;
  const closedBottomSpacing = hasTabBar ? tabBarHeight : insets.bottom;

  const onContainerLayout = useCallback((e: any) => {
    const height = e.nativeEvent.layout.height;
    if (height > 0) {
      setContainerHeight(height);
      // Capture the unconstrained container height when keyboard is closed
      if (initialHeightRef.current === 0 || (!isKeyboardVisible && height > initialHeightRef.current)) {
        initialHeightRef.current = height;
      }
    }
  }, [isKeyboardVisible]);

  useEffect(() => {
    const onShow = (e: any) => {
      const kh = e?.endCoordinates?.height || 0;
      if (kh > 0) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setKeyboardHeight(kh);
        setIsKeyboardVisible(true);
      }
    };

    const onHide = () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setKeyboardHeight(0);
      setIsKeyboardVisible(false);
    };

    const s1 = Keyboard.addListener('keyboardWillShow', onShow);
    const s2 = Keyboard.addListener('keyboardDidShow', onShow);
    const s3 = Keyboard.addListener('keyboardWillHide', onHide);
    const s4 = Keyboard.addListener('keyboardDidHide', onHide);

    return () => {
      s1.remove();
      s2.remove();
      s3.remove();
      s4.remove();
    };
  }, []);

  // Android hardware back button handler: dismiss keyboard when active
  useEffect(() => {
    if (!isKeyboardVisible || Platform.OS !== 'android') return;

    const backAction = () => {
      Keyboard.dismiss();
      return true; // Consume event to prevent accidental screen back navigation
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => subscription.remove();
  }, [isKeyboardVisible]);

  // Measure how much the window already shrank if the OS performed an adjustResize
  const windowShrink = (initialHeightRef.current > 0 && containerHeight > 0 && isKeyboardVisible)
    ? Math.max(0, initialHeightRef.current - containerHeight)
    : 0;

  // The remaining inset required to clear the soft keyboard
  const effectiveKeyboardInset = isKeyboardVisible
    ? Math.max(0, keyboardHeight - windowShrink)
    : 0;

  // When keyboard is open: space = effectiveKeyboardInset (directly above keyboard)
  // When keyboard is closed: space = closedBottomSpacing (directly above CustomTabBar or safe area)
  const bottomSpacing = isKeyboardVisible ? effectiveKeyboardInset : closedBottomSpacing;

  const dismissKeyboard = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  return {
    insets,
    keyboardHeight,
    isKeyboardVisible,
    tabBarHeight,
    bottomSpacing,
    onContainerLayout,
    dismissKeyboard,
  };
}
