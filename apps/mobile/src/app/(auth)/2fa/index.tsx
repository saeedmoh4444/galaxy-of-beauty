import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function TwoFactorScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [setupData, setSetupData] = useState<Record<string, unknown> | null>(null);
  const [code, setCode] = useState('');
  const [verifyMsg, setVerifyMsg] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchStatus = () => {
    setLoading(true);
    (trpc.auth.me.query() as unknown as Promise<Record<string, unknown>>)
      .then((u) => { setEnabled(Boolean(u.twoFactorEnabled)); setLoading(false); })
      .catch(() => { setError('فشل تحميل حالة المصادقة'); setLoading(false); });
  };

  useEffect(() => { fetchStatus(); }, []);

  const handleSetup = async () => {
    setActionLoading(true);
    try {
      const res = await (trpc.auth.setup2FA as any).mutate({});
      setSetupData(res as Record<string, unknown>);
    } catch (e: any) { setError(e?.message ?? 'فشل الإعداد'); }
    finally { setActionLoading(false); }
  };

  const handleVerify = async () => {
    if (code.length !== 6) { setVerifyMsg('يرجى إدخال رمز مكون من 6 أرقام'); return; }
    setActionLoading(true);
    setVerifyMsg('');
    try {
      await (trpc.auth.verify2FA as any).mutate({ token: code });
      setEnabled(true);
      setSetupData(null);
      setCode('');
    } catch (e: any) { setVerifyMsg(e?.message ?? 'رمز غير صحيح'); }
    finally { setActionLoading(false); }
  };

  const handleDisable = async () => {
    setActionLoading(true);
    try {
      await (trpc.auth.disable2FA as any).mutate({});
      setEnabled(false);
    } catch (e: any) { setError(e?.message ?? 'فشل التعطيل'); }
    finally { setActionLoading(false); }
  };

  if (loading) return <ActivityIndicator color="#7c3aed" style={{ marginTop: 80 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>المصادقة الثنائية</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {enabled ? (
        <View style={styles.card}>
          <Text style={styles.checkIcon}>✅</Text>
          <Text style={styles.successText}>المصادقة الثنائية مفعلة</Text>
          <Text style={styles.hint}>حسابك محمي برمز تحقق إضافي عند تسجيل الدخول</Text>
          <TouchableOpacity style={[styles.btn, styles.dangerBtn]} onPress={handleDisable} disabled={actionLoading}>
            {actionLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>تعطيل المصادقة الثنائية</Text>}
          </TouchableOpacity>
        </View>
      ) : setupData ? (
        <View style={styles.card}>
          <Text style={styles.label}>الرمز السري (Secret):</Text>
          <Text style={styles.secret} selectable>{setupData.secret as string}</Text>
          <Text style={styles.hint}>انسخ الرمز السري إلى تطبيق المصادقة، ثم أدخل رمز التحقق للتأكيد</Text>
          {verifyMsg ? <Text style={styles.error}>{verifyMsg}</Text> : null}
          <TextInput
            style={styles.input}
            placeholder="000000"
            value={code}
            onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 6))}
            keyboardType="number-pad"
            maxLength={6}
          />
          <TouchableOpacity style={styles.btn} onPress={handleVerify} disabled={actionLoading || code.length !== 6}>
            {actionLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>تأكيد وتفعيل</Text>}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.lockIcon}>🔐</Text>
          <Text style={styles.subTitle}>إعداد المصادقة الثنائية</Text>
          <Text style={styles.hint}>أضف طبقة حماية إضافية لحسابك باستخدام تطبيق المصادقة</Text>
          <TouchableOpacity style={styles.btn} onPress={handleSetup} disabled={actionLoading}>
            {actionLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>بدء الإعداد</Text>}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 24 },
  card: { backgroundColor: '#f9fafb', borderRadius: 16, padding: 24, alignItems: 'center', gap: 12 },
  checkIcon: { fontSize: 48 },
  lockIcon: { fontSize: 48 },
  subTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  successText: { fontSize: 18, fontWeight: '700', color: '#10b981' },
  hint: { fontSize: 14, color: '#6b7280', textAlign: 'center' },
  label: { fontSize: 14, fontWeight: '600', color: '#374151' },
  secret: { fontSize: 16, fontFamily: 'monospace', backgroundColor: '#e5e7eb', padding: 12, borderRadius: 8, color: '#111827' },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, padding: 14, fontSize: 24, textAlign: 'center', backgroundColor: '#fff', width: '100%', letterSpacing: 8 },
  btn: { backgroundColor: '#7c3aed', borderRadius: 12, padding: 14, alignItems: 'center', width: '100%', flexDirection: 'row', justifyContent: 'center' },
  dangerBtn: { backgroundColor: '#ef4444' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  error: { color: '#ef4444', textAlign: 'center', fontSize: 14, marginBottom: 8 },
});
