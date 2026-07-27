import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { trpc } from '../../../lib/api';

export default function SavingsGoalsScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [addAmount, setAddAmount] = useState<Record<number, string>>({});
  const [goals] = useState<any[]>([]);

  const handleCreate = async () => {
    if (!title || !target) { Alert.alert('تنبيه', 'الرجاء إدخال البيانات'); return; }
    try { await trpc.savingsGoals.create.mutate({ title, targetAmount: Number(target) }); setTitle(''); setTarget(''); Alert.alert('تم', 'تم إنشاء الهدف'); } catch (e: any) { Alert.alert('خطأ', e.message); }
  };

  const handleAddFunds = async (goalId: number, amount: number) => {
    try { await trpc.savingsGoals.addFunds.mutate({ goalId, amount }); Alert.alert('تم', 'تمت الإضافة'); } catch (e: any) { Alert.alert('خطأ', e.message); }
  };

  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: '#fff' }}>
      <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}><Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center' }}>🎯 أهداف الادخار</Text></View>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <View style={{ gap: 12, marginBottom: 24, padding: 16, backgroundColor: '#f9fafb', borderRadius: 12 }}>
          <Text style={{ fontWeight: '600' }}>هدف جديد</Text>
          <TextInput placeholder="اسم الهدف" value={title} onChangeText={setTitle} style={input} />
          <TextInput placeholder="المبلغ (ر.س)" keyboardType="numeric" value={target} onChangeText={setTarget} style={input} />
          <TouchableOpacity onPress={handleCreate} style={{ backgroundColor: '#7c3aed', padding: 12, borderRadius: 10, alignItems: 'center' }}><Text style={{ color: '#fff', fontWeight: 'bold' }}>إنشاء</Text></TouchableOpacity>
        </View>
        {goals.map((g: any) => {
          const pct = g.targetAmount > 0 ? Math.min(100, (Number(g.savedAmount) / Number(g.targetAmount)) * 100) : 0;
          return (
            <View key={g.id} style={{ padding: 16, marginBottom: 12, backgroundColor: g.status === 'COMPLETED' ? '#f0fdf4' : '#fff', borderRadius: 12, borderWidth: 1, borderColor: g.status === 'COMPLETED' ? '#22c55e' : '#e5e7eb' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ fontWeight: 'bold' }}>{g.title}</Text><Text style={{ color: '#7c3aed', fontWeight: 'bold' }}>{pct.toFixed(0)}%</Text></View>
              <View style={{ height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, marginTop: 8 }}><View style={{ height: 8, backgroundColor: g.status === 'COMPLETED' ? '#22c55e' : '#7c3aed', borderRadius: 4, width: `${pct}%` }} /></View>
              <Text style={{ marginTop: 4, color: '#6b7280', fontSize: 12 }}>{Number(g.savedAmount)} / {Number(g.targetAmount)} ر.س</Text>
              {g.status === 'ACTIVE' && (
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                  <TextInput placeholder="المبلغ" keyboardType="numeric" value={addAmount[g.id] || ''} onChangeText={(v) => setAddAmount({ ...addAmount, [g.id]: v })} style={[input, { flex: 1 }]} />
                  <TouchableOpacity onPress={() => { const a = Number(addAmount[g.id] || 0); if (a > 0) handleAddFunds(g.id, a); }} style={{ backgroundColor: '#10b981', paddingHorizontal: 16, borderRadius: 10, justifyContent: 'center' }}><Text style={{ color: '#fff' }}>أضف</Text></TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const input = { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 12, fontSize: 15, textAlign: 'right' as const, backgroundColor: '#f9fafb' };
