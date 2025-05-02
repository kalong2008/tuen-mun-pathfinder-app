/**
 * App Color System
 * A unified color system that combines theme colors and specific target group colors
 */

// Color scheme for different target groups
export const TARGET_COLORS = {
  PATHFINDER: '#8fce91', // 前鋒會 - Light Green
  ADVENTURER: '#6bb9f7', // 幼鋒會 - Light Blue
  BOTH: '#a17cc4',       // 前鋒會及幼鋒會 - Light Purple
};

// Tint colors for light/dark themes
const tintColorLight = '#3c73e9';
const tintColorDark = '#4e82f7';

// Define the theme color types
type ThemeColorKey = 'text' | 'background' | 'tint' | 'icon' | 'tabIconDefault' 
  | 'tabIconSelected' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger';

type ColorTheme = {
  [key in ThemeColorKey]: string;
};

// Theme-based colors
export const Colors: {
  light: ColorTheme;
  dark: ColorTheme;
} = {
  light: {
    text: '#11181C',
    background: '#ffffff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    primary: '#3c73e9',
    secondary: '#0a7ea4',
    success: '#8fce91',
    info: '#6bb9f7',
    warning: '#ffeb3b',
    danger: '#ff3b30',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    primary: '#4e82f7',
    secondary: '#4eb5e5',
    success: '#a0e0a3',
    info: '#89c4f9',
    warning: '#fff176',
    danger: '#ff6b60',
  },
};

// Legacy APP_COLORS structure (for backward compatibility)
export const APP_COLORS = {
  PRIMARY: Colors.light.primary,
  BACKGROUND: Colors.light.background,
  TEXT: {
    PRIMARY: Colors.light.text,
    SECONDARY: '#666666'
  },
  STATUS: {
    NEW: Colors.light.danger,
    INFO: Colors.light.warning
  }
};

// Default export with complete color system
export default {
  TARGET_COLORS,
  APP_COLORS,
  Colors,
  // Helper function to get color based on theme
  getThemeColor: (colorName: ThemeColorKey, colorScheme: 'light' | 'dark' = 'light') => {
    return Colors[colorScheme][colorName];
  }
}; 