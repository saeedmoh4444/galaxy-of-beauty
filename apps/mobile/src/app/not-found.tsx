import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function NotFoundScreen(): JSX.Element {
  const router = useRouter();
  return (
    <View style={styles.c}>
      <Text style={styles.emoji}>🔍</Text>
      <Text style={styles.code}>٤٠٤</Text>
      <Text style={styles.t}>عذراً، الصفحة التي تبحثين عنها غير موجودة</Text>
      <Text style={styles.sub}>ربما تم نقلها أو حذفها</Text>
      <View style={styles.btns}>
        <TouchableOpacity onPress={() => router.replace('/')} style={styles.homeBtn}>
          <Text style={styles.homeBt}>🏠 الرئيسية</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBt}>↩️ رجوع</Text>
        </TouchableOpacity>
      </View>
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
  emoji: { fontSize: 64, marginBottom: 12 },
  code: { fontSize: 48, fontWeight: '900', color: '#6366f1', marginBottom: 8 },
  t: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 4 },
  sub: { fontSize: 14, color: '#9ca3af', marginBottom: 24 },
  btns: { flexDirection: 'row', gap: 12 },
  homeBtn: {
    backgroundColor: '#6366f1',
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  homeBt: { color: '#fff', fontSize: 14, fontWeight: '700' },
  backBtn: {
    backgroundColor: '#f3f4f6',
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  backBt: { color: '#6b7280', fontSize: 14, fontWeight: '600' },
});
