import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
export default function ServiceHistoryScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: '#fff' }}>
      <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}><Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center' }}>📋 سجل الخدمات</Text></View>
      <ScrollView style={{ flex: 1, padding: 16 }}><Text style={{ color: '#9ca3af', textAlign: 'center', marginTop: 40 }}>سجل حجوزاتكِ السابقة يظهر هنا</Text></ScrollView>
    </View>
  );
}
