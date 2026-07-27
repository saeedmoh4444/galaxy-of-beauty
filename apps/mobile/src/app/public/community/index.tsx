import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
export default function CommunityScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  const [content, setContent] = useState('');

  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: '#fff' }}>
      <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}><Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center' }}>💬 مجتمع الجمال</Text></View>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          <TextInput placeholder="شاركي تجربتكِ..." value={content} onChangeText={setContent} multiline style={{ flex: 1, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 12, textAlign: 'right' }} />
          <TouchableOpacity onPress={() => { if (content.trim()) { Alert.alert('تم', 'تم النشر'); setContent(''); } }} style={{ backgroundColor: '#7c3aed', paddingHorizontal: 16, borderRadius: 10, justifyContent: 'center' }}><Text style={{ color: '#fff' }}>نشر</Text></TouchableOpacity>
        </View>
        <Text style={{ color: '#9ca3af', textAlign: 'center', marginTop: 40 }}>لا توجد منشورات بعد. كوني الأولى! ✨</Text>
      </ScrollView>
    </View>
  );
}
