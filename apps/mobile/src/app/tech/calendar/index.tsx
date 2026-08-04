import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';

const COLORS = { brand: '#7c3aed', white: '#ffffff', gray400: '#6b7280', gray900: '#111827' };

const DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export default function TechCalendarScreen(): JSX.Element {
  const calendar = (trpc as any).calendar?.myCalendar?.useQuery?.({}) ?? { data: null, isLoading: false, isError: false, refetch: () => {} };
  const data = calendar.data as Record<string, unknown> | undefined;

  return (
    <ScreenState isLoading={calendar.isLoading} isError={calendar.isError} isEmpty={!data} errorMessage="فشل تحميل التقويم" onRetry={() => calendar.refetch()}>
      <Text style={styles.title}>📆 التقويم</Text>
      <View style={styles.daysRow}>
        {DAYS.map((d, i) => (
          <View key={i} style={styles.dayHeader}>
            <Text style={styles.dayText}>{d}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.syncNote}>📅 تتم مزامنة الحجوزات تلقائياً مع تقويم قوقل</Text>
    </ScreenState>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '800', color: COLORS.brand, textAlign: 'center', marginBottom: 20 },
  daysRow: { flexDirection: 'row', marginBottom: 12 },
  dayHeader: { flex: 1, padding: 8, backgroundColor: COLORS.brand, borderRadius: 8, marginHorizontal: 2, alignItems: 'center' },
  dayText: { fontSize: 10, fontWeight: '600', color: COLORS.white },
  syncNote: { fontSize: 13, color: COLORS.gray400, textAlign: 'center', marginTop: 24 },
});
