import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { trpc } from '@/lib/trpc-react';
import { setAuthToken } from '@/lib/authToken';
import { setSocketToken } from '@/hooks/useSocket';
import { useBiometric } from '@/hooks/useBiometric';
import { useToast } from '@/components/Toast';
import { useLocale } from '@/components/LocaleProvider';
import { useTheme, themeColors } from '@/components/ThemeProvider';

export default function LoginScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { t } = useLocale();
  const { isDark } = useTheme();
  const c = isDark ? themeColors.dark : themeColors.light;
  const styles = makeStyles(c);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpToken, setTotpToken] = useState('');
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const { isAvailable, authenticate } = useBiometric();

  const handleBiometricLogin = async () => {
    const result = await authenticate();
    if (result.success) {
      showToast('success', t('mobile.auth.biometricSuccess'));
    }
  };

  const loginMut = trpc.auth.login.useMutation({
    onSuccess: (result) => {
      const u = result.user as Record<string, unknown>;
      // Store the access token: HTTP tRPC clients read it via getAuthHeaders(),
      // the socket uses it for handshake auth
      void setAuthToken(result.accessToken);
      setSocketToken(result.accessToken);
      if (u.role === 'ADMIN') router.replace('/admin/dashboard');
      else if (u.role === 'TECHNICIAN') router.replace('/tech/dashboard');
      else router.replace('/(tabs)/home');
    },
    onError: (err) => {
      // Check if the server is requesting 2FA
      if (err.data?.code === 'PRECONDITION_FAILED' && err.message === '2FA_REQUIRED') {
        setTwoFactorRequired(true);
      } else {
        showToast('error', err.message || t('mobile.auth.loginFailed'));
      }
    },
  });

  const handleLogin = () => {
    loginMut.mutate({
      email,
      password,
      ...(twoFactorRequired ? { totpToken } : {}),
    });
  };

  const handleCancel2FA = () => {
    setTwoFactorRequired(false);
    setTotpToken('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{t('auth.login')}</Text>

        {!twoFactorRequired ? (
          <>
            <TextInput
              style={styles.input}
              placeholder={t('auth.email')}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder={t('auth.password')}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </>
        ) : (
          <View style={styles.totpContainer}>
            <Text style={styles.totpLabel}>{t('auth.totp-prompt')}</Text>
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
              <Text style={styles.cancelLink}>{t('auth.cancel-2fa')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {isAvailable && !twoFactorRequired && (
          <TouchableOpacity onPress={handleBiometricLogin} style={styles.biometricBtn}>
            <Text style={styles.biometricText}>{t('mobile.auth.quickLogin')}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.button, loginMut.isPending && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loginMut.isPending}
        >
          {loginMut.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {twoFactorRequired ? t('auth.verify') : t('auth.loginShort')}
            </Text>
          )}
        </TouchableOpacity>

        {!twoFactorRequired && (
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.link}>{t('mobile.auth.createNewAccount')}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (c: typeof themeColors.light | typeof themeColors.dark) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: c.brand,
      textAlign: 'center',
      marginBottom: 32,
    },
    input: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      padding: 14,
      fontSize: 16,
      marginBottom: 16,
      backgroundColor: c.surface,
      color: c.text,
    },
    button: { backgroundColor: c.brand, borderRadius: 12, padding: 16, alignItems: 'center' },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    biometricBtn: {
      backgroundColor: c.surface,
      borderRadius: 12,
      padding: 14,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: c.border,
      marginBottom: 8,
    },
    biometricText: { color: c.brand, fontSize: 14, fontWeight: '600' },
    link: { color: c.brand, textAlign: 'center', marginTop: 16, fontSize: 14 },
    totpContainer: {
      backgroundColor: c.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: c.border,
    },
    totpLabel: { fontSize: 14, color: c.brand, textAlign: 'center', marginBottom: 12 },
    totpInput: { textAlign: 'center', fontSize: 24, letterSpacing: 8 },
    cancelLink: { color: c.brand, textAlign: 'center', fontSize: 13, marginTop: 4 },
  });
