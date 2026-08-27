import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { useLocale } from '@/components/LocaleProvider';
import { themeColors, useTheme } from '@/components/ThemeProvider';

interface ErrorAlertProps {
  message?: string;
  onRetry?: () => void;
}

// Light-mode values (danger #dc2626, tint #fef2f2/#fecaca) match today's
// hardcoded colors exactly; dark mode swaps the tint for surface/border.
function createStyles(isDark: boolean) {
  const C = isDark ? themeColors.dark : themeColors.light;
  return StyleSheet.create({
    c: { alignItems: 'center', justifyContent: 'center', padding: 30, marginTop: 20 },
    emoji: { fontSize: 48, marginBottom: 12 },
    message: {
      fontSize: 15,
      color: C.danger,
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: 16,
    },
    btn: {
      backgroundColor: isDark ? C.surface : '#fef2f2',
      borderRadius: 12,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: isDark ? C.border : '#fecaca',
    },
    btnText: { fontSize: 14, fontWeight: '600', color: C.danger },
  });
}

export function ErrorAlert({ message, onRetry }: ErrorAlertProps): JSX.Element {
  const { t } = useLocale();
  const { isDark } = useTheme();
  const styles = useMemo(() => createStyles(isDark), [isDark]);
  return (
    <View style={styles.c}>
      <Text style={styles.emoji}></Text>
      <Text style={styles.message}>{message ?? t('common.loadFailed')}</Text>
      {onRetry && (
        <TouchableOpacity onPress={onRetry} style={styles.btn}>
          <Text style={styles.btnText}>{t('mobile.core.retryButton')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
