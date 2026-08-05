import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';
import { useHaptics } from '@/hooks/useHaptics';

const COLORS = {
  brand: '#7c3aed',
  white: '#ffffff',
  gray50: '#faf5ff',
  gray700: '#374151',
  gray900: '#111827',
};

export default function HomeScreen(): JSX.Element {
  const router = useRouter();
  const { trigger } = useHaptics();
  const cats = trpc.categories.list.useQuery();

  const data = cats.data as unknown[] | undefined;

  return (
    <ScreenState
      isLoading={cats.isLoading}
      isError={cats.isError}
      isEmpty={!data || data.length === 0}
      errorMessage="فشل تحميل الأقسام"
      emptyTitle="لا توجد أقسام"
      onRetry={() => cats.refetch()}
    >
      <Text style={styles.title}>🏠 جالكسي بيوتي</Text>
      <View style={styles.grid}>
        {(data as Record<string, unknown>[])?.map((cat: Record<string, unknown>, i: number) => (
          <TouchableOpacity
            key={i}
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => { trigger('light'); router.push('/public/services' as any); }}
          >
            <Text style={styles.emoji}>📂</Text>
            <Text style={styles.name}>
              {((cat.nameJson as Record<string, string>)?.ar) ?? (cat.nameAr as string) ?? ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScreenState>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '800', color: COLORS.brand, textAlign: 'center', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: {
    width: '30%',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emoji: { fontSize: 30 },
  name: { fontSize: 11, fontWeight: '600', color: COLORS.gray900, marginTop: 6, textAlign: 'center' },
});
