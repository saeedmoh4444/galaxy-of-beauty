import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function IoTSyncScreen(): JSX.Element {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ((trpc as any).iotSync.devices.query() as any).then((d: any) => { setDevices(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const connect = (deviceKey: string) => {
    ((trpc as any).iotSync.connect.mutate({ deviceKey }) as any);
  };
  const sync = (deviceKey: string) => {
    ((trpc as any).iotSync.syncData.mutate({ deviceKey }) as any);
  };

  if (loading) return <ActivityIndicator color="#0891b2" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>📡 الأجهزة الذكية</Text>
      <Text style={styles.sub}>اربطي أجهزة العناية الذكية لمتابعة بشرتكِ</Text>
      {devices.length === 0 ? <Text style={styles.e}>لا توجد أجهزة</Text> :
        <View style={styles.grid}>
          {devices.map((d: any) => {
            const isConnected = d.status === 'connected';
            return (
              <View key={d.key} style={styles.card}>
                <Text style={styles.devEmoji}>{d.emoji as string}</Text>
                <Text style={styles.devName}>{d.nameAr as string}</Text>
                <Text style={[styles.devStatus, isConnected ? {color:'#059669'} : {color:'#9ca3af'}]}>{isConnected ? '🟢 متصل' : '⚫ غير متصل'}</Text>
                {(d.features as string[])?.slice(0, 2).map((f: string) => <Text key={f} style={styles.devFeature}>• {f}</Text>)}
                <TouchableOpacity onPress={() => isConnected ? sync(d.key as string) : connect(d.key as string)} style={[styles.devBtn, isConnected ? styles.syncBtn : styles.connectBtn]}>
                  <Text style={styles.devBtnText}>{isConnected ? 'مزامنة' : 'ربط'}</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfeff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#0891b2', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: { width: '47%', backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center' },
  devEmoji: { fontSize: 40 }, devName: { fontSize: 14, fontWeight: '700', color: '#111827', marginTop: 8 },
  devStatus: { fontSize: 11, marginTop: 4 },
  devFeature: { fontSize: 10, color: '#6b7280', marginTop: 2 },
  devBtn: { borderRadius: 10, paddingHorizontal: 20, paddingVertical: 8, marginTop: 10, width: '100%', alignItems: 'center' },
  connectBtn: { backgroundColor: '#0891b2' }, syncBtn: { backgroundColor: '#059669' },
  devBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
