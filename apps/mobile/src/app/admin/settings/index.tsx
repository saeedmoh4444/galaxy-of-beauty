import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function AdminSettingsScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [platformFee, setPlatformFee] = useState('');
  const [cashbackFirst, setCashbackFirst] = useState('');
  const [cashbackSub, setCashbackSub] = useState('');
  const [maintenance, setMaintenance] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const fetch = () => {
    setLoading(true);
    setError('');
    (trpc.platform.getSettings as any).query({} as never)
      .then((d: Record<string, unknown>) => {
        setPlatformFee(String(d.platformFeeSar ?? 11));
        setCashbackFirst(String(d.cashbackFirstBooking ?? 40));
        setCashbackSub(String(d.cashbackSubsequent ?? 5));
        setMaintenance(Boolean(d.maintenanceMode));
        setLoading(false);
      })
      .catch(() => { setError('فشل تحميل الإعدادات'); setLoading(false); });
  };

  useEffect(() => { fetch(); }, []);

  const handleSave = async () => {
    try {
      await (trpc.platform.updateSetting as any).mutate({
        platformFeeSar: Number(platformFee),
        cashbackFirstBookingPercent: Number(cashbackFirst),
        cashbackSubsequentPercent: Number(cashbackSub),
        maintenanceMode: maintenance,
      });
      setSaveMsg('تم حفظ الإعدادات');
    } catch (e: any) { setSaveMsg(e?.message ?? 'فشل الحفظ'); }
  };

  const handleToggleMaintenance = async () => {
    try {
      await (trpc.platform.toggleMaintenance as any).mutate({} as never);
      setMaintenance(!maintenance);
    } catch {}
  };

  if (loading) return <ActivityIndicator color="#7c3aed" style={{ marginTop: 80 }} />;
  if (error) return (
    <View style={styles.centered}>
      <Text style={styles.error}>{error}</Text>
      <TouchableOpacity style={styles.retryBtn} onPress={fetch}><Text style={styles.retryText}>إعادة المحاولة</Text></TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>إعدادات المنصة</Text>

      {saveMsg ? <Text style={[styles.msg, saveMsg.includes('فشل') ? { color: '#ef4444' } : { color: '#10b981' }]}>{saveMsg}</Text> : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>الإعدادات المالية</Text>
        <Text style={styles.label}>نسبة رسوم المنصة (ر.س)</Text>
        <TextInput style={styles.input} value={platformFee} onChangeText={setPlatformFee} keyboardType="numeric" />
        <Text style={styles.label}>نسبة الكاش باك - أول حجز (%)</Text>
        <TextInput style={styles.input} value={cashbackFirst} onChangeText={setCashbackFirst} keyboardType="numeric" />
        <Text style={styles.label}>نسبة الكاش باك - الحجوزات التالية (%)</Text>
        <TextInput style={styles.input} value={cashbackSub} onChangeText={setCashbackSub} keyboardType="numeric" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>حالة المنصة</Text>
        <View style={styles.row}>
          <Text style={styles.label}>وضع الصيانة</Text>
          <TouchableOpacity style={[styles.toggle, maintenance && styles.toggleActive]} onPress={handleToggleMaintenance}>
            <Text style={[styles.toggleText, maintenance && { color: '#fff' }]}>{maintenance ? 'مفعل' : 'متوقف'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveText}>حفظ الإعدادات</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 16 },
  section: { marginBottom: 20, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  label: { fontSize: 14, color: '#6b7280', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, padding: 14, fontSize: 16, backgroundColor: '#f9fafb', textAlign: 'right', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  toggle: { backgroundColor: '#f3f4f6', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10 },
  toggleActive: { backgroundColor: '#7c3aed' },
  toggleText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  saveBtn: { backgroundColor: '#7c3aed', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 8 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  msg: { fontSize: 14, textAlign: 'center', marginBottom: 12 },
  centered: { alignItems: 'center', marginTop: 80 },
  error: { color: '#ef4444', fontSize: 16, marginBottom: 12 },
  retryBtn: { backgroundColor: '#7c3aed', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10 },
  retryText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
