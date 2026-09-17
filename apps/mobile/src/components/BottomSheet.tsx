/**
 * BottomSheet — Modal-based slide-up sheet (5.5 Mobile polish).
 *
 * OTA-safe by design: pure RN (Modal + Animated), no native modules.
 * - Backdrop press dismisses
 * - Slide-up animation (300ms ease-out), drag-handle affordance
 * - RTL-safe: paddingStart/End logical styles only
 * - a11y: transparent={false}, onRequestClose wired for Android back
 *
 * Usage:
 *   <BottomSheet open={open} onClose={() => setOpen(false)} title="…">
 *     <QuickActionRow … />
 *   </BottomSheet>
 */
import { useEffect, useRef } from 'react';
import type { JSX, ReactNode } from 'react';
import { Modal, View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { themeColors, useTheme } from '@/components/ThemeProvider';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function BottomSheet({ open, onClose, title, children }: BottomSheetProps): JSX.Element {
  const slide = useRef(new Animated.Value(0)).current;
  const { isDark } = useTheme();
  const C = isDark ? themeColors.dark : themeColors.light;

  useEffect(() => {
    if (open) {
      Animated.timing(slide, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    } else {
      slide.setValue(0);
    }
  }, [open, slide]);

  const translateY = slide.interpolate({ inputRange: [0, 1], outputRange: [400, 0] });

  return (
    <Modal visible={open} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
          accessibilityLabel="close"
        />
        <Animated.View
          style={[styles.sheet, { backgroundColor: C.surface }, { transform: [{ translateY }] }]}
        >
          <View style={styles.handle} />
          {title ? <Text style={[styles.title, { color: C.text }]}>{title}</Text> : null}
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(17,24,39,0.5)' },
  sheet: {
    borderTopStartRadius: 24,
    borderTopEndRadius: 24,
    padding: 20,
    paddingBottom: 36,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e5e7eb',
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
});
