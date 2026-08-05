import { View, Text, StyleSheet } from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';

const COLORS = { brand: '#7c3aed', white: '#ffffff', gray400: '#6b7280', gray900: '#111827' };

export default function BeautyCoursesScreen(): JSX.Element {
  const courses = trpc.beautyCourses.list.useQuery({});
  const data = courses.data as unknown[] | undefined;

  return (
    <ScreenState isLoading={courses.isLoading} isError={courses.isError} isEmpty={!data || data.length === 0} errorMessage="فشل تحميل الدورات" emptyTitle="لا توجد دورات" onRetry={() => courses.refetch()}>
      <Text style={styles.title}>🎓 دورات التجميل</Text>
      {(data as Record<string, unknown>[])?.map((c: Record<string, unknown>, i: number) => (
        <View key={i} style={styles.card}>
          <Text style={styles.emoji}>{c.emoji as string ?? '💄'}</Text>
          <View style={styles.info}>
            <Text style={styles.name}>{(c.titleJson as any)?.ar ?? ''}</Text>
            <Text style={styles.instructor}>{c.instructor as string} • {c.lessons as number} دروس</Text>
            <Text style={styles.detail}>{c.level as string} • {c.duration as string} • ⭐ {c.rating as number}</Text>
          </View>
        </View>
      ))}
    </ScreenState>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '800', color: COLORS.brand, textAlign: 'center', marginBottom: 20 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 14, padding: 16, marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  emoji: { fontSize: 36, marginRight: 12 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: COLORS.gray900 },
  instructor: { fontSize: 13, color: COLORS.gray400, marginTop: 4 },
  detail: { fontSize: 12, color: COLORS.gray400, marginTop: 2 },
});
