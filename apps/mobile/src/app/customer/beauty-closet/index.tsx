import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useState } from 'react';
import { useLocale } from '@/components/LocaleProvider';
import { useAuthState } from '@/hooks/useAuthState';
import { trpc } from '@/lib/trpc-react';

const CATS = [' مكياج', ' عناية', '‍️ شعر', ' أظافر', ' طبيعي'];

interface ClosetProduct {
  id?: number;
  emoji?: string;
  productName?: string;
  category?: string;
  openDate?: string;
}

export default function BeautyClosetScreen(): JSX.Element {
  const { locale, t } = useLocale();
  const isAuthed = useAuthState();
  const [filter, setFilter] = useState<string | null>(null);
  const catLabels = [
    t('beautyCloset.cat-makeup'),
    t('beautyCloset.cat-skin'),
    t('beautyCloset.cat-hair'),
    t('beautyCloset.cat-nails'),
    t('beautyCloset.cat-natural'),
  ];
  const q = trpc.restockReminder.myItems.useQuery(undefined, { enabled: isAuthed });
  const products: ClosetProduct[] = (q.data as unknown as ClosetProduct[] | undefined) ?? [];

  if (q.isLoading)
    return (
      <ScrollView style={styles.c} contentContainerStyle={styles.i}>
        <Text style={styles.t}>{t('beautyCloset.title')}</Text>
      </ScrollView>
    );

  const filtered = filter ? products.filter((p) => p.category === filter) : products;

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={q.isRefetching}
          onRefresh={() => q.refetch()}
          colors={['#8b5cf6']}
        />
      }
    >
      <Text style={styles.t}>{t('beautyCloset.title')}</Text>
      <Text style={styles.sub}>{t('beautyCloset.subtitle')}</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            onPress={() => setFilter(null)}
            style={[styles.fc, !filter && styles.fca]}
          >
            <Text style={[styles.ft, !filter && styles.fta]}>{t('beautyCloset.all')}</Text>
          </TouchableOpacity>
          {CATS.map((c, i) => (
            <TouchableOpacity
              key={c}
              onPress={() => setFilter(c)}
              style={[styles.fc, filter === c && styles.fca]}
            >
              <Text style={[styles.ft, filter === c && styles.fta]}>{catLabels[i] ?? c}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {filtered.length === 0 ? (
        <Text style={styles.e}>{t('beautyCloset.empty')}</Text>
      ) : (
        <View style={styles.grid}>
          {filtered.map((p, i) => (
            <View key={i} style={styles.card}>
              <Text style={styles.pe}>{p.emoji ?? ''}</Text>
              <Text style={styles.pn}>{p.productName}</Text>
              {p.openDate && (
                <Text style={styles.pd}>
                  {t('beautyCloset.opened', {
                    date: new Date(p.openDate ?? '').toLocaleDateString(
                      locale === 'ar' ? 'ar-SA' : 'en-US',
                    ),
                  })}
                </Text>
              )}
              <View style={styles.pu}>
                <View style={[styles.puf, { width: '60%' }]} />
              </View>
              <Text style={styles.pm}>{t('beautyCloset.remaining')}</Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.addBtn}>
        <Text style={styles.addBt}>{t('beautyCloset.add-product')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 16 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  fc: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  fca: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  ft: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  fta: { color: '#fff' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  pe: { fontSize: 36 },
  pn: { fontSize: 13, fontWeight: '600', color: '#111827', marginTop: 6, textAlign: 'center' },
  pd: { fontSize: 10, color: '#9ca3af', marginTop: 2 },
  pu: { height: 4, backgroundColor: '#f3f4f6', borderRadius: 2, width: '100%', marginTop: 8 },
  puf: { height: 4, backgroundColor: '#7c3aed', borderRadius: 2 },
  pm: { fontSize: 10, color: '#6b7280', marginTop: 2 },
  addBtn: {
    backgroundColor: '#7c3aed',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  addBt: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
