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
import { useLocale } from '@/components/LocaleProvider';

interface TwoFactorSetup {
  secret?: string;
  otpauthUrl?: string;
}

export default function TwoFactorScreen() {
  const { t } = useLocale();
  const [error, setError] = useState('');
  const [setupData, setSetupData] = useState<TwoFactorSetup | null>(null);
  const [code, setCode] = useState('');
  const [verifyMsg, setVerifyMsg] = useState('');
  const [enabledOverride, setEnabledOverride] = useState<boolean | null>(null);

  const status = trpc.auth.me.useQuery(undefined, {
    select: (u) => Boolean(u.twoFactorEnabled),
  });
  const enabled = enabledOverride ?? status.data ?? false;

  const setupMut = trpc.auth.setup2FA.useMutation({
    onSuccess: (res) => setSetupData(res),
    onError: (e) => setError(e.message ?? t('mobile.auth.setupFailed')),
  });

  const verifyMut = trpc.auth.verify2FA.useMutation({
    onSuccess: () => {
      setEnabledOverride(true);
      setSetupData(null);
      setCode('');
    },
    onError: (e) => setVerifyMsg(e.message ?? t('mobile.auth.invalidCode')),
  });

  const disableMut = trpc.auth.disable2FA.useMutation({
    onSuccess: () => setEnabledOverride(false),
    onError: (e) => setError(e.message ?? t('mobile.auth.disableFailed')),
  });

  const handleSetup = () => setupMut.mutate({});

  const handleVerify = () => {
    if (code.length !== 6) {
      setVerifyMsg(t('auth.otp6-error'));
      return;
    }
    setVerifyMsg('');
    verifyMut.mutate({ token: code });
  };

  const handleDisable = () => disableMut.mutate({});

  if (status.isLoading) return <ActivityIndicator color="#7c3aed" style={{ marginTop: 80 }} />;
  if (status.isError)
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{t('mobile.auth.statusLoadFailed')}</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('mobile.auth.twoFactorTitle')}</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {enabled ? (
        <View style={styles.card}>
          <Text style={styles.checkIcon}></Text>
          <Text style={styles.successText}>{t('auth.2fa-enabled')}</Text>
          <Text style={styles.hint}>{t('mobile.auth.twoFactorActiveHint')}</Text>
          <TouchableOpacity
            style={[styles.btn, styles.dangerBtn]}
            onPress={handleDisable}
            disabled={disableMut.isPending}
          >
            {disableMut.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>{t('auth.2fa-disable')}</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : setupData ? (
        <View style={styles.card}>
          <Text style={styles.label}>{t('auth.2fa-secret')}</Text>
          <Text style={styles.secret} selectable>
            {setupData.secret}
          </Text>
          <Text style={styles.hint}>{t('mobile.auth.secretHint')}</Text>
          {verifyMsg ? <Text style={styles.error}>{verifyMsg}</Text> : null}
          <TextInput
            style={styles.input}
            placeholder="000000"
            value={code}
            onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 6))}
            keyboardType="number-pad"
            maxLength={6}
          />
          <TouchableOpacity
            style={styles.btn}
            onPress={handleVerify}
            disabled={verifyMut.isPending || code.length !== 6}
          >
            {verifyMut.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>{t('auth.2fa-confirm-enable')}</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.lockIcon}></Text>
          <Text style={styles.subTitle}>{t('auth.2fa-setup-title')}</Text>
          <Text style={styles.hint}>{t('mobile.auth.setupHint')}</Text>
          <TouchableOpacity style={styles.btn} onPress={handleSetup} disabled={setupMut.isPending}>
            {setupMut.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>{t('auth.2fa-start-setup')}</Text>
            )}
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
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  checkIcon: { fontSize: 48 },
  lockIcon: { fontSize: 48 },
  subTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  successText: { fontSize: 18, fontWeight: '700', color: '#10b981' },
  hint: { fontSize: 14, color: '#6b7280', textAlign: 'center' },
  label: { fontSize: 14, fontWeight: '600', color: '#374151' },
  secret: {
    fontSize: 16,
    fontFamily: 'monospace',
    backgroundColor: '#e5e7eb',
    padding: 12,
    borderRadius: 8,
    color: '#111827',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 14,
    fontSize: 24,
    textAlign: 'center',
    backgroundColor: '#fff',
    width: '100%',
    letterSpacing: 8,
  },
  btn: {
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dangerBtn: { backgroundColor: '#ef4444' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  error: { color: '#ef4444', textAlign: 'center', fontSize: 14, marginBottom: 8 },
});
