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

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { t } = useLocale();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const resetMut = trpc.auth.resetPassword.useMutation({
    onSuccess: () => {
      setDone(true);
      setMsg(t('auth.reset-success'));
    },
    onError: (e) => {
      setError(e.message ?? t('mobile.auth.resetFailed'));
    },
  });

  const handleSubmit = () => {
    if (!token || !password) {
      setError(t('mobile.auth.allFieldsRequired'));
      return;
    }
    if (password !== confirm) {
      setError(t('auth.password-mismatch'));
      return;
    }
    if (password.length < 8) {
      setError(t('mobile.auth.passwordTooShort'));
      return;
    }
    setError('');
    resetMut.mutate({ token, newPassword: password });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('auth.reset-title')}</Text>

      {resetMut.isPending ? (
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
          <Text style={styles.hint}>{t('mobile.auth.resetHint')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('mobile.auth.resetCodePlaceholder')}
            value={token}
            onChangeText={setToken}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder={t('auth.new-password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            placeholder={t('auth.confirm-password')}
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
          />
          <TouchableOpacity style={styles.btn} onPress={handleSubmit}>
            <Text style={styles.btnText}>{t('mobile.auth.changePassword')}</Text>
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
  error: { color: '#ef4444', textAlign: 'center', fontSize: 14, marginBottom: 8 },
  successBox: { alignItems: 'center', gap: 16 },
  successIcon: { fontSize: 48 },
  successText: { fontSize: 16, color: '#10b981', textAlign: 'center' },
});
