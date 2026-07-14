import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { useWallet, useWalletTransactions, useWithdraw } from '../hooks/useWallet';

const SOURCE_LABELS = {
  CASHBACK: 'استرداد نقدي', PLATFORM_FEE_SHARE: 'أرباح', WITHDRAWAL: 'سحب',
  SUBSCRIPTION_BONUS: 'مكافأة', REFERRAL_BONUS: 'إحالة', HANDLING_FEE_DEDUCTION: 'رسوم',
  REFUND: 'استرداد',
};
const SOURCE_ICONS = {
  CASHBACK: '💵', PLATFORM_FEE_SHARE: '💰', WITHDRAWAL: '🏦',
  SUBSCRIPTION_BONUS: '🎁', REFERRAL_BONUS: '👥', HANDLING_FEE_DEDUCTION: '📋',
  REFUND: '↩️',
};

export default function WalletScreen() {
  const [filter, setFilter] = useState('all');
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const { user } = useAuthStore();
  const { data, isLoading, refetch } = useWallet();
  const { data: txData } = useWalletTransactions({ type: filter !== 'all' ? filter : undefined });
  const withdraw = useWithdraw();

  const wallet = data?.wallet;
  const transactions = txData?.transactions || data?.recentTransactions || [];
  const isTechnician = user?.role === 'TECHNICIAN';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}><Text style={styles.headerTitle}>💰 المحفظة</Text></View>

      {/* Balance Cards */}
      <View style={styles.balanceCards}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>الرصيد</Text>
          <Text style={styles.balanceAmount}>{Number(wallet?.balance || 0).toLocaleString('ar-SA')}</Text>
          <Text style={styles.balanceCurrency}>ر.س</Text>
        </View>
        <View style={[styles.balanceCard, { backgroundColor: '#F5F3FF' }]}>
          <Text style={styles.balanceLabel}>المكافآت</Text>
          <Text style={[styles.balanceAmount, { color: '#7C3AED' }]}>{Number(wallet?.bonusBalance || 0).toLocaleString('ar-SA')}</Text>
          <Text style={styles.balanceCurrency}>ر.س</Text>
        </View>
      </View>

      {/* Withdraw Button (Technician Only) */}
      {isTechnician && (
        <TouchableOpacity style={styles.withdrawBtn} onPress={() => setShowWithdraw(!showWithdraw)}>
          <Text style={styles.withdrawBtnText}>{showWithdraw ? 'إلغاء' : '🏦 طلب سحب'}</Text>
        </TouchableOpacity>
      )}

      {showWithdraw && (
        <View style={styles.withdrawForm}>
          <Text style={styles.withdrawInfo}>الحد الأدنى: ٢٠٠ ر.س | رسوم السحب: ٥٪</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput
              style={styles.withdrawInput}
              placeholder="المبلغ (ر.س)"
              keyboardType="numeric"
              value={withdrawAmount}
              onChangeText={setWithdrawAmount}
            />
            <TouchableOpacity
              style={[styles.withdrawSubmit, withdraw.isPending && { opacity: 0.5 }]}
              onPress={() => withdraw.mutate(Number(withdrawAmount))}
              disabled={withdraw.isPending || !withdrawAmount}
            >
              {withdraw.isPending ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700' }}>تأكيد</Text>}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {[{ key: 'all', label: 'الكل' }, { key: 'CREDIT', label: 'وارد' }, { key: 'DEBIT', label: 'صادر' }].map((f) => (
          <TouchableOpacity key={f.key} onPress={() => setFilter(f.key)} style={[styles.filterTab, filter === f.key && styles.filterTabActive]}>
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Transactions */}
      <FlatList
        data={transactions}
        keyExtractor={(i) => String(i.id)}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#7C3AED" />}
        contentContainerStyle={transactions.length === 0 ? { flexGrow: 1, justifyContent: 'center' } : { padding: 12 }}
        ListEmptyComponent={<Text style={styles.empty}>لا توجد معاملات</Text>}
        renderItem={({ item }) => (
          <View style={styles.txRow}>
            <View style={styles.txIcon}>
              <Text style={{ fontSize: 18 }}>{SOURCE_ICONS[item.source] || '💳'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.txSource}>{SOURCE_LABELS[item.source] || item.source}</Text>
              {item.description && <Text style={styles.txDesc} numberOfLines={1}>{item.description}</Text>}
              <Text style={styles.txDate}>{new Date(item.createdAt).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
            <Text style={[styles.txAmount, { color: item.type === 'CREDIT' ? '#10B981' : '#EF4444' }]}>
              {item.type === 'CREDIT' ? '+' : '-'}{Number(item.amount).toLocaleString('ar-SA')}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { padding: 16, backgroundColor: '#fff' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#111827' },
  balanceCards: { flexDirection: 'row', padding: 16, gap: 12 },
  balanceCard: { flex: 1, backgroundColor: '#fff', padding: 20, borderRadius: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  balanceLabel: { fontSize: 12, color: '#6B7280' },
  balanceAmount: { fontSize: 26, fontWeight: '800', color: '#111827', marginTop: 6 },
  balanceCurrency: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  withdrawBtn: { marginHorizontal: 16, marginBottom: 4, backgroundColor: '#7C3AED', padding: 12, borderRadius: 12, alignItems: 'center' },
  withdrawBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  withdrawForm: { marginHorizontal: 16, marginBottom: 12, backgroundColor: '#F5F3FF', padding: 14, borderRadius: 12 },
  withdrawInfo: { fontSize: 12, color: '#7C3AED', marginBottom: 10, textAlign: 'center' },
  withdrawInput: { flex: 1, backgroundColor: '#fff', padding: 12, borderRadius: 10, fontSize: 15, borderWidth: 1, borderColor: '#E5E7EB' },
  withdrawSubmit: { backgroundColor: '#10B981', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, justifyContent: 'center' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 4, gap: 8 },
  filterTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6' },
  filterTabActive: { backgroundColor: '#7C3AED' },
  filterText: { fontSize: 13, color: '#6B7280' },
  filterTextActive: { color: '#fff', fontWeight: '600' },
  txRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 6, gap: 12 },
  txIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  txSource: { fontSize: 14, fontWeight: '600', color: '#374151' },
  txDesc: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  txDate: { fontSize: 11, color: '#D1D5DB', marginTop: 3 },
  txAmount: { fontSize: 15, fontWeight: '700' },
  empty: { textAlign: 'center', color: '#9CA3AF', fontSize: 15 },
});
