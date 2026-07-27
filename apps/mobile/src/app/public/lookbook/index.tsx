import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SEASONS = [{ id: 'summer', n: '☀️ صيف', c: '#f59e0b' }, { id: 'eid', n: '🌙 عيد', c: '#10b981' }, { id: 'wedding', n: '👰 زفاف', c: '#ec4899' }];

export default function LookbookScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  const [season, setSeason] = useState('summer');
  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: '#fff' }}>
      <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}><Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center' }}>📸 لوك بوك</Text></View>
      <ScrollView horizontal style={{ padding: 16 }} showsHorizontalScrollIndicator={false}>
        {SEASONS.map(s => <TouchableOpacity key={s.id} onPress={() => setSeason(s.id)} style={{ paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginRight: 8, backgroundColor: season === s.id ? s.c : '#f3f4f6' }}><Text style={{ color: season === s.id ? '#fff' : '#6b7280', fontWeight: 'bold' }}>{s.n}</Text></TouchableOpacity>)}
      </ScrollView>
      <ScrollView style={{ flex: 1, padding: 16 }}><Text style={{ color: '#9ca3af', textAlign: 'center', marginTop: 40 }}>إطلالات {SEASONS.find(s => s.id === season)?.n} قريباً ✨</Text></ScrollView>
    </View>
  );
}
