import { View, Text, StyleSheet } from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';

const COLORS = {
  brand: '#7c3aed',
  white: '#ffffff',
  gray400: '#6b7280',
  gray900: '#111827',
  fire: '#f59e0b',
};

export default function StreakCalendarScreen(): JSX.Element {
  const streak = trpc.streaks.get.useQuery();

  return (
    <ScreenState
      isLoading={streak.isLoading}
      isError={streak.isError}
      isEmpty={!streak.data}
      errorMessage="فشل تحميل التقويم"
      onRetry={() => streak.refetch()}
    >
      <Text style={styles.title}> تقويم الاستمرارية</Text>
      <View style={styles.card}>
        <Text style={styles.fire}></Text>
        <Text style={styles.current}>
          الأسبوع الحالي: {String(streak.data?.currentStreak ?? 0)} أيام
        </Text>
        <Text style={styles.longest}>
          أطول استمرارية: {String(streak.data?.longestStreak ?? 0)} أيام
        </Text>
      </View>
      <Text style={styles.tip}>احجزي أسبوعياً للحفاظ على استمراريتكِ وكسب المكافآت!</Text>
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
