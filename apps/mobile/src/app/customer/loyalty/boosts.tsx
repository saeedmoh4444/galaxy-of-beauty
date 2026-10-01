/**
 * Loyalty boosts screen (audit stage 12) — full cards for the active
 * points multipliers. The loyalty home screen previously showed only a
 * compact banner; this screen is the detail view it links to.
 */
import type { JSX } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import { localize } from '@galaxy/shared';
import { multiplierLabel, boostWindowLabel } from '@/utils/boostDisplay';

interface Boost {
  id: number;
  nameJson: unknown;
  multiplier: number;
  startsAt: string;
  endsAt: string;
}

export default function LoyaltyBoostsScreen(): JSX.Element {
  const { locale, t } = useLocale();
  const boostsQ = trpc.loyalty.activeBoosts.useQuery(undefined, { retry: false });
  const boosts = (boostsQ.data as unknown as Boost[] | undefined) ?? [];

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('mobile.loyaltyBoosts.title')}</Text>
      <Text style={styles.subtitle}>{t('mobile.loyaltyBoosts.subtitle')}</Text>

      {boostsQ.isLoading ? (
        <Text style={styles.empty}>{t('state.loading')}</Text>
      ) : boostsQ.isError ? (
        <View style={styles.emptyCard}>
          <Text style={styles.empty}>{t('state.error')}</Text>
          <Pressable onPress={() => boostsQ.refetch()}>
            <Text style={styles.retry}>{t('button.retry')}</Text>
          </Pressable>
        </View>
      ) : boosts.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.empty}>{t('mobile.loyaltyBoosts.empty')}</Text>
        </View>
      ) : (
        boosts.map((boost) => (
          <View key={boost.id} style={styles.card} testID={`boost-card-${boost.id}`}>
            <View style={styles.cardHeader}>
              <Text style={styles.boostName}>{localize(boost.nameJson, locale)}</Text>
              <Text style={styles.multiplier}>{multiplierLabel(boost.multiplier)}</Text>
            </View>
            <Text style={styles.window}>
              {t('mobile.loyaltyBoosts.window')}:{' '}
              {boostWindowLabel(locale, boost.startsAt, boost.endsAt)}
            </Text>
            <View style={styles.liveRow}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>{t('mobile.loyaltyBoosts.live')}</Text>
            </View>
          </View>
        ))
      )}

      <View style={styles.howCard}>
        <Text style={styles.howTitle}>{t('mobile.loyaltyBoosts.howTitle')}</Text>
        <Text style={styles.howBody}>{t('mobile.loyaltyBoosts.howBody')}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  content: { padding: 20, gap: 12 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6b7280', marginBottom: 8 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fbcfe8',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  boostName: { fontSize: 16, fontWeight: '700', color: '#111827', flex: 1 },
  multiplier: {
    fontSize: 18,
    fontWeight: '800',
    color: '#db2777',
    backgroundColor: '#fdf2f8',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  window: { fontSize: 13, color: '#6b7280', marginTop: 8 },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#16a34a' },
  liveText: { fontSize: 13, fontWeight: '600', color: '#16a34a' },
  empty: { fontSize: 14, color: '#6b7280', textAlign: 'center' },
  retry: {
    fontSize: 14,
    fontWeight: '700',
    color: '#db2777',
    textAlign: 'center',
    marginTop: 10,
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  howCard: {
    backgroundColor: '#fff7ed',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
  },
  howTitle: { fontSize: 15, fontWeight: '700', color: '#9a3412' },
  howBody: { fontSize: 13, color: '#7c2d12', marginTop: 6, lineHeight: 20 },
});
