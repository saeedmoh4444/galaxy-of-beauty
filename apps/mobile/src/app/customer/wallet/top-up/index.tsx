import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { useState } from 'react';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';
import { formatCurrency } from '@galaxy/ui';

const PRESETS = [100, 200, 500, 1000];
const COLORS = {
  brand: '#7c3aed',
  white: '#ffffff',
  gray400: '#6b7280',
  gray900: '#111827',
  success: '#10b981',
};

export default function WalletTopUpScreen(): JSX.Element {
  const [amount, setAmount] = useState('');
  const [selected, setSelected] = useState<number | null>(null);
  const balance = trpc.wallet.getBalance.useQuery();

  return (
    <ScreenState
      isLoading={balance.isLoading}
      isError={balance.isError}
      isEmpty={!balance.data}
      errorMessage="فشل تحميل المحفظة"
      onRetry={() => balance.refetch()}
    >
      <Text style={styles.title}> شحن الرصيد</Text>
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>الرصيد الحالي</Text>
        <Text style={styles.balanceAmount}>
          {formatCurrency(Number(balance.data?.balance ?? 0))}
        </Text>
      </View>
      <Text style={styles.sectionTitle}>المبالغ السريعة</Text>
      <View style={styles.presets}>
        {PRESETS.map((p) => (
          <TouchableOpacity
            key={p}
            onPress={() => {
              setAmount(String(p));
              setSelected(p);
            }}
            style={[styles.preset, selected === p && styles.presetActive]}
          >
            <Text style={[styles.presetText, selected === p && styles.presetTextActive]}>
              {formatCurrency(p)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <TextInput
        style={styles.input}
        placeholder="أدخلي المبلغ"
        value={amount}
        onChangeText={(t) => {
          setAmount(t);
          setSelected(null);
        }}
        keyboardType="number-pad"
      />
      <TouchableOpacity style={styles.topUpBtn}>
        <Text style={styles.topUpText}> شحن {amount ? formatCurrency(Number(amount)) : ''}</Text>
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
  balanceCard: {
    backgroundColor: COLORS.brand,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  balanceLabel: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  balanceAmount: { fontSize: 28, fontWeight: '800', color: COLORS.white, marginTop: 4 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: COLORS.gray900, marginBottom: 12 },
  presets: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  preset: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  presetActive: { backgroundColor: COLORS.brand },
  presetText: { fontSize: 14, fontWeight: '600', color: COLORS.gray900 },
  presetTextActive: { color: COLORS.white },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  topUpBtn: {
    backgroundColor: COLORS.success,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  topUpText: { fontSize: 16, fontWeight: '700', color: COLORS.white },
});
