import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  AccessibilityInfo,
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useHaptics } from '@/hooks/useHaptics';

/**
 * Walkthrough — RN spotlight tour engine (§3.6 mobile).
 *
 * The web Walkthrough anchors on CSS selectors; RN has no DOM, so this
 * engine uses the standard RN pattern: <TourStep> wrappers measure
 * themselves in window coordinates and register into a context; the
 * <Walkthrough> overlay renders a full-screen dim with a spotlight
 * "hole" around the active target plus a positioned card.
 *
 * Behavior parity with the web kit: skippable via button or Android
 * back, progress dots, reduced-motion = static ring, screen-reader
 * announcements on step change, interaction outside the card blocked.
 */

export interface TourRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WalkthroughStep {
  /** Name a <TourStep> registered itself under */
  target: string;
  title: string;
  body: string;
}

interface WalkthroughProps {
  open: boolean;
  steps: WalkthroughStep[];
  /** Called when the user skips or completes (reason tells which) */
  onClose: (reason: 'complete' | 'skip') => void;
  /** Translated control labels */
  labels: {
    next: string;
    back: string;
    skip: string;
    done: string;
    progress: (current: number, total: number) => string;
  };
}

const CARD_MAX_WIDTH = 340;
const EDGE_PAD = 16;
const CARD_GAP = 12;
const RING_PAD = 10;
const EST_CARD_HEIGHT = 200;

const COLORS = {
  brand: '#7c3aed',
  white: '#ffffff',
  dim: 'rgba(17, 24, 39, 0.72)',
  gray400: '#6b7280',
  gray900: '#111827',
  dotInactive: '#e5e7eb',
};

// ── Target registry ────────────────────────────────────────────────

interface TourRegistryValue {
  register: (name: string, rect: TourRect) => void;
  unregister: (name: string) => void;
  getRect: (name: string) => TourRect | undefined;
}

const TourRegistryContext = createContext<TourRegistryValue | null>(null);

