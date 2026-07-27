import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { trpc } from '../../../lib/api';

export default function GiftCardsScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<'my' | 'buy' | 'check'>('my');
  const [amount, setAmount] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [checkCode, setCheckCode] = useState('');
  const [redeemCode, setRedeemCode] = useState('');
  const [redeemAmount, setRedeemAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    const a = Number(amount);
    if (a < 50) { Alert.alert('تنبيه', 'الحد الأدنى ٥٠ ر.س'); return; }
    setLoading(true);
    try {
      await trpc.giftCards.purchase.mutate({
        amount: a,
        recipientEmail: recipientEmail || undefined,
        recipientName: recipientName || undefined,
        message: giftMessage || undefined,
      });
      Alert.alert('تم', 'تم شراء بطاقة الهدية بنجاح! 🎁');
      setAmount(''); setRecipientEmail(''); setRecipientName(''); setGiftMessage('');
      setTab('my');
    } catch (e: any) { Alert.alert('خطأ', e?.message || 'فشل الشراء'); }
    setLoading(false);
  };

  const handleCheckBalance = async () => {
    if (!checkCode) { Alert.alert('تنبيه', 'الرجاء إدخال كود البطاقة'); return; }
    try {
      const result = await trpc.giftCards.checkBalance.query({ code: checkCode });
      Alert.alert(
        'رصيد البطاقة',
        `الرصيد المتبقي: ${result.balance} ر.س\nالقيمة الأصلية: ${result.originalAmount} ر.س${result.recipientName ? `\nلـ: ${result.recipientName}` : ''}`,
      );
    } catch (e: any) { Alert.alert('خطأ', e?.message || 'البطاقة غير صالحة'); }
  };

  const handleRedeem = async () => {
    const a = Number(redeemAmount);
    if (!redeemCode || !a) { Alert.alert('تنبيه', 'الرجاء إدخال الكود والمبلغ'); return; }
    setLoading(true);
    try {
      const result = await trpc.giftCards.redeem.mutate({ code: redeemCode, amount: a });
      Alert.alert('تم', `تم استرداد ${result.redeemed} ر.س. الرصيد المتبقي: ${result.remainingBalance} ر.س`);
      setRedeemCode(''); setRedeemAmount('');
    } catch (e: any) { Alert.alert('خطأ', e?.message || 'فشل الاسترداد'); }
    setLoading(false);
  };

  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: '#fff' }}>
      <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center' }}>🎁 بطاقات الهدية</Text>
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>
        {[{ key: 'my', label: 'بطاقاتي' }, { key: 'buy', label: 'شراء' }, { key: 'check', label: 'تحقق' }].map((t: { key: string; label: string }) => (
          <TouchableOpacity key={t.key} onPress={() => setTab(t.key as typeof tab)} style={{ flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: tab === t.key ? '#7c3aed' : 'transparent' }}>
            <Text style={{ fontWeight: tab === t.key ? 'bold' : 'normal', color: tab === t.key ? '#7c3aed' : '#6b7280' }}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={{ flex: 1, padding: 16 }}>
        {tab === 'buy' && (
          <View style={{ gap: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: '600' }}>شراء بطاقة هدية</Text>
            <TextInput placeholder="المبلغ (ر.س)" keyboardType="numeric" value={amount} onChangeText={setAmount} style={inputStyle} />
            <TextInput placeholder="البريد الإلكتروني للمستلم (اختياري)" value={recipientEmail} onChangeText={setRecipientEmail} style={inputStyle} />
            <TextInput placeholder="اسم المستلم (اختياري)" value={recipientName} onChangeText={setRecipientName} style={inputStyle} />
            <TextInput placeholder="رسالة إهداء (اختياري)" value={giftMessage} onChangeText={setGiftMessage} multiline style={[inputStyle, { minHeight: 80 }]} />
            <TouchableOpacity onPress={handleBuy} disabled={loading} style={{ backgroundColor: '#7c3aed', padding: 14, borderRadius: 12, alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>{loading ? 'جاري...' : '🎁 شراء بطاقة هدية'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {tab === 'check' && (
          <View style={{ gap: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: '600' }}>التحقق من الرصيد</Text>
            <TextInput placeholder="GIFT-XXXX-XXXX" value={checkCode} onChangeText={(t) => setCheckCode(t.toUpperCase())} style={inputStyle} autoCapitalize="characters" />
            <TouchableOpacity onPress={handleCheckBalance} style={{ backgroundColor: '#7c3aed', padding: 14, borderRadius: 12, alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>تحقق</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Redeem — always visible */}
        <View style={{ marginTop: 24, gap: 12, padding: 16, backgroundColor: '#f9fafb', borderRadius: 12 }}>
          <Text style={{ fontSize: 14, fontWeight: '600' }}>استرداد بطاقة هدية</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput placeholder="GIFT-XXXX-XXXX" value={redeemCode} onChangeText={(t) => setRedeemCode(t.toUpperCase())} style={[inputStyle, { flex: 1 }]} autoCapitalize="characters" />
            <TextInput placeholder="المبلغ" keyboardType="numeric" value={redeemAmount} onChangeText={setRedeemAmount} style={[inputStyle, { width: 90 }]} />
            <TouchableOpacity onPress={handleRedeem} disabled={loading} style={{ backgroundColor: '#10b981', paddingHorizontal: 16, borderRadius: 12, justifyContent: 'center' }}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>استرداد</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const inputStyle = {
  borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 12,
  fontSize: 15, textAlign: 'right' as const, backgroundColor: '#f9fafb',
};

