import { View, Text, StyleSheet } from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import { useAuthState } from '@/hooks/useAuthState';

const COLORS = { brand: '#7c3aed', white: '#ffffff', gray400: '#6b7280', gray900: '#111827' };

export default function MyJourneyScreen(): JSX.Element {
  const { t, locale } = useLocale();
  const isAuthed = useAuthState();
  const journey = trpc.customerJourney.milestones.useQuery({}, { enabled: isAuthed }) ?? {
    data: null,
    isLoading: false,
    isError: false,
    refetch: () => {},
  };
  const data = journey.data as unknown[] | undefined;

  return (
    <ScreenState
      isLoading={journey.isLoading}
      isError={journey.isError}
      isEmpty={!data || data.length === 0}
      errorMessage={t('mobile.myJourney.load-error')}
      emptyTitle={t('mobile.myJourney.empty')}
      onRetry={() => journey.refetch()}
    >
      <Text style={styles.title}>{t('mobile.myJourney.title')}</Text>
      {(data as Record<string, unknown>[])?.map((item: Record<string, unknown>, i: number) => (
        <View key={i} style={styles.card}>
          <View style={styles.dot} />
          <View style={styles.content}>
            <Text style={styles.event}>{item.title as string}</Text>
            <Text style={styles.date}>
              {item.date
                ? new Date(item.date as string).toLocaleDateString(
                    locale === 'ar' ? 'ar-SA' : 'en-GB',
                  )
                : ''}
            </Text>
          </View>
        </View>
      ))}
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
  card: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.brand,
    marginTop: 6,
    marginRight: 12,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  event: { fontSize: 14, fontWeight: '600', color: COLORS.gray900 },
  date: { fontSize: 12, color: COLORS.gray400, marginTop: 4 },
});
