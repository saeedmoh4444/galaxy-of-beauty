import { View, Text, Image, StyleSheet } from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';

const COLORS = { brand: '#7c3aed', white: '#ffffff', gray400: '#6b7280', gray900: '#111827' };

export default function BeforeAfterScreen(): JSX.Element {
  const gallery = (trpc as any).beforeAfter?.list?.useQuery?.({}) ?? {
    data: null,
    isLoading: false,
    isError: false,
    refetch: () => {},
  };
  const data = gallery.data as unknown[] | undefined;

  return (
    <ScreenState
      isLoading={gallery.isLoading}
      isError={gallery.isError}
      isEmpty={!data || data.length === 0}
      errorMessage="فشل تحميل المعرض"
      emptyTitle="لا توجد صور"
      onRetry={() => gallery.refetch()}
    >
      <Text style={styles.title}>📸 قبل وبعد</Text>
      <View style={styles.grid}>
        {(data as Record<string, unknown>[])?.map((item: Record<string, unknown>, i: number) => (
          <View key={i} style={styles.card}>
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imageText}>📸</Text>
            </View>
            <Text style={styles.label}>{(item.titleJson as any)?.ar ?? ''}</Text>
          </View>
        ))}
      </View>
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  card: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  imagePlaceholder: {
    height: 120,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageText: { fontSize: 32 },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray900,
    padding: 8,
    textAlign: 'center',
  },
});
