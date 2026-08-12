import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';

const COLORS = { brand: '#7c3aed', white: '#ffffff', gray400: '#6b7280', gray900: '#111827' };
const STATUS_LABELS: Record<string, string> = {
  OPEN: 'مفتوح',
  UNDER_REVIEW: 'قيد المراجعة',
  RESOLVED_CUSTOMER: 'محلول',
  RESOLVED_TECHNICIAN: 'محلول',
  CLOSED: 'مغلق',
};

export default function DisputesScreen(): JSX.Element {
  const disputes = (trpc as any).disputes?.list?.useQuery?.({}) ?? {
    data: null,
    isLoading: false,
    isError: false,
    refetch: () => {},
  };
  const data = disputes.data as unknown[] | undefined;

  return (
    <ScreenState
      isLoading={disputes.isLoading}
      isError={disputes.isError}
      isEmpty={!data || data.length === 0}
      errorMessage="فشل تحميل النزاعات"
      emptyTitle="لا توجد نزاعات"
      emptyDescription="يمكنكِ فتح نزاع على أي حجز"
      onRetry={() => disputes.refetch()}
    >
      <Text style={styles.title}>️ النزاعات</Text>
      {(data as Record<string, unknown>[])?.map((d: Record<string, unknown>, i: number) => (
        <View key={i} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.reason}>{d.reason as string}</Text>
            <Text style={styles.status}>
              {STATUS_LABELS[d.status as string] ?? (d.status as string)}
            </Text>
          </View>
          {d.resolution ? (
            <Text style={styles.resolution}>الحل: {d.resolution as string}</Text>
          ) : null}
          <Text style={styles.date}>
            {new Date(d.createdAt as string).toLocaleDateString('ar-SA')}
          </Text>
        </View>
      ))}
      <TouchableOpacity style={styles.addBtn}>
        <Text style={styles.addText}> فتح نزاع جديد</Text>
      </TouchableOpacity>
    </ScreenState>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.brand,
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reason: { fontSize: 14, fontWeight: '600', color: COLORS.gray900 },
  status: { fontSize: 11, fontWeight: '600', color: COLORS.brand },
  resolution: { fontSize: 12, color: '#10b981', marginTop: 4 },
  date: { fontSize: 10, color: COLORS.gray400, marginTop: 4 },
  addBtn: { alignItems: 'center', padding: 16, marginTop: 8 },
  addText: { fontSize: 15, fontWeight: '600', color: COLORS.brand },
});
