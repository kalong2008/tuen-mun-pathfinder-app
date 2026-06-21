/**
 * Outdoor Trail theme — warm, trustworthy shell with club accent colors on content.
 */

export const TARGET_COLORS = {
  PATHFINDER: '#8fce91',
  ADVENTURER: '#6bb9f7',
  BOTH: '#a17cc4',
};

type ThemeColorKey =
  | 'text'
  | 'background'
  | 'tint'
  | 'icon'
  | 'tabIconDefault'
  | 'tabIconSelected'
  | 'primary'
  | 'primarySoft'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warning'
  | 'danger';

type ColorTheme = {
  [key in ThemeColorKey]: string;
};

const tintColorLight = '#2D6A4F';
const tintColorDark = '#40916C';

export const Colors: {
  light: ColorTheme;
  dark: ColorTheme;
} = {
  light: {
    text: '#1B4332',
    background: '#F7F5F0',
    tint: tintColorLight,
    icon: '#52796F',
    tabIconDefault: '#74A892',
    tabIconSelected: tintColorLight,
    primary: '#2D6A4F',
    primarySoft: '#D8F3DC',
    secondary: '#40916C',
    success: '#52B788',
    info: '#6bb9f7',
    warning: '#E9C46A',
    danger: '#E76F51',
  },
  dark: {
    text: '#D8F3DC',
    background: '#0D1B14',
    tint: tintColorDark,
    icon: '#95D5B2',
    tabIconDefault: '#74A892',
    tabIconSelected: tintColorDark,
    primary: '#40916C',
    primarySoft: '#1B4332',
    secondary: '#52B788',
    success: '#8fce91',
    info: '#89c4f9',
    warning: '#F4D35E',
    danger: '#F4845F',
  },
};

export const APP_COLORS = {
  PRIMARY: Colors.light.primary,
  BACKGROUND: Colors.light.background,
  TEXT: {
    PRIMARY: Colors.light.text,
    SECONDARY: '#52796F',
  },
  STATUS: {
    NEW: Colors.light.danger,
    INFO: Colors.light.warning,
  },
};

export default {
  TARGET_COLORS,
  APP_COLORS,
  Colors,
  getThemeColor: (colorName: ThemeColorKey, colorScheme: 'light' | 'dark' = 'light') => {
    return Colors[colorScheme][colorName];
  },
};
