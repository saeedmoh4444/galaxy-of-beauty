import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { LARGE_PAGE_SIZE } from '@galaxy/ui';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import { useAuthState } from '@/hooks/useAuthState';

interface CashbackInfo {
  balance?: number;
  totalBalance?: number;
  rate?: number;
}

interface CashbackTransaction {
  id?: number;
  amount?: number;
  createdAt: string;
}

interface CashbackHistory {
  items?: CashbackTransaction[];
}

export default function CashbackScreen(): JSX.Element {
  const isAuthed = useAuthState();
  const { locale, t } = useLocale();
  const infoQ = trpc.cashback.info.useQuery(undefined, { enabled: isAuthed });
  const historyQ = trpc.cashback.history.useQuery(
    { page: 1, limit: LARGE_PAGE_SIZE },
    { enabled: isAuthed },
  );
  if (infoQ.isLoading || historyQ.isLoading) return <SkeletonList count={3} />;
  const info = infoQ.data as unknown as CashbackInfo | null;
  const history = historyQ.data as unknown as CashbackHistory | null;
  const items = history?.items ?? [];
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={infoQ.isRefetching || historyQ.isRefetching}
          onRefresh={() => {
            void infoQ.refetch();
            void historyQ.refetch();
          }}
          colors={['#059669']}
        />
      }
    >
      <Text style={styles.t}>{t('cashback.title')}</Text>
      <View style={styles.br}>
        <View style={styles.bc}>
          <Text style={styles.bl}>{t('cashback.balance')}</Text>
          <Text style={styles.ba}>
            {t('cashback.amount', { value: (info?.balance ?? 0)?.toLocaleString() })}
          </Text>
        </View>
        <View style={styles.bc}>
          <Text style={styles.bl}>{t('cashback.total-balance')}</Text>
          <Text style={[styles.ba, { color: '#7c3aed' }]}>
            {t('cashback.amount', { value: (info?.totalBalance ?? 0)?.toLocaleString() })}
          </Text>
        </View>
      </View>
      {items.map((tx) => (
        <View key={tx.id} style={styles.card}>
          <Text style={styles.em}></Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.ta}>
              {t('cashback.amount', { value: `+${tx.amount?.toLocaleString()}` })}
            </Text>
            <Text style={styles.td}>
              {new Date(tx.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')}
            </Text>
          </View>
          <Text style={styles.tr}>{info?.rate ?? 5}%</Text>
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfdf5' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#059669', textAlign: 'center', marginBottom: 20 },
  br: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  bc: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 16, alignItems: 'center' },
  bl: { fontSize: 11, color: '#6b7280' },
  ba: { fontSize: 20, fontWeight: '800', color: '#059669', marginTop: 4 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 4,
  },
  em: { fontSize: 24 },
  ta: { fontSize: 14, fontWeight: '700', color: '#059669' },
  td: { fontSize: 11, color: '#9ca3af' },
  tr: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
});
