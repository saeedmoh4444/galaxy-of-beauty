import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
export default function BundlesScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  return <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}><Text style={{ fontSize: 48 }}>📦</Text><Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 16 }}>اصنعي باقتكِ</Text><Text style={{ color: '#6b7280', marginTop: 8 }}>اختاري خدماتكِ واحصلي على خصم</Text></View>;
}
