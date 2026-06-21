// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING: Record<string, ComponentProps<typeof MaterialIcons>['name']> = {
  'house': 'home',
  'house.fill': 'home',
  'photo.stack': 'collections',
  'photo.stack.fill': 'photo-library',
  'calendar': 'calendar-today',
  'calendar.circle.fill': 'event',
  'bell': 'notifications-none',
  'bell.fill': 'notifications',
  'doc.text': 'description',
  'doc.text.fill': 'article',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'envelope.fill': 'email',
  'ellipsis.circle.fill': 'more-horiz',
  'square.grid.2x2.fill': 'apps',
  'list.bullet': 'format-list-bulleted',
  'chevron.down': 'keyboard-arrow-down',
  'arrow.up.arrow.down': 'swap-vert',
  'rectangle.portrait.and.arrow.right': 'crop-portrait',
  'checkmark': 'check',
  'line.3.horizontal': 'menu',
  'line.3.horizontal.decrease': 'tune',
  'person.fill': 'person',
  'xmark': 'close',
  'envelope.badge.fill': 'mark-email-read',
  'info.circle.fill': 'info',
  'location.fill': 'location-on',
  'phone.fill': 'phone',
  'clock.fill': 'access-time',
  'bookmark.fill': 'bookmark',
  'gearshape.fill': 'settings',
  'line.3.horizontal.decrease.circle': 'tune',
};

// Define the allowed icon names from our mapping
type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  // Use Material icons for Android and other platforms
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
