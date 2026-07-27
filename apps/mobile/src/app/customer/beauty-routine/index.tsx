import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ROUTINES: Record<string, { morning: string[]; evening: string[]; weekly: string[] }> = {
  oily: { morning: ['غسول منقي', 'تونر', 'مرطب خفيف', 'واقي شمس'], evening: ['مزيل مكياج', 'غسول', 'تونر', 'سيروم', 'مرطب ليلي'], weekly: ['ماسك طين', 'تقشير'] },
  dry: { morning: ['غسول كريمي', 'تونر مرطب', 'سيروم', 'مرطب غني', 'واقي شمس'], evening: ['زيت تنظيف', 'غسول', 'تونر', 'سيروم', 'مرطب ليلي'], weekly: ['ماسك ترطيب', 'زيت مغذ'] },
  combination: { morning: ['غسول متوازن', 'تونر', 'مرطب', 'واقي شمس'], evening: ['مزيل', 'غسول', 'سيروم', 'مرطب'], weekly: ['ماسك', 'تقشير لطيف'] },
  sensitive: { morning: ['غسول لطيف', 'تونر مهدئ', 'مرطب', 'واقي شمس'], evening: ['مزيل لطيف', 'غسول', 'سيروم مهدئ', 'مرطب'], weekly: ['ماسك مهدئ'] },
  normal: { morning: ['غسول', 'تونر', 'مرطب', 'واقي شمس'], evening: ['مزيل', 'غسول', 'سيروم', 'مرطب'], weekly: ['تقشير', 'ماسك'] },
};

export default function BeautyRoutineScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  const r = ROUTINES['normal']!;
  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: '#fff' }}>
      <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}><Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center' }}>🌅 روتيني</Text></View>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <View style={{ marginBottom: 20 }}><Text style={{ fontSize: 16, fontWeight: 'bold', color: '#d97706', marginBottom: 8 }}>☀️ الصباح</Text>{r.morning.map((s, i) => <Text key={i} style={{ paddingVertical: 4, color: '#4b5563' }}>• {s}</Text>)}</View>
        <View style={{ marginBottom: 20 }}><Text style={{ fontSize: 16, fontWeight: 'bold', color: '#4f46e5', marginBottom: 8 }}>🌙 المساء</Text>{r.evening.map((s, i) => <Text key={i} style={{ paddingVertical: 4, color: '#4b5563' }}>• {s}</Text>)}</View>
        <View style={{ marginBottom: 20 }}><Text style={{ fontSize: 16, fontWeight: 'bold', color: '#7c3aed', marginBottom: 8 }}>📅 أسبوعي</Text>{r.weekly.map((s, i) => <Text key={i} style={{ paddingVertical: 4, color: '#4b5563' }}>• {s}</Text>)}</View>
      </ScrollView>
    </View>
  );
}
