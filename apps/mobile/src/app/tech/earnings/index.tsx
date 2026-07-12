import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function TechEarningsScreen() {
  const [balance, setBalance] = useState<Record<string, unknown> | null>(null);
  const [earnings, setEarnings] = useState<Record<string, unknown> | null>(null);
  const [payouts, setPayouts] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState('');
  const [withdrawMsg, setWithdrawMsg] = useState('');

  const fetch = () => {
    setLoading(true);
    setError('');
    Promise.all([
      (trpc.wallet.getBalance as any).query({} as never),
      (trpc.analytics.technicianEarnings as any).query({ days: 30 }),
      (trpc.payouts.listMyPayouts as any).query({ page: 1, limit: 20 }),
    ])
      .then(([b, e, p]: [Record<string, unknown>, Record<string, unknown>, Record<string, unknown>]) => {
        setBalance(b);
        setEarnings(e);
        setPayouts((p?.payouts ?? []) as Record<string, unknown>[]);
        setLoading(false);
      })
      .catch(() => { setError('فشل تحميل الأرباح'); setLoading(false); });
  };

  useEffect(() => { fetch(); }, []);

  const handleWithdraw = async () => {
    const a = Number(amount);
    if (a < 100) { setWithdrawMsg('الحد الأدنى ١٠٠ ر.س'); return; }
    try {
      await (trpc.wallet.withdraw as any).mutate({ amount: a, idempotencyKey: Date.now().toString() });
      setShowWithdraw(false);
      setAmount('');
      fetch();
    } catch (e: any) { setWithdrawMsg(e?.message ?? 'فشل السحب'); }
  };

  if (loading) return <ActivityIndicator color="#7c3aed" style={{ marginTop: 80 }} />;
  if (error) return (
    <View style={styles.centered}>
      <Text style={styles.error}>{error}</Text>
      <TouchableOpacity style={styles.retryBtn} onPress={fetch}><Text style={styles.retryText}>إعادة المحاولة</Text></TouchableOpacity>
    </View>
  );

  const dailyEarnings = (earnings?.dailyEarnings as Record<string, unknown>[]) ?? [];
  const statusColours: Record<string, string> = { PENDING: '#9ca3af', PROCESSING: '#3b82f6', COMPLETED: '#10b981', FAILED: '#ef4444' };
  const statusLabels: Record<string, string> = { PENDING: 'قيد الانتظار', PROCESSING: 'قيد المعالجة', COMPLETED: 'مكتمل', FAILED: 'فشل' };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>الأرباح</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{Number(balance?.totalBalance ?? 0).toFixed(0)} ر.س</Text>
            <Text style={styles.statLabel}>الرصيد الكلي</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{Number(balance?.balance ?? 0).toFixed(0)} ر.س</Text>
            <Text style={styles.statLabel}>قابل للسحب</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.withdrawBtn} onPress={() => setShowWithdraw(true)}>
          <Text style={styles.withdrawText}>طلب سحب</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>الأرباح اليومية (آخر ٣٠ يوم)</Text>
        {dailyEarnings.length === 0 ? (
          <Text style={styles.noData}>لا توجد أرباح</Text>
        ) : (
          dailyEarnings.slice(0, 10).map((d: Record<string, unknown>) => (
            <View key={d.date as string} style={styles.rowItem}>
              <Text style={styles.rowDate}>{d.date as string}</Text>
              <Text style={styles.rowAmount}>{Number(d.earnings ?? 0).toFixed(0)} ر.س</Text>
              <Text style={styles.rowCount}>{String(d.count ?? 0)} حجوزات</Text>
            </View>
          ))
        )}

        <Text style={styles.sectionTitle}>سجل المدفوعات</Text>
        {payouts.length === 0 ? (
          <Text style={styles.noData}>لا توجد مدفوعات</Text>
        ) : (
          payouts.map((p: Record<string, unknown>) => {
            const st = (p.status as string) ?? 'PENDING';
            return (
              <View key={p.id as number} style={styles.rowItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.amount}>{Number(p.amount ?? 0).toFixed(0)} ر.س</Text>
                  <Text style={styles.rowDate}>{new Date(p.createdAt as string).toLocaleDateString('ar-SA')}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusColours[st] + '20' }]}>
                  <Text style={{ color: statusColours[st], fontSize: 12, fontWeight: '600' }}>{statusLabels[st] ?? st}</Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {showWithdraw && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>طلب سحب</Text>
            {withdrawMsg ? <Text style={styles.error}>{withdrawMsg}</Text> : null}
            <TextInput style={styles.input} placeholder="المبلغ (ر.س)" value={amount} onChangeText={setAmount} keyboardType="numeric" />
            <Text style={styles.hint}>الحد الأدنى ١٠٠ ر.س</Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.btn} onPress={handleWithdraw}><Text style={styles.btnText}>تأكيد</Text></TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowWithdraw(false)}><Text style={styles.cancelText}>إلغاء</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: '#f9fafb', borderRadius: 12, padding: 16, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '800', color: '#111827' },
  statLabel: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  withdrawBtn: { backgroundColor: '#7c3aed', borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 24 },
  withdrawText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 12 },
  noData: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginBottom: 16 },
  rowItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, marginBottom: 4, borderRadius: 8, backgroundColor: '#f9fafb' },
  rowDate: { fontSize: 13, color: '#6b7280' },
  rowAmount: { fontSize: 15, fontWeight: '600', color: '#10b981' },
  rowCount: { fontSize: 13, color: '#6b7280' },
  amount: { fontSize: 15, fontWeight: '600', color: '#111827' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  centered: { alignItems: 'center', marginTop: 80 },
  error: { color: '#ef4444', fontSize: 14, textAlign: 'center', marginBottom: 8 },
  retryBtn: { backgroundColor: '#7c3aed', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10 },
  retryText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  hint: { fontSize: 12, color: '#9ca3af', marginVertical: 8 },
  modal: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 16, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, padding: 14, fontSize: 16, backgroundColor: '#f9fafb', textAlign: 'right' },
  modalBtns: { flexDirection: 'row', gap: 8, marginTop: 16 },
  btn: { flex: 1, backgroundColor: '#7c3aed', borderRadius: 12, padding: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cancelBtn: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 12, padding: 14, alignItems: 'center' },
  cancelText: { color: '#374151', fontSize: 16, fontWeight: '600' },
});
