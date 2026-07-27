import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TIERS = [{ n: '🥈 فضية', d: 'من ٠ نقطة', c: '#9ca3af' }, { n: '🥇 ذهبية', d: 'من ٥٠٠ نقطة', c: '#f59e0b' }, { n: '💎 بلاتينية', d: 'من ٢٠٠٠ نقطة', c: '#7c3aed' }];

export default function RewardsScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: '#fff' }}>
      <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}><Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center' }}>🏆 المكافآت</Text></View>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>{TIERS.map(t => <View key={t.n} style={{ flex: 1, padding: 12, borderRadius: 12, backgroundColor: t.c + '20', alignItems: 'center' }}><Text style={{ fontSize: 20 }}>{t.n.split(' ')[0]}</Text><Text style={{ fontWeight: 'bold', fontSize: 12 }}>{t.n.split(' ')[1]}</Text><Text style={{ fontSize: 10, color: '#6b7280' }}>{t.d}</Text></View>)}</View>
        <Text style={{ color: '#9ca3af', textAlign: 'center', marginTop: 20 }}>المكافآت المتاحة قريباً ✨</Text>
      </ScrollView>
    </View>
  );
}
