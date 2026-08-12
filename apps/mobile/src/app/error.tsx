import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { ErrorBoundaryProps } from 'expo-router';

export default function RootError({ error, retry }: ErrorBoundaryProps): JSX.Element {
  return (
    <View style={styles.c}>
      <Text style={styles.emoji}></Text>
      <Text style={styles.t}>حدث خطأ غير متوقع</Text>
      <Text style={styles.desc}>
        {error.message || 'يرجى المحاولة مرة أخرى. إذا استمرت المشكلة، تواصلي مع فريق الدعم.'}
      </Text>
      <TouchableOpacity onPress={retry} style={styles.btn}>
        <Text style={styles.bt}> إعادة المحاولة</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  c: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emoji: { fontSize: 64, marginBottom: 16 },
  t: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 8 },
  desc: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    maxWidth: 300,
  },
  btn: { backgroundColor: '#6366f1', borderRadius: 14, paddingHorizontal: 24, paddingVertical: 14 },
  bt: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
