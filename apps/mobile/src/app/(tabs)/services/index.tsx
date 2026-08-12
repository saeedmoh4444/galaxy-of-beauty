import { useHaptics } from '@/hooks/useHaptics';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useState } from 'react';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';
import { formatCurrency } from '@galaxy/ui';

const COLORS = {
  brand: '#7c3aed',
  white: '#ffffff',
  gray50: '#faf5ff',
  gray400: '#6b7280',
  gray900: '#111827',
};

export default function ServicesScreen(): JSX.Element {
  const [search, setSearch] = useState('');
  const services = trpc.services.list.useQuery({
    sort: 'popular',
    limit: 20,
    search: search || undefined,
  } as any);
  const data = services.data?.items as unknown[] | undefined;

  return (
    <ScreenState
      isLoading={services.isLoading}
      isError={services.isError}
      isEmpty={!data || data.length === 0}
      errorMessage="فشل تحميل الخدمات"
      emptyTitle="لا توجد خدمات"
      onRetry={() => services.refetch()}
    >
      <Text style={styles.title}> الخدمات</Text>
      <TextInput
        style={styles.search}
        placeholder=" بحث عن خدمة..."
        value={search}
        onChangeText={(t) => {
          setSearch(t);
          services.refetch();
        }}
        placeholderTextColor={COLORS.gray400}
      />
      {(data as Record<string, unknown>[])?.map((s: Record<string, unknown>, i: number) => (
        <TouchableOpacity key={i} style={styles.card} activeOpacity={0.7}>
          <View style={styles.row}>
            <View style={styles.left}>
              <Text style={styles.name}>
                {(s.titleJson as Record<string, string>)?.ar ?? (s.titleAr as string) ?? ''}
              </Text>
              <Text style={styles.desc} numberOfLines={2}>
                {(s.descriptionJson as Record<string, string>)?.ar?.slice(0, 80) ?? ''}
              </Text>
            </View>
            <Text style={styles.price}>{formatCurrency(Number(s.basePrice))}</Text>
          </View>
        </TouchableOpacity>
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
    marginBottom: 16,
  },
  search: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
    color: COLORS.gray900,
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
  left: { flex: 1, marginRight: 12 },
  name: { fontSize: 15, fontWeight: '700', color: COLORS.gray900 },
  desc: { fontSize: 12, color: COLORS.gray400, marginTop: 3 },
  price: { fontSize: 14, fontWeight: '700', color: COLORS.brand },
});
