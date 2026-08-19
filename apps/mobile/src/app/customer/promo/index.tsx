import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';
import { formatCurrency } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

const COLORS = {
  brand: '#7c3aed',
  white: '#ffffff',
  gray400: '#6b7280',
  gray900: '#111827',
  success: '#10b981',
  danger: '#dc2626',
};

export default function PromoScreen(): JSX.Element {
  const { t } = useLocale();
  const [code, setCode] = useState('');
  const promos = trpc.promo.list.useQuery() ?? {
    data: null,
    isLoading: false,
    isError: false,
    refetch: () => {},
  };
  const data = promos.data as unknown[] | undefined;

  return (
    <ScreenState
      isLoading={promos.isLoading}
      isError={promos.isError}
      isEmpty={false}
      errorMessage={t('mobile.promo.load-error')}
      onRetry={() => promos.refetch()}
    >
      <Text style={styles.title}>{t('mobile.promo.title')}</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder={t('mobile.promo.input-placeholder')}
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
        />
        <TouchableOpacity style={styles.applyBtn}>
          <Text style={styles.applyText}>{t('mobile.promo.apply')}</Text>
        </TouchableOpacity>
      </View>
      {(data as Record<string, unknown>[])?.map((p: Record<string, unknown>, i: number) => (
        <View key={i} style={styles.card}>
          <Text style={styles.promoCode}>{p.code as string}</Text>
          <Text style={styles.promoDesc}>
            {p.discountType === 'percent'
              ? t('mobile.promo.discount-percent', { value: String(p.discountValue as number) })
              : t('mobile.promo.discount-amount', {
                  value: formatCurrency(Number(p.discountValue)),
                })}
          </Text>
          {p.minOrderAmount ? (
            <Text style={styles.minOrder}>
              {t('mobile.promo.min-order', { value: formatCurrency(Number(p.minOrderAmount)) })}
            </Text>
          ) : null}
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
  inputRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    backgroundColor: COLORS.white,
  },
  applyBtn: {
    backgroundColor: COLORS.brand,
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  applyText: { fontSize: 14, fontWeight: '600', color: COLORS.white },
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
  promoCode: { fontSize: 16, fontWeight: '800', color: COLORS.gray900, fontFamily: 'monospace' },
  promoDesc: { fontSize: 14, color: COLORS.success, fontWeight: '600', marginTop: 4 },
  minOrder: { fontSize: 12, color: COLORS.gray400, marginTop: 4 },
});
