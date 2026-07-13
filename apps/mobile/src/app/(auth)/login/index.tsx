import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { trpc } from '@/lib/api';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpToken, setTotpToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const result = await trpc.auth.login.mutate({
        email,
        password,
        ...(twoFactorRequired ? { totpToken } : {}),
      });
      const u = result.user as Record<string, unknown>;
      if (u.role === 'ADMIN') router.replace('/admin/dashboard');
      else if (u.role === 'TECHNICIAN') router.replace('/tech/dashboard');
      else router.replace('/(tabs)/home');
    } catch (err: unknown) {
      // Check if the server is requesting 2FA
      const trpcErr = err as { data?: { code?: string }; message?: string };
      if (trpcErr.data?.code === 'PRECONDITION_FAILED' && trpcErr.message === '2FA_REQUIRED') {
        setTwoFactorRequired(true);
      } else {
        Alert.alert('خطأ', (err as Error).message || 'فشل تسجيل الدخول');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel2FA = () => {
    setTwoFactorRequired(false);
    setTotpToken('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>تسجيل الدخول</Text>

      {!twoFactorRequired ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="البريد الإلكتروني"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="كلمة المرور"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </>
      ) : (
        <View style={styles.totpContainer}>
          <Text style={styles.totpLabel}>
            تم تفعيل المصادقة الثنائية. أدخل رمز التحقق من تطبيق المصادقة:
          </Text>
          <TextInput
            style={[styles.input, styles.totpInput]}
            placeholder="000000"
            value={totpToken}
            onChangeText={(t) => setTotpToken(t.replace(/[^0-9]/g, '').slice(0, 6))}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
          />
          <TouchableOpacity onPress={handleCancel2FA}>
            <Text style={styles.cancelLink}>← العودة لتسجيل الدخول</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {twoFactorRequired ? 'تحقق' : 'دخول'}
          </Text>
        )}
      </TouchableOpacity>

      {!twoFactorRequired && (
        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.link}>إنشاء حساب جديد</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 32 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 16, backgroundColor: '#f9fafb' },
  button: { backgroundColor: '#7c3aed', borderRadius: 12, padding: 16, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { color: '#7c3aed', textAlign: 'center', marginTop: 16, fontSize: 14 },
  totpContainer: {
    backgroundColor: '#f5f3ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd6fe',
  },
  totpLabel: { fontSize: 14, color: '#5b21b6', textAlign: 'center', marginBottom: 12 },
  totpInput: { textAlign: 'center', fontSize: 24, letterSpacing: 8 },
  cancelLink: { color: '#7c3aed', textAlign: 'center', fontSize: 13, marginTop: 4 },
});
