import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';

const COLORS = { brand: '#7c3aed', white: '#ffffff', gray400: '#6b7280', gray900: '#111827', success: '#10b981' };

export default function AddressesScreen(): JSX.Element {
  const addresses = trpc.addresses.list.useQuery();
  const data = addresses.data as unknown[] | undefined;

  return (
    <ScreenState
      isLoading={addresses.isLoading}
      isError={addresses.isError}
      isEmpty={!data || data.length === 0}
      errorMessage="فشل تحميل العناوين"
      emptyTitle="لا توجد عناوين"
      emptyDescription="أضيفي عنوانكِ الأول لتسهيل الحجز"
      onRetry={() => addresses.refetch()}
    >
      <Text style={styles.title}>📍 عناويني</Text>
      {(data as Record<string, unknown>[])?.map((a: Record<string, unknown>, i: number) => (
        <View key={i} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>{a.label as string}</Text>
            {a.isDefault ? <Text style={styles.defaultBadge}>✓ افتراضي</Text> : null}
          </View>
          <Text style={styles.detail}>{a.street as string}، {a.area as string}، {a.city as string}</Text>
        </View>
      ))}
      <TouchableOpacity style={styles.addBtn}>
        <Text style={styles.addText}>➕ إضافة عنوان جديد</Text>
      </TouchableOpacity>
    </ScreenState>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '800', color: COLORS.brand, textAlign: 'center', marginBottom: 20 },
  card: { backgroundColor: COLORS.white, borderRadius: 14, padding: 16, marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  label: { fontSize: 15, fontWeight: '700', color: COLORS.gray900 },
  defaultBadge: { fontSize: 10, color: COLORS.success, fontWeight: '600' },
  detail: { fontSize: 13, color: COLORS.gray400 },
  addBtn: { alignItems: 'center', padding: 16, marginTop: 8 },
  addText: { fontSize: 15, fontWeight: '600', color: COLORS.brand },
});
