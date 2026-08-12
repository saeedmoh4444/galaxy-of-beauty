import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';

const COLORS = { brand: '#7c3aed', white: '#ffffff', gray400: '#6b7280', gray900: '#111827' };

export default function FavoritesScreen(): JSX.Element {
  const favs = (trpc as any).favorites?.list?.useQuery?.() ?? {
    data: null,
    isLoading: false,
    isError: false,
    refetch: () => {},
  };
  const data = favs.data as unknown[] | undefined;

  return (
    <ScreenState
      isLoading={favs.isLoading}
      isError={favs.isError}
      isEmpty={!data || data.length === 0}
      errorMessage="فشل تحميل المفضلة"
      emptyTitle="لا توجد خدمات مفضلة"
      emptyDescription="أضيفي خدماتكِ المفضلة للوصول السريع"
      onRetry={() => favs.refetch()}
    >
      <Text style={styles.title}> المفضلة السريعة</Text>
      {(data as Record<string, unknown>[])?.map((f: Record<string, unknown>, i: number) => (
        <View key={i} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>{f.label as string}</Text>
            <Text style={styles.serviceId}>خدمة #{f.serviceId as number}</Text>
          </View>
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
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 15, fontWeight: '600', color: COLORS.gray900 },
  serviceId: { fontSize: 12, color: COLORS.gray400 },
});
