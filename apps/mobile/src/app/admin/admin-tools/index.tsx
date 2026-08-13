import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';
import { typedTrpc } from '@/lib/trpc-react';

interface FeatureFlag {
  key?: string;
  description?: string;
  enabled?: boolean;
}

export default function AdminToolsScreen(): JSX.Element {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  useEffect(() => {
    typedTrpc().featureFlags?.list
      ?.query()
      .then((d: FeatureFlag[]) => setFlags(d ?? []))
      .catch(() => {});
  }, []);
  return (
    <ScrollView style={s.c} contentContainerStyle={s.i}>
      <Text style={s.h}>️ أدوات المشرف</Text>
      <Text style={s.sub}>إدارة إعدادات المنصة والميزات</Text>
      <View style={s.card}>
        <Text style={s.ct}> إدارة الميزات</Text>
        {flags.map((f) => (
          <View key={f.key} style={s.row}>
            <View>
              <Text style={s.rn}>{f.key}</Text>
              <Text style={s.rd}>{f.description ?? ''}</Text>
            </View>
            <Text
              style={[
                s.b,
                {
                  backgroundColor: f.enabled ? '#d1fae5' : '#f3f4f6',
                  color: f.enabled ? '#059669' : '#6b7280',
                },
              ]}
            >
              {f.enabled ? 'مفعل' : 'معطل'}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
const sc = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#f9fafb' },
  i: { padding: 16, paddingTop: 40, paddingBottom: 60 },
  h: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center' },
  sub: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  ct: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  rn: { fontSize: 14, fontWeight: '600', color: '#111827', fontFamily: 'monospace' },
  rd: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  b: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    fontSize: 12,
    fontWeight: '700',
  },
});
const s = sc;
