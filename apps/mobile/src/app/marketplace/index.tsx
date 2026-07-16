import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback, useRef } from 'react';

export default function MarketplaceScreen() {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [categories, setCategories] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [total, setTotal] = useState(0);
  const [selectedCat, setSelectedCat] = useState<number | undefined>(undefined);

  const fetchProducts = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const data = (await trpc.marketplace.products.query({
        search: search || undefined,
        categoryId: selectedCat,
        sortBy: 'newest',
        page: 1,
        limit: 20,
      })) as Record<string, unknown>;
      setProducts((data.items as Record<string, unknown>[]) || []);
      setTotal((data.total as number) || 0);
    } catch {
      // keep stale data
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, selectedCat]);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => { fetchProducts(); }, 350);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [fetchProducts]);

  useEffect(() => {
    (trpc.marketplace.productCategories.query as unknown as () => Promise<Record<string, unknown>[]>)()
      .then((d) => setCategories(d || []))
      .catch(() => {});
  }, []);

  const onRefresh = () => { setRefreshing(true); fetchProducts(true); };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>متجر منتجات التجميل</Text>
      </View>

      <TextInput
        style={styles.search}
        placeholder="ابحثي عن منتج..."
        value={search}
        onChangeText={setSearch}
        placeholderTextColor="#9ca3af"
      />

      {/* Category chips */}
      {categories.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow} contentContainerStyle={styles.catRowInner}>
          <TouchableOpacity
            style={[styles.chip, !selectedCat && styles.chipActive]}
            onPress={() => setSelectedCat(undefined)}
          >
            <Text style={[styles.chipText, !selectedCat && styles.chipTextActive]}>الكل</Text>
          </TouchableOpacity>
          {(categories as Array<Record<string, unknown>>).map((c) => (
            <TouchableOpacity
              key={c.id as number}
              style={[styles.chip, selectedCat === (c.id as number) && styles.chipActive]}
              onPress={() => setSelectedCat(c.id as number)}
            >
              <Text style={[styles.chipText, selectedCat === (c.id as number) && styles.chipTextActive]}>
                {((c.nameJson as Record<string, string>)?.ar || (c.nameJson as Record<string, string>)?.en || '')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {loading ? (
        <ActivityIndicator color="#7c3aed" style={{ marginTop: 32 }} size="large" />
      ) : (
        <ScrollView
          contentContainerStyle={styles.grid}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#7c3aed']} />}
        >
          <Text style={styles.count}>{total} منتج</Text>
          {products.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🛍️</Text>
              <Text style={styles.emptyTitle}>لا توجد منتجات</Text>
              <Text style={styles.emptySub}>لم يتم العثور على منتجات. حاولي تغيير البحث.</Text>
            </View>
          ) : (
            <View style={styles.productGrid}>
              {products.map((p) => (
                <TouchableOpacity key={p.id as number} style={styles.card} activeOpacity={0.8}>
                  <View style={styles.cardImg}>
                    <Text style={styles.cardEmoji}>🧴</Text>
                  </View>
                  <Text style={styles.cardName} numberOfLines={2}>
                    {((p.nameJson as Record<string, string>)?.ar || '')}
                  </Text>
                  <Text style={styles.cardVendor} numberOfLines={1}>
                    {((p as Record<string, unknown>).vendor as Record<string, string> | undefined)?.storeName || ''}
                  </Text>
                  <View style={styles.cardFooter}>
                    <Text style={styles.cardPrice}>{Number(p.price).toFixed(0)} ر.س</Text>
                    {p.comparePrice ? (
                      <Text style={styles.cardOldPrice}>{Number(p.comparePrice).toFixed(0)} ر.س</Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 20, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'right' },
  search: {
    marginHorizontal: 16, marginBottom: 12, borderWidth: 1, borderColor: '#d1d5db',
    borderRadius: 12, padding: 12, fontSize: 15, backgroundColor: '#f9fafb', textAlign: 'right',
  },
  catRow: { maxHeight: 44, marginBottom: 8 },
  catRowInner: { paddingHorizontal: 16, gap: 8, flexDirection: 'row', alignItems: 'center' },
  chip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb',
  },
  chipActive: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  chipTextActive: { color: '#fff' },
  count: { fontSize: 13, color: '#9ca3af', paddingHorizontal: 20, marginBottom: 8, textAlign: 'right' },
  grid: { paddingHorizontal: 12, paddingBottom: 32 },
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end' },
  card: {
    width: '47%', margin: '1.5%', backgroundColor: '#fff',
    borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', padding: 12,
  },
  cardImg: {
    aspectRatio: 1, borderRadius: 10, backgroundColor: '#f9fafb',
    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  cardEmoji: { fontSize: 40 },
  cardName: { fontSize: 14, fontWeight: '600', color: '#111827', textAlign: 'right', lineHeight: 20 },
  cardVendor: { fontSize: 11, color: '#9ca3af', marginTop: 4, textAlign: 'right' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  cardPrice: { fontSize: 15, fontWeight: '700', color: '#7c3aed' },
  cardOldPrice: { fontSize: 12, color: '#d1d5db', textDecorationLine: 'line-through' },
  empty: { alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#6b7280' },
  emptySub: { fontSize: 13, color: '#9ca3af', marginTop: 4, textAlign: 'center' },
});
