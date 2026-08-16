import { View, Text, Image, ActivityIndicator, StyleSheet } from 'react-native';

// eslint-disable-next-line @typescript-eslint/no-require-imports -- Expo static asset imports must use require() (Metro bundler)
const LOGO_SOURCE = require('../../assets/logo.png');

/**
 * Branded loading indicator for mobile screens — logo + spinner + text.
 * Mirror of the web LogoLoader for parity between platforms.
 */
interface LogoLoaderProps {
  label?: string;
}

export function LogoLoader({ label = 'جاري التحميل...' }: LogoLoaderProps) {
  return (
    <View style={styles.container} accessibilityRole="progressbar" accessibilityLabel={label}>
      <Image source={LOGO_SOURCE} style={styles.logo} accessibilityIgnoresInvertColors />
      <ActivityIndicator color="#7c3aed" size="large" style={styles.spinner} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    gap: 16,
  },
  logo: { width: 64, height: 64, borderRadius: 16 },
  spinner: { marginTop: 4 },
  label: { fontSize: 14, fontWeight: '500', color: '#6b7280' },
});
