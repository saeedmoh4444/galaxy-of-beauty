import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import type { StyleProp, TextStyle } from 'react-native';

/**
 * Curated icon set — mirrors the web packages/ui Icon (SVG) for React Native.
 * Icons render from the Ionicons font, which loads automatically on first use.
 * Replaces emoji-only visual indicators with consistent, accessible glyphs.
 *
 * Usage:
 *   <Icon name="check-circle" size={32} color="#059669" />
 *   <TouchableOpacity><Icon name="plus" size="sm" /> إضافة</TouchableOpacity>
 */
export type IconName =
  | 'search'
  | 'calendar'
  | 'user'
  | 'heart'
  | 'star'
  | 'check'
  | 'check-circle'
  | 'close'
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-down'
  | 'plus'
  | 'trash'
  | 'edit'
  | 'bell'
  | 'wallet'
  | 'map-pin'
  | 'clock'
  | 'filter'
  | 'gift'
  | 'sparkle'
  | 'chat'
  | 'share'
  | 'bookmark'
  | 'settings'
  | 'camera'
  | 'upload'
  | 'download'
  | 'external-link'
  | 'menu'
  | 'more-horizontal'
  | 'shield-check'
  | 'lock'
  | 'users';

const GLYPHS: Record<IconName, ComponentProps<typeof Ionicons>['name']> = {
  search: 'search',
  calendar: 'calendar-outline',
  user: 'person-outline',
  heart: 'heart-outline',
  star: 'star',
  check: 'checkmark',
  'check-circle': 'checkmark-circle',
  close: 'close',
  'chevron-left': 'chevron-back',
  'chevron-right': 'chevron-forward',
  'chevron-down': 'chevron-down',
  plus: 'add',
  trash: 'trash-outline',
  edit: 'create-outline',
  bell: 'notifications-outline',
  wallet: 'wallet-outline',
  'map-pin': 'location-outline',
  clock: 'time-outline',
  filter: 'funnel-outline',
  gift: 'gift-outline',
  sparkle: 'sparkles-outline',
  chat: 'chatbubble-outline',
  share: 'share-social-outline',
  bookmark: 'bookmark-outline',
  settings: 'settings-outline',
  camera: 'camera-outline',
  upload: 'cloud-upload-outline',
  download: 'cloud-download-outline',
  'external-link': 'open-outline',
  menu: 'menu',
  'more-horizontal': 'ellipsis-horizontal',
  'shield-check': 'shield-checkmark-outline',
  lock: 'lock-closed-outline',
  users: 'people-outline',
};

export const iconSizes = { sm: 16, md: 20, lg: 24, xl: 32 } as const;

interface IconProps {
  name: IconName;
  size?: keyof typeof iconSizes | number;
  color?: string;
  /** Accessible label — required for icons without adjacent text */
  label?: string;
  testID?: string;
  style?: StyleProp<TextStyle>;
}

export function Icon({ name, size = 'md', color, label, testID, style }: IconProps) {
  const px = typeof size === 'number' ? size : iconSizes[size];
  return (
    <Ionicons
      name={GLYPHS[name]}
      size={px}
      color={color}
      accessibilityLabel={label}
      testID={testID}
      style={style}
    />
  );
}
