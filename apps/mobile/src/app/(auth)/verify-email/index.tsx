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

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { t } = useLocale();
  const [token, setToken] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const verifyMut = trpc.auth.verifyEmail.useMutation({
    onSuccess: () => {
      setDone(true);
      setMsg(t('mobile.auth.emailVerified'));
    },
    onError: (e) => {
      setError(e.message ?? t('mobile.auth.verifyEmailFailed'));
    },
  });

  const handleVerify = () => {
    if (!token) {
      setError(t('mobile.auth.codeRequired'));
      return;
    }
    setError('');
    verifyMut.mutate({ token });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('mobile.auth.verifyTitle')}</Text>

      {verifyMut.isPending ? (
        <ActivityIndicator color="#7c3aed" style={{ marginTop: 32 }} />
      ) : done ? (
        <View style={styles.successBox}>
          <Text style={styles.successIcon}></Text>
          <Text style={styles.successText}>{msg}</Text>
          <TouchableOpacity style={styles.btn} onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.btnText}>{t('auth.login')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.form}>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Text style={styles.hint}>{t('mobile.auth.verifyHint')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('mobile.twoFactorCode')}
            value={token}
            onChangeText={setToken}
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.btn} onPress={handleVerify}>
            <Text style={styles.btnText}>{t('mobile.auth.verifyAction')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.link}>{t('mobile.auth.back')}</Text>
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
  hint: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 16 },
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
