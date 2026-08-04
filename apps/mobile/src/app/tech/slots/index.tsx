import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';

const COLORS = { brand: '#7c3aed', white: '#ffffff', gray400: '#6b7280', gray900: '#111827', available: '#10b981', booked: '#dc2626' };

export default function TechSlotsScreen(): JSX.Element {
  const slots = (trpc as any).slots?.mySlots?.useQuery?.({ days: 7 }) ?? { data: null, isLoading: false, isError: false, refetch: () => {} };
  const data = slots.data as unknown[] | undefined;

  return (
    <ScreenState isLoading={slots.isLoading} isError={slots.isError} isEmpty={!data || data.length === 0} errorMessage="فشل تحميل المواعيد" emptyTitle="لا توجد مواعيد" emptyDescription="أضيفي مواعيدك المتاحة" onRetry={() => slots.refetch()}>
      <Text style={styles.title}>⏰ المواعيد المتاحة</Text>
      {(data as Record<string, unknown>[])?.map((s: Record<string, unknown>, i: number) => (
        <View key={i} style={[styles.card, { borderLeftColor: s.isBooked ? COLORS.booked : COLORS.available }]}>
          <View style={styles.row}>
            <Text style={styles.time}>{new Date(s.startAt as string).toLocaleString('ar-SA')}</Text>
            <Text style={[styles.status, { color: s.isBooked ? COLORS.booked : COLORS.available }]}>
              {s.isBooked ? '🔴 محجوز' : '🟢 متاح'}
            </Text>
          </View>
        </View>
      ))}
    </ScreenState>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '800', color: COLORS.brand, textAlign: 'center', marginBottom: 20 },
  card: { backgroundColor: COLORS.white, borderRadius: 14, padding: 16, marginBottom: 8, borderLeftWidth: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  time: { fontSize: 14, fontWeight: '600', color: COLORS.gray900 },
  status: { fontSize: 13, fontWeight: '600' },
});
