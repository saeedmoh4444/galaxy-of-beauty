import { useCallback } from 'react';
import { Platform } from 'react-native';

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

export function useHaptics() {
  const trigger = useCallback((type: HapticType = 'light') => {
    if (Platform.OS === 'web') return;

    try {
      // expo-haptics is an optional dependency — require dynamically so web builds work without it
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Haptics = require('expo-haptics');

      switch (type) {
        case 'light':
          Haptics.impactAsync?.(Haptics.ImpactFeedbackStyle?.Light);
          break;
        case 'medium':
          Haptics.impactAsync?.(Haptics.ImpactFeedbackStyle?.Medium);
          break;
        case 'heavy':
          Haptics.impactAsync?.(Haptics.ImpactFeedbackStyle?.Heavy);
          break;
        case 'success':
          Haptics.notificationAsync?.(Haptics.NotificationFeedbackType?.Success);
          break;
        case 'warning':
          Haptics.notificationAsync?.(Haptics.NotificationFeedbackType?.Warning);
          break;
        case 'error':
          Haptics.notificationAsync?.(Haptics.NotificationFeedbackType?.Error);
          break;
        case 'selection':
          Haptics.selectionAsync?.();
          break;
        default:
          Haptics.impactAsync?.(Haptics.ImpactFeedbackStyle?.Light);
      }
    } catch {
      // expo-haptics not installed — silent noop
    }
  }, []);

  return { trigger };
}