export function WalkthroughProvider({ children }: { children: ReactNode }): JSX.Element {
  const [rects, setRects] = useState<Record<string, TourRect>>({});

  const register = useCallback((name: string, rect: TourRect) => {
    setRects((prev) => {
      const p = prev[name];
      if (
        p &&
        p.x === rect.x &&
        p.y === rect.y &&
        p.width === rect.width &&
        p.height === rect.height
      ) {
        return prev;
      }
      return { ...prev, [name]: rect };
    });
  }, []);

  const unregister = useCallback((name: string) => {
    setRects((prev) => {
      if (!(name in prev)) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ register, unregister, getRect: (name: string) => rects[name] }),
    [register, unregister, rects],
  );

  return <TourRegistryContext.Provider value={value}>{children}</TourRegistryContext.Provider>;
}

/**
 * Wraps a target view and reports its window rect to the registry.
 * `collapsable={false}` keeps the wrapper measurable on Android.
 */
export function TourStep({
  name,
  children,
  style,
}: {
  name: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}): JSX.Element {
  const ctx = useContext(TourRegistryContext);
  const ref = useRef<View | null>(null);

  const onLayout = useCallback(
    (_e: LayoutChangeEvent) => {
      ref.current?.measureInWindow((x, y, width, height) => {
        ctx?.register(name, { x, y, width, height });
      });
    },
    [ctx, name],
  );

  useEffect(() => () => ctx?.unregister(name), [ctx, name]);

  return (
    <View ref={ref} style={style} onLayout={onLayout} collapsable={false}>
      {children}
    </View>
  );
}

// ── Overlay ────────────────────────────────────────────────────────

export function Walkthrough({
  open,
  steps,
  onClose,
  labels,
}: WalkthroughProps): JSX.Element | null {
  const ctx = useContext(TourRegistryContext);
  const { width: winW, height: winH } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const pulse = useRef(new Animated.Value(0)).current;
  const { trigger } = useHaptics();

  // Reset on the open transition only — same guard as the web kit so an
  // unstable onClose can never yank the user back to step 1 mid-tour.
  const prevOpen = useRef(false);
  useEffect(() => {
    if (open && !prevOpen.current) setIndex(0);
    prevOpen.current = open;
  }, [open]);

  // Read the reduce-motion preference once per open.
  useEffect(() => {
    if (!open) return;
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => {
        if (alive) setReduceMotion(v);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [open]);

  // Soft pulse on the ring; neutralized under reduce motion.
  useEffect(() => {
    if (!open || reduceMotion) {
      pulse.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [open, reduceMotion, pulse]);

  // Announce each step to screen readers + light haptic feedback.
  useEffect(() => {
    if (!open) return;
    const step = steps[index];
    if (step) {
      AccessibilityInfo.announceForAccessibility(`${step.title}. ${step.body}`);
      trigger('light');
    }
  }, [open, index, steps, trigger]);

  // Advance to the next step that has a measured target; skip dead
  // steps so a missing/unmeasured target can never stall the tour.
  const settle = useCallback(
    (nextIndex: number) => {
      let i = nextIndex;
      while (i < steps.length) {
        if (ctx?.getRect(steps[i]!.target)) {
          setIndex(i);
          return;
        }
        i += 1;
      }
      onClose('complete');
    },
    [ctx, steps, onClose],
  );

  // Auto-advance if the current target has no rect (registered later
  // than the open transition, or unmounted).
  useEffect(() => {
    if (!open) return;
    const has = ctx?.getRect(steps[index]?.target ?? '');
    if (!has) settle(index);
  }, [open, index, steps, ctx, settle]);

  if (!open) return null;

  const rect = ctx?.getRect(steps[index]?.target ?? '');
  if (!rect) return null;

  const isLast = index === steps.length - 1;
  const cardWidth = Math.min(CARD_MAX_WIDTH, winW - EDGE_PAD * 2);

  // Prefer the card below the target; flip above when it would overflow.
  let top = rect.y + rect.height + CARD_GAP;
  if (top + EST_CARD_HEIGHT > winH - EDGE_PAD) {
    top = Math.max(EDGE_PAD, rect.y - EST_CARD_HEIGHT - CARD_GAP);
  }
  const left = Math.max(EDGE_PAD, Math.min(rect.x, winW - cardWidth - EDGE_PAD));

  // Hole geometry (window coordinates, numeric math only — identical in RTL/LTR).
  const hx = rect.x - RING_PAD;
  const hy = rect.y - RING_PAD;
  const hw = rect.width + RING_PAD * 2;
  const hh = rect.height + RING_PAD * 2;

  const strip = (style: ViewStyle, key: string) => (
    <View key={key} pointerEvents="none" style={[styles.strip, style]} />
  );

  return (
    <Modal
      transparent
      visible={open}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => onClose('skip')}
    >
      <View style={styles.wrap}>
        {/* Interaction blocker — taps outside the card do nothing. */}
        <Pressable style={StyleSheet.absoluteFill} onPress={() => {}} />

        {strip({ top: 0, left: 0, right: 0, height: hy }, 'top')}
        {strip({ top: hy + hh, left: 0, right: 0, bottom: 0 }, 'bottom')}
        {strip({ top: hy, left: 0, width: hx, height: hh }, 'left')}
        {strip({ top: hy, left: hx + hw, right: 0, height: hh }, 'right')}

        <Animated.View
          pointerEvents="none"
          style={[
            styles.ring,
            {
              top: hy,
              left: hx,
              width: hw,
              height: hh,
              opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] }),
            },
          ]}
        />

        <View
          testID="tour-card"
          accessibilityViewIsModal
          accessibilityLiveRegion="polite"
          style={[styles.card, { top, left, width: cardWidth }]}
        >
          <View style={styles.cardHead}>
            <Text style={styles.cardTitle}>{steps[index]?.title}</Text>
            <TouchableOpacity
              testID="tour-skip"
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => onClose('skip')}
            >
              <Text style={styles.skipText}>{labels.skip}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.cardBody}>{steps[index]?.body}</Text>

          <View style={styles.cardFoot}>
            <View style={styles.dots}>
              {steps.map((_, i) => (
                <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
              ))}
              <Text style={styles.progress} accessible={false}>
                {labels.progress(index + 1, steps.length)}
              </Text>
            </View>

            <View style={styles.controls}>
              {index > 0 && (
                <TouchableOpacity
                  testID="tour-back"
                  accessibilityRole="button"
                  style={styles.ghostBtn}
                  onPress={() => setIndex(index - 1)}
                >
                  <Text style={styles.ghostText}>{labels.back}</Text>
                </TouchableOpacity>
              )}
              {isLast ? (
                <TouchableOpacity
                  testID="tour-done"
                  accessibilityRole="button"
                  style={styles.primaryBtn}
                  onPress={() => onClose('complete')}
                >
                  <Text style={styles.primaryText}>{labels.done}</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  testID="tour-next"
                  accessibilityRole="button"
                  style={styles.primaryBtn}
                  onPress={() => settle(index + 1)}
                >
                  <Text style={styles.primaryText}>{labels.next}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  strip: {
    position: 'absolute',
    backgroundColor: COLORS.dim,
  },
  ring: {
    position: 'absolute',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: COLORS.brand,
  },
  card: {
    position: 'absolute',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.gray900,
  },
  skipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray400,
  },
  cardBody: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.gray400,
  },
  cardFoot: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.dotInactive,
  },
  dotActive: {
    width: 18,
    backgroundColor: COLORS.brand,
  },
  progress: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.gray400,
    marginLeft: 4,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ghostBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  ghostText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray400,
  },
  primaryBtn: {
    backgroundColor: COLORS.brand,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 12,
  },
  primaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
  },
});
