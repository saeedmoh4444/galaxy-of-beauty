import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface DiaryEntry {
  id?: number;
  emoji?: string;
  title?: string;
  createdAt?: string;
}

export default function SkinDiaryScreen(): JSX.Element {
  const { t, locale } = useLocale();
  const entriesQ = trpc.skinDiary.entries.useQuery();
  const data: DiaryEntry[] = (entriesQ.data as unknown as DiaryEntry[] | undefined) ?? [];
  if (entriesQ.isLoading) return <SkeletonList count={4} />;
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={entriesQ.isRefetching}
          onRefresh={() => entriesQ.refetch()}
          colors={['#ec4899']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.skinDiary.title')}</Text>
      {data.map((e, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.emoji}>{e.emoji ?? ''}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{e.title ?? ''}</Text>
            <Text style={styles.date}>
              {e.createdAt
                ? new Date(e.createdAt).toLocaleDateString(locale === 'en' ? 'en-GB' : 'ar-SA')
                : ''}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 20 },
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
