import { View, StyleSheet, Animated, Easing } from 'react-native';
import { useEffect, useRef } from 'react';

interface SkeletonCardProps {
  lines?: number;
  height?: number;
}

export function SkeletonCard({ lines = 3, height = 80 }: SkeletonCardProps): JSX.Element {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 800, easing: Easing.ease, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 800, easing: Easing.ease, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] });

  return (
    <View style={[styles.card, { height }]}>
      <View style={styles.row}>
        <Animated.View style={[styles.avatar, { opacity }]} />
        <View style={styles.textCol}>
          {Array.from({ length: lines }).map((_, i) => (
            <Animated.View key={i} style={[styles.line, { width: `${80 - i * 20}%`, opacity }]} />
          ))}
        </View>
      </View>
    </View>
  );
}

export function SkeletonList({ count = 4 }: { count?: number }): JSX.Element {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, paddingTop: 10 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e5e7eb' },
  textCol: { flex: 1, gap: 8 },
  line: { height: 12, borderRadius: 6, backgroundColor: '#e5e7eb' },
});
