import { Platform } from 'react-native';

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

export function useHaptics() {
  const trigger = (_type: HapticType = 'light') => {
    if (Platform.OS === 'web') return;
    // Stub: import * as Haptics from 'expo-haptics' in production
  };

  return { trigger };
}
