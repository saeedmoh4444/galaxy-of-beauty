import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useState } from 'react';
import { trpc } from '@/lib/api';
import { useQuery } from '@/lib/useQuery';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

export default function MarketplaceScreen(): JSX.Element {
  const [search, setSearch] = useState('');
  const { data, loading, error, refetch, refreshing, refresh } = useQuery(() =>
    typedTrpc().marketplace.products.query({ search: search || undefined, page: 1, limit: 24 }),
  );
  const { data: cart } = useQuery(() => typedTrpc().marketplace.cart.query());
  const productItems = (data as any)?.items;
  const products: any[] = Array.isArray(productItems) ? productItems : [];
  const cartCount = ((cart ?? []) as any[]).length;

  const handleAddToCart = async (pid: number) => {
    try {
      await typedTrpc().marketplace.addToCart.mutate({ productId: pid });
    } catch {}
  };

  if (loading) return <SkeletonList count={6} />;
  if (error) return <ErrorAlert message="فشل تحميل المتجر" onRetry={refetch} />;

  return (
    <ScrollView
      style={s.c}
      contentContainerStyle={s.i}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} colors={['#db2777']} />
      }
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <View>
          <Text style={s.t}>️ متجر الجمال</Text>
          <Text style={s.sub}>منتجات تجميل أصلية</Text>
        </View>
        <TouchableOpacity
          style={{
            backgroundColor: '#f3f4f6',
            borderRadius: 20,
            paddingHorizontal: 14,
            paddingVertical: 6,
          }}
        >
          <Text> {cartCount}</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder=" ابحثي عن منتج..."
        style={s.inp}
        placeholderTextColor="#9ca3af"
      />

      {products.length === 0 && (
        <View style={{ alignItems: 'center', padding: 30 }}>
          <Text style={{ fontSize: 40 }}>️</Text>
          <Text style={{ color: '#6b7280', marginTop: 8 }}>لا توجد منتجات</Text>
        </View>
      )}

      <View style={s.grid}>
        {products.map((p: any) => (
          <TouchableOpacity key={p.id} style={s.prod} onPress={() => handleAddToCart(p.id)}>
            <Text style={{ fontSize: 36, textAlign: 'center' }}></Text>
            <Text
              style={{ fontWeight: '600', fontSize: 13, textAlign: 'center', marginTop: 6 }}
              numberOfLines={1}
            >
              {p.nameJson?.ar ?? `منتج #${p.id}`}
            </Text>
            <Text style={{ fontSize: 11, color: '#6b7280', textAlign: 'center' }}>{p.brand}</Text>
            <Text
              style={{
                fontWeight: '800',
                fontSize: 15,
                color: '#db2777',
                textAlign: 'center',
                marginTop: 4,
              }}
            >
              {(p.price ?? 0).toLocaleString()} ر.س
            </Text>
            <View
              style={{
                backgroundColor: '#db2777',
                borderRadius: 8,
                paddingVertical: 6,
                marginTop: 8,
              }}
            >
              <Text style={{ color: '#fff', textAlign: 'center', fontSize: 12, fontWeight: '600' }}>
                 أضيفي
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingBottom: 40 },
  t: { fontSize: 22, fontWeight: '800', color: '#111827' },
  sub: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  inp: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    textAlign: 'right',
    marginBottom: 16,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  prod: { width: '48%', backgroundColor: '#fff', borderRadius: 14, padding: 12, marginBottom: 4 },
});
