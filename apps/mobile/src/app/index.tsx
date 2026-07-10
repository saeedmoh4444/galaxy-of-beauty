import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Galaxy of Beauty</Text>
      <Text style={styles.subtitle}>جالكسي بيوتي</Text>
      <Text style={styles.info}>Monorepo scaffold — Phase 1. Features coming in Phase 5.</Text>
      <View style={styles.links}>
        <Link href="/login" style={styles.button}>Login</Link>
        <Link href="/register" style={styles.buttonOutline}>Register</Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: '#fff' },
  title: { fontSize: 32, fontWeight: '800', color: '#7c3aed', marginBottom: 4 },
  subtitle: { fontSize: 18, color: '#6b7280', marginBottom: 16 },
  info: { fontSize: 14, color: '#9ca3af', marginBottom: 32 },
  links: { flexDirection: 'row', gap: 16 },
  button: { paddingHorizontal: 24, paddingVertical: 10, backgroundColor: '#7c3aed', color: '#fff', borderRadius: 8, fontWeight: '600', overflow: 'hidden' },
  buttonOutline: { paddingHorizontal: 24, paddingVertical: 10, borderWidth: 1, borderColor: '#d1d5db', color: '#374151', borderRadius: 8, fontWeight: '600' },
});
