import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface RestockItem {
  id?: number;
  emoji?: string;
  productName?: string;
  lastOrdered?: string;
}

export default function RestockReminderScreen(): JSX.Element {
  const { t, locale } = useLocale();
  const itemsQ = trpc.restockReminder.myItems.useQuery();
  const data: RestockItem[] = (itemsQ.data as unknown as RestockItem[] | undefined) ?? [];

  if (itemsQ.isLoading) return <SkeletonList count={4} />;

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={itemsQ.isRefetching}
          onRefresh={() => itemsQ.refetch()}
          colors={['#f59e0b']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.restockReminder.title')}</Text>
      {data.map((r, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.emoji}>{r.emoji ?? ''}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{r.productName ?? ''}</Text>
            <Text style={styles.date}>
              {t('mobile.restockReminder.last-ordered', {
                date: r.lastOrdered
                  ? new Date(r.lastOrdered).toLocaleDateString(locale === 'en' ? 'en-GB' : 'ar-SA')
                  : '',
              })}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fffbeb' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#d97706', textAlign: 'center', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 6,
  },
  emoji: { fontSize: 28 },
  name: { fontSize: 14, fontWeight: '600', color: '#111827' },
  date: { fontSize: 12, color: '#6b7280', marginTop: 2 },
});
