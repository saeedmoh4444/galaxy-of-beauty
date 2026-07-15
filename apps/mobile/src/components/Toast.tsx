import { Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useState, useCallback, useRef, createContext, useContext, type ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastCtx {
  showToast: (type: ToastType, message: string) => void;
}

const Ctx = createContext<ToastCtx>({ showToast: () => {} });

let nextId = 0;

const COLORS: Record<ToastType, { bg: string; icon: string }> = {
  success: { bg: '#16a34a', icon: '✅' },
  error: { bg: '#dc2626', icon: '❌' },
  warning: { bg: '#f59e0b', icon: '⚠️' },
  info: { bg: '#374151', icon: 'ℹ️' },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastItem | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = ++nextId;
    setToast({ id, type, message });
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(3000),
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setToast(null));
  }, [opacity]);

  return (
    <Ctx.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Animated.View style={[styles.toast, { backgroundColor: COLORS[toast.type].bg, opacity }]}>
          <Text style={styles.icon}>{COLORS[toast.type].icon}</Text>
          <Text style={styles.message} numberOfLines={2}>{toast.message}</Text>
          <TouchableOpacity onPress={() => setToast(null)}>
            <Text style={styles.close}>✕</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </Ctx.Provider>
  );
}

export function useToast(): ToastCtx {
  return useContext(Ctx);
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute', bottom: 24, left: 16, right: 16,
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, padding: 14, gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 8, zIndex: 999,
  },
  icon: { fontSize: 18 },
  message: { flex: 1, fontSize: 14, fontWeight: '600', color: '#fff', textAlign: 'right' },
  close: { fontSize: 14, color: 'rgba(255,255,255,0.7)', paddingLeft: 4 },
});
