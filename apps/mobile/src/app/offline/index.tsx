import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function OfflineScreen(): JSX.Element {
  return (
    <View style={styles.c}>
      <View style={styles.card}>
        <Text style={styles.emoji}>📡</Text>
        <Text style={styles.title}>أنت غير متصل</Text>
        <Text style={styles.desc}>يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى</Text>
        <TouchableOpacity onPress={() => {}} style={styles.btn}>
          <Text style={styles.btnText}>🔄 إعادة المحاولة</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#f9fafb', justifyContent: 'center', alignItems: 'center', padding: 30 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 30, alignItems: 'center', width: '100%', maxWidth: 400 },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 8 },
  desc: { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  btn: { backgroundColor: '#6366f1', borderRadius: 14, padding: 16, alignItems: 'center', width: '100%' },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
