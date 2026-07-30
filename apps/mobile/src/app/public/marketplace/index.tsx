import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MarketplaceScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}><Text style={styles.title}>🛍️ المتجر</Text></View>
      <ScrollView contentContainerStyle={styles.grid}>
        <View style={styles.card}><View style={styles.cardImage}><Text style={styles.cardEmoji}>🧴</Text></View><Text style={styles.cardTitle}>منتجات العناية</Text><Text style={styles.price}>تصفحي المنتجات</Text></View>
        <View style={styles.card}><View style={styles.cardImage}><Text style={styles.cardEmoji}>💄</Text></View><Text style={styles.cardTitle}>مستحضرات تجميل</Text><Text style={styles.price}>أفضل الماركات</Text></View>
        <View style={styles.card}><View style={styles.cardImage}><Text style={styles.cardEmoji}>💇‍♀️</Text></View><Text style={styles.cardTitle}>منتجات الشعر</Text><Text style={styles.price}>عناية متكاملة</Text></View>
        <View style={styles.card}><View style={styles.cardImage}><Text style={styles.cardEmoji}>💅</Text></View><Text style={styles.cardTitle}>منتجات الأظافر</Text><Text style={styles.price}>ألوان رائعة</Text></View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, paddingBottom: 40 },
  card: { width: '48%', backgroundColor: '#f9fafb', borderRadius: 14, padding: 10, margin: '1%', marginBottom: 10 },
  cardImage: { height: 120, borderRadius: 10, backgroundColor: '#fce7f3', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  cardEmoji: { fontSize: 36 },
  cardTitle: { fontSize: 13, fontWeight: '700', color: '#111827', textAlign: 'right' },
  price: { fontSize: 12, color: '#ec4899', textAlign: 'right', marginTop: 4 },
});
