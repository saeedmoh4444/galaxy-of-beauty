import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';

export default function BlogPostScreen(): JSX.Element {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: '#fff', padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', textAlign: 'right' }}>{String(slug).replace(/-/g, ' ')}</Text>
      <Text style={{ color: '#6b7280', marginTop: 16, textAlign: 'right', lineHeight: 24 }}>محتويات المقال قادمة قريباً...</Text>
    </View>
  );
}
