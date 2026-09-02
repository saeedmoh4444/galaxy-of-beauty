import { View, Text, StyleSheet } from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { useAuthState } from '@/hooks/useAuthState';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

const COLORS = {
  brand: '#7c3aed',
  white: '#ffffff',
  gray400: '#6b7280',
  gray900: '#111827',
  fire: '#f59e0b',
};

export default function StreakCalendarScreen(): JSX.Element {
  const { t } = useLocale();
  const isAuthed = useAuthState();
  const streak = trpc.streaks.get.useQuery(undefined, { enabled: isAuthed });

  return (
    <ScreenState
      isLoading={streak.isLoading}
      isError={streak.isError}
      isEmpty={!streak.data}
      errorMessage={t('mobile.streakCalendar.load-error')}
      onRetry={() => streak.refetch()}
    >
      <Text style={styles.title}>{t('mobile.streakCalendar.title')}</Text>
      <View style={styles.card}>
        <Text style={styles.fire}></Text>
        <Text style={styles.current}>
          {t('mobile.streakCalendar.current-week', {
            days: String(streak.data?.currentStreak ?? 0),
          })}
        </Text>
        <Text style={styles.longest}>
          {t('mobile.streakCalendar.longest', {
            days: String(streak.data?.longestStreak ?? 0),
          })}
        </Text>
      </View>
      <Text style={styles.tip}>{t('mobile.streakCalendar.tip')}</Text>
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
