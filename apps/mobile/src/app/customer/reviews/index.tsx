import { View, Text, StyleSheet } from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';

const COLORS = {
  brand: '#7c3aed',
  white: '#ffffff',
  gray400: '#6b7280',
  gray900: '#111827',
  star: '#f59e0b',
};

export default function ReviewsScreen(): JSX.Element {
  const reviews = trpc.reviews.list.useQuery({});
  const data = reviews.data as unknown[] | undefined;

  return (
    <ScreenState
      isLoading={reviews.isLoading}
      isError={reviews.isError}
      isEmpty={!data || data.length === 0}
      errorMessage="فشل تحميل التقييمات"
      emptyTitle="لا توجد تقييمات"
      emptyDescription="قيمي الخدمات التي حصلتِ عليها"
      onRetry={() => reviews.refetch()}
    >
      <Text style={styles.title}> تقييماتي</Text>
      {(data as Record<string, unknown>[])?.map((r: Record<string, unknown>, i: number) => (
        <View key={i} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.stars}>{''.repeat(Number(r.rating) || 0)}</Text>
            <Text style={styles.date}>
              {new Date(r.createdAt as string).toLocaleDateString('ar-SA')}
            </Text>
          </View>
          {r.comment ? <Text style={styles.comment}>{r.comment as string}</Text> : null}
        </View>
      ))}
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
  stars: { fontSize: 14 },
  date: { fontSize: 11, color: COLORS.gray400 },
  comment: { fontSize: 13, color: COLORS.gray400, marginTop: 4 },
});
