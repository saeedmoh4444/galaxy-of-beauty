import { View, Text, StyleSheet } from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';

const COLORS = { brand: '#7c3aed', white: '#ffffff', gray400: '#6b7280', gray900: '#111827' };

export default function StreaksScreen(): JSX.Element {
  const streak = trpc.streaks.get.useQuery();
  const data = streak.data as Record<string, unknown> | undefined;

  return (
    <ScreenState
      isLoading={streak.isLoading}
      isError={streak.isError}
      isEmpty={!data}
      errorMessage="فشل تحميل الاستمرارية"
      onRetry={() => streak.refetch()}
    >
      <Text style={styles.title}>🔥 الاستمرارية</Text>
      <View style={styles.card}>
        <Text style={styles.fire}>🔥</Text>
        <Text style={styles.current}>
          الاستمرارية الحالية: {String(data?.currentStreak ?? 0)} أيام
        </Text>
        <Text style={styles.longest}>أطول استمرارية: {String(data?.longestStreak ?? 0)} أيام</Text>
      </View>
      <Text style={styles.tip}>احجزي أسبوعياً للحفاظ على استمراريتكِ!</Text>
    </ScreenState>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.brand,
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  fire: { fontSize: 64, marginBottom: 12 },
  current: { fontSize: 18, fontWeight: '700', color: COLORS.gray900 },
  longest: { fontSize: 14, color: COLORS.gray400, marginTop: 8 },
  tip: { fontSize: 13, color: COLORS.gray400, textAlign: 'center', marginTop: 20 },
});
