import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState } from 'react';
import { useRouter } from 'expo-router';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!token || !password) { setError('جميع الحقول مطلوبة'); return; }
    if (password !== confirm) { setError('كلمات المرور غير متطابقة'); return; }
    if (password.length < 8) { setError('كلمة المرور يجب أن تكون ٨ أحرف على الأقل'); return; }
    setError('');
    setLoading(true);
    try {
      await (trpc.auth.resetPassword as any).mutate({ token, password });
      setDone(true);
      setMsg('تم إعادة تعيين كلمة المرور بنجاح');
    } catch (e: any) {
      setError(e?.message ?? 'فشل إعادة تعيين كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>إعادة تعيين كلمة المرور</Text>

      {loading ? (
        <ActivityIndicator color="#7c3aed" style={{ marginTop: 32 }} />
      ) : done ? (
        <View style={styles.successBox}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.successText}>{msg}</Text>
          <TouchableOpacity style={styles.btn} onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.btnText}>تسجيل الدخول</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.form}>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Text style={styles.hint}>أدخل رمز إعادة التعيين المرسل إلى بريدك الإلكتروني وكلمة المرور الجديدة</Text>
          <TextInput style={styles.input} placeholder="رمز إعادة التعيين" value={token} onChangeText={setToken} autoCapitalize="none" />
          <TextInput style={styles.input} placeholder="كلمة المرور الجديدة" value={password} onChangeText={setPassword} secureTextEntry />
          <TextInput style={styles.input} placeholder="تأكيد كلمة المرور" value={confirm} onChangeText={setConfirm} secureTextEntry />
          <TouchableOpacity style={styles.btn} onPress={handleSubmit}>
            <Text style={styles.btnText}>تغيير كلمة المرور</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 8 },
  hint: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 16 },
  form: { gap: 12 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, padding: 14, fontSize: 16, backgroundColor: '#f9fafb', textAlign: 'right' },
  btn: { backgroundColor: '#7c3aed', borderRadius: 12, padding: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  error: { color: '#ef4444', textAlign: 'center', fontSize: 14, marginBottom: 8 },
  successBox: { alignItems: 'center', gap: 16 },
  successIcon: { fontSize: 48 },
  successText: { fontSize: 16, color: '#10b981', textAlign: 'center' },
});
