import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocale } from '@/components/LocaleProvider';

interface ErrorAlertProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorAlert({ message, onRetry }: ErrorAlertProps): JSX.Element {
  const { t } = useLocale();
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

const styles = StyleSheet.create({
  c: { alignItems: 'center', justifyContent: 'center', padding: 30, marginTop: 20 },
  emoji: { fontSize: 48, marginBottom: 12 },
  message: {
    fontSize: 15,
    color: '#dc2626',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  btn: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  btnText: { fontSize: 14, fontWeight: '600', color: '#dc2626' },
});
