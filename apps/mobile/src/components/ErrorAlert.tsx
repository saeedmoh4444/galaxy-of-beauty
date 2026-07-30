import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ErrorAlertProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorAlert({ message = 'فشل التحميل', onRetry }: ErrorAlertProps): JSX.Element {
  return (
    <View style={styles.c}>
      <Text style={styles.emoji}>⚠️</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity onPress={onRetry} style={styles.btn}>
          <Text style={styles.btnText}>🔄 إعادة المحاولة</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  c: { alignItems: 'center', justifyContent: 'center', padding: 30, marginTop: 20 },
  emoji: { fontSize: 48, marginBottom: 12 },
  message: { fontSize: 15, color: '#dc2626', fontWeight: '600', textAlign: 'center', marginBottom: 16 },
  btn: { backgroundColor: '#fef2f2', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12, borderWidth: 1, borderColor: '#fecaca' },
  btnText: { fontSize: 14, fontWeight: '600', color: '#dc2626' },
});
