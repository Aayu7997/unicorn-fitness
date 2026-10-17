import { Platform } from 'react-native';

/**
 * Global layout constants defining the single source of truth
 * for bottom navigation, safe-area insets, and content padding.
 */

// Tab bar content height (52px active row + 8px top padding)
export const TAB_BAR_CONTENT_HEIGHT = 60;

/**
 * Calculates the dynamic bottom padding required by the tab bar
 * to comfortably clear Android gesture navigation bars and iOS Home Indicators.
 */
export function getTabBarBottomPadding(insetsBottom: number): number {
  return Math.max(insetsBottom, Platform.OS === 'ios' ? 20 : 12);
}

/**
 * Calculates the total rendered height of the CustomTabBar.
 */
export function getTabBarTotalHeight(insetsBottom: number): number {
  return TAB_BAR_CONTENT_HEIGHT + getTabBarBottomPadding(insetsBottom);
}
