import { View, Text, StyleSheet } from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';

const COLORS = { brand: '#7c3aed', white: '#ffffff', gray400: '#6b7280', gray900: '#111827' };

const BRAND_COLORS: Record<string, string> = {
  visa: '#1a1f71',
  mastercard: '#eb001b',
  mada: '#00a478',
  amex: '#2e77bb',
};

export default function SavedCardsScreen(): JSX.Element {
  const cards = trpc.savedCards.list.useQuery();
  const data = cards.data as unknown[] | undefined;

  return (
    <ScreenState
      isLoading={cards.isLoading}
      isError={cards.isError}
      isEmpty={!data || data.length === 0}
      errorMessage="فشل تحميل البطاقات"
      emptyTitle="لا توجد بطاقات محفوظة"
      emptyDescription="أضيفي بطاقتكِ للدفع السريع"
      onRetry={() => cards.refetch()}
    >
      <Text style={styles.title}> البطاقات المحفوظة</Text>
      {(data as Record<string, unknown>[])?.map((c: Record<string, unknown>, i: number) => (
        <View
          key={i}
          style={[
            styles.card,
            { borderLeftColor: BRAND_COLORS[c.brand as string] ?? COLORS.brand },
          ]}
        >
          <View style={styles.row}>
            <Text style={styles.cardNum}>•••• {c.lastFour as string}</Text>
            <Text
              style={[styles.brand, { color: BRAND_COLORS[c.brand as string] ?? COLORS.brand }]}
            >
              {c.brand as string}
            </Text>
          </View>
          <Text style={styles.expiry}>
            تنتهي {c.expMonth as string}/{c.expYear as string}
          </Text>
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
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardNum: { fontSize: 16, fontWeight: '700', color: COLORS.gray900, fontFamily: 'monospace' },
  brand: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  expiry: { fontSize: 11, color: COLORS.gray400, marginTop: 4 },
});
