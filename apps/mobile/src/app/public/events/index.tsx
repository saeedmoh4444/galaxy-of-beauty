import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EventsScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: '#fff' }}>
      <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}><Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center' }}>📅 الفعاليات</Text></View>
      <ScrollView style={{ flex: 1, padding: 16 }}><Text style={{ color: '#9ca3af', textAlign: 'center', marginTop: 40 }}>ورش وماستر كلاس قريباً ✨</Text></ScrollView>
    </View>
  );
}
