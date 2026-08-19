import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useState } from 'react';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface ServiceItem {
  id?: number;
  emoji?: string;
  nameAr?: string;
  descAr?: string;
  price?: number;
  duration?: string;
}

export default function ServicesScreen(): JSX.Element {
  const { t } = useLocale();
  const categoriesQ = trpc.categories.tree.useQuery();
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const catItems = (
    (categoriesQ.data ?? []) as unknown as Array<{
      id?: number;
      slug?: string;
      emoji?: string;
      nameJson?: { ar?: string };
    }>
  ).map((c) => ({
    key: c.slug ?? String(c.id ?? ''),
    nameAr: c.nameJson?.ar ?? '',
    emoji: c.emoji ?? '',
    id: c.id,
  }));
  const servicesQ = trpc.services.list.useQuery(
    { categoryId: catItems.find((c) => c.key === activeCat)?.id },
    { enabled: !!activeCat },
  );

  if (categoriesQ.isLoading) return <SkeletonList count={6} />;
  if (categoriesQ.isError)
    return (
      <ErrorAlert
        message={t('mobile.public.womens-services.load-error')}
        onRetry={() => categoriesQ.refetch()}
      />
    );

  const svcItems = ((servicesQ.data as unknown as { items?: ServiceItem[] } | null)?.items ??
    []) as ServiceItem[];

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={categoriesQ.isRefetching}
          onRefresh={() => categoriesQ.refetch()}
          colors={['#db2777']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.public.services.title')}</Text>
      <Text style={styles.sub}>{t('mobile.public.services.subtitle')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {catItems.map((cat) => {
            const isActive = activeCat === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                onPress={() => setActiveCat(cat.key ?? null)}
                style={[styles.catChip, isActive && styles.catChipActive]}
              >
                <Text style={styles.catEmoji}>{cat.emoji ?? ''}</Text>
                <Text style={[styles.catName, isActive && styles.catNameActive]}>{cat.nameAr}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
      {activeCat && (
        <>
          <Text style={styles.sectionTitle}>
            {t('mobile.public.services.count', { count: svcItems.length })}
          </Text>
          {svcItems.length === 0 ? (
            <Text style={styles.e}>{t('mobile.public.services.empty')}</Text>
          ) : (
            svcItems.map((s) => (
              <View key={s.id} style={styles.card}>
                <Text style={styles.svcEmoji}>{s.emoji ?? '‍️'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.svcName}>{s.nameAr}</Text>
                  <Text style={styles.svcDesc}>{s.descAr?.substring(0, 80)}</Text>
                  <View style={styles.svcMeta}>
                    <Text style={styles.svcPrice}>
                      {t('mobile.public.currency', { price: s.price?.toLocaleString() ?? '' })}
                    </Text>
                    <Text style={styles.svcDuration}>️ {s.duration}</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10 },
  catChip: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  catChipActive: { borderColor: '#db2777', backgroundColor: '#fdf2f8' },
  catEmoji: { fontSize: 28 },
  catName: { fontSize: 12, fontWeight: '600', color: '#6b7280', marginTop: 6 },
  catNameActive: { color: '#db2777' },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  svcEmoji: { fontSize: 30 },
  svcName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  svcDesc: { fontSize: 12, color: '#6b7280', marginTop: 2, lineHeight: 18 },
  svcMeta: { flexDirection: 'row', gap: 12, marginTop: 6 },
  svcPrice: { fontSize: 14, fontWeight: '700', color: '#db2777' },
  svcDuration: { fontSize: 12, color: '#9ca3af' },
});
