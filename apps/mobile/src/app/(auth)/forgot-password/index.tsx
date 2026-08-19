import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { trpc } from '@/lib/trpc-react';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useLocale } from '@/components/LocaleProvider';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { t } = useLocale();
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const forgotMut = trpc.auth.forgotPassword.useMutation({
    onSuccess: () => {
      setSent(true);
      setMsg(t('mobile.auth.forgotSentMsg'));
    },
    onError: (e) => {
      setError(e.message ?? t('mobile.auth.forgotSendFailed'));
    },
  });

  const handleSubmit = () => {
    if (!email) {
      setError(t('mobile.auth.emailRequired'));
      return;
    }
    setError('');
    forgotMut.mutate({ email });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('auth.forgot-title')}</Text>
      <Text style={styles.sub}>{t('auth.forgot-desc')}</Text>

      {forgotMut.isPending ? (
        <ActivityIndicator color="#7c3aed" style={{ marginTop: 32 }} />
      ) : sent ? (
        <View style={styles.successBox}>
          <Text style={styles.successIcon}></Text>
          <Text style={styles.successText}>{msg}</Text>
          <TouchableOpacity style={styles.btn} onPress={() => router.back()}>
            <Text style={styles.btnText}>{t('auth.back-to-login-short')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.form}>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TextInput
            style={styles.input}
            placeholder={t('auth.email')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.btn} onPress={handleSubmit}>
            <Text style={styles.btnText}>{t('mobile.auth.sendLink')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.link}>{t('auth.back-to-login-short')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, justifyContent: 'center' },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  sub: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 24 },
  form: { gap: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    textAlign: 'right',
  },
  btn: { backgroundColor: '#7c3aed', borderRadius: 12, padding: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { color: '#7c3aed', textAlign: 'center', marginTop: 12, fontSize: 14 },
  error: { color: '#ef4444', textAlign: 'center', fontSize: 14, marginBottom: 8 },
  successBox: { alignItems: 'center', gap: 16 },
  successIcon: { fontSize: 48 },
  successText: { fontSize: 16, color: '#10b981', textAlign: 'center' },
});
