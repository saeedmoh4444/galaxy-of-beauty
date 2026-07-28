import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
export default function MySubScreen(): JSX.Element { const insets = useSafeAreaInsets(); return <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}><Text style={{ fontSize: 48 }}>📦</Text><Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 16 }}>اشتراكي</Text></View>; }
