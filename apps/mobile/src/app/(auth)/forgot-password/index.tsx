import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState } from 'react';
import { useRouter } from 'expo-router';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email) { setError('يرجى إدخال البريد الإلكتروني'); return; }
    setError('');
    setLoading(true);
    try {
      await (trpc.auth.forgotPassword as any).mutate({ email });
      setSent(true);
      setMsg('تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني');
    } catch (e: any) {
      setError(e?.message ?? 'فشل إرسال رابط إعادة التعيين');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>نسيت كلمة المرور</Text>
      <Text style={styles.sub}>أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور</Text>

      {loading ? (
        <ActivityIndicator color="#7c3aed" style={{ marginTop: 32 }} />
      ) : sent ? (
        <View style={styles.successBox}>
          <Text style={styles.successIcon}>📧</Text>
          <Text style={styles.successText}>{msg}</Text>
          <TouchableOpacity style={styles.btn} onPress={() => router.back()}>
            <Text style={styles.btnText}>العودة لتسجيل الدخول</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.form}>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TextInput
            style={styles.input}
            placeholder="البريد الإلكتروني"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.btn} onPress={handleSubmit}>
            <Text style={styles.btnText}>إرسال الرابط</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.link}>العودة لتسجيل الدخول</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 8 },
  sub: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 24 },
  form: { gap: 12 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, padding: 14, fontSize: 16, backgroundColor: '#f9fafb', textAlign: 'right' },
  btn: { backgroundColor: '#7c3aed', borderRadius: 12, padding: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { color: '#7c3aed', textAlign: 'center', marginTop: 12, fontSize: 14 },
  error: { color: '#ef4444', textAlign: 'center', fontSize: 14, marginBottom: 8 },
  successBox: { alignItems: 'center', gap: 16 },
  successIcon: { fontSize: 48 },
  successText: { fontSize: 16, color: '#10b981', textAlign: 'center' },
});
