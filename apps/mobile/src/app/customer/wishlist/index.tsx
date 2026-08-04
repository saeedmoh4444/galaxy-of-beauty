import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';
import { formatCurrency } from '@galaxy/ui';

const COLORS = { brand: '#7c3aed', white: '#ffffff', gray400: '#6b7280', gray900: '#111827', danger: '#dc2626' };

export default function WishlistScreen(): JSX.Element {
  const wishlist = trpc.wishlist.list.useQuery();
  const remove = (trpc as any).wishlist?.remove?.useMutation?.();

  const data = wishlist.data as unknown[] | undefined;

  return (
    <ScreenState
      isLoading={wishlist.isLoading}
      isError={wishlist.isError}
      isEmpty={!data || data.length === 0}
      errorMessage="فشل تحميل المفضلة"
      emptyTitle="لا توجد خدمات مفضلة"
      emptyDescription="أضيفي خدماتكِ المفضلة لتجديها بسرعة"
      onRetry={() => wishlist.refetch()}
    >
      <Text style={styles.title}>❤️ المفضلة</Text>
      {(data as Record<string, unknown>[])?.map((w: Record<string, unknown>, i: number) => (
        <View key={i} style={styles.card}>
          <View style={styles.left}>
            <Text style={styles.name}>{(w.serviceTitle as string) ?? `خدمة #${w.serviceId as number}`}</Text>
            {w.price ? <Text style={styles.price}>{formatCurrency(Number(w.price))}</Text> : null}
          </View>
          {remove && (
            <TouchableOpacity onPress={() => remove.mutateAsync({ wishlistItemId: w.id as number }).then(() => wishlist.refetch())}>
              <Text style={styles.removeBtn}>❌</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </ScreenState>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '800', color: COLORS.brand, textAlign: 'center', marginBottom: 20 },
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 14, padding: 16, marginBottom: 8 },
  left: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: COLORS.gray900 },
  price: { fontSize: 13, color: COLORS.brand, fontWeight: '600', marginTop: 4 },
  removeBtn: { fontSize: 18, padding: 8 },
});
