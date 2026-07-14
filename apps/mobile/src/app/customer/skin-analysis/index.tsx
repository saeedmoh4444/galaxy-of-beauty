import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';

export default function SkinAnalysisScreen() {
  const [imageUrl, setImageUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [history, setHistory] = useState<Record<string, unknown>[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const data = (await trpc.skinAnalysis.history.query({ page: 1, limit: 10 })) as Record<string, unknown>;
      setHistory((data.items as Record<string, unknown>[]) || []);
    } catch {
      // keep stale
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleAnalyze = async () => {
    if (!imageUrl) {
      Alert.alert('خطأ', 'الرجاء إدخال رابط الصورة');
      return;
    }
    setAnalyzing(true);
    setResult(null);
    try {
      const data = (await trpc.skinAnalysis.analyze.mutate({ imageUrl })) as Record<string, unknown>;
      const resultJson = (data.resultJson as Record<string, unknown>) || null;
      setResult(resultJson);
      fetchHistory();
    } catch {
      Alert.alert('خطأ', 'فشل تحليل الصورة. حاولي مجدداً.');
    } finally {
      setAnalyzing(false);
    }
  };

  const skinTypeLabels: Record<string, string> = {
    dry: 'جافة',
    oily: 'دهنية',
    combination: 'مختلطة',
    normal: 'عادية',
    sensitive: 'حساسة',
    unknown: 'غير محدد',
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentInner}>
      <Text style={styles.title}>تحليل البشرة بالذكاء الاصطناعي</Text>

      {/* Upload / URL input card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>حملي صورة لبشرتك</Text>

        <View style={styles.uploadZone}>
          <Text style={styles.uploadEmoji}>📸</Text>
          <Text style={styles.uploadHint}>أدخلي رابط الصورة أدناه</Text>
        </View>

        <TextInput
          style={styles.urlInput}
          placeholder="https://..."
          value={imageUrl}
          onChangeText={setImageUrl}
          autoCapitalize="none"
          keyboardType="url"
          placeholderTextColor="#9ca3af"
        />

        <TouchableOpacity
          style={[styles.analyzeBtn, (!imageUrl || analyzing) && styles.analyzeBtnDisabled]}
          onPress={handleAnalyze}
          disabled={!imageUrl || analyzing}
          activeOpacity={0.8}
        >
          {analyzing ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.analyzeBtnText}>تحليل</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Results card */}
      {result && (
        <View style={[styles.card, styles.resultCard]}>
          <Text style={styles.resultTitle}>نتائج التحليل</Text>

          <View style={styles.resultGrid}>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>نوع البشرة</Text>
              <Text style={styles.resultValue}>
                {skinTypeLabels[(result.skinType as string) || 'unknown'] || (result.skinType as string) || 'غير محدد'}
              </Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>المشاكل</Text>
              <Text style={styles.resultValue}>
                {(result.concerns as string[])?.length ? (result.concerns as string[]).join('، ') : '-'}
              </Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>مستوى الترطيب</Text>
              <Text style={styles.resultValue}>{result.hydrationLevel as string || '-'}</Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>مستوى الحساسية</Text>
              <Text style={styles.resultValue}>{result.sensitivityLevel as string || '-'}</Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>العمر التقديري</Text>
              <Text style={styles.resultValue}>{result.ageEstimate as string || '-'}</Text>
            </View>
          </View>

          {result.recommendations ? (
            <View style={styles.recos}>
              <Text style={styles.recosTitle}>التوصيات</Text>
              <Text style={styles.recosText}>
                {typeof result.recommendations === 'string'
                  ? result.recommendations
                  : JSON.stringify(result.recommendations, null, 2)}
              </Text>
            </View>
          ) : null}
        </View>
      )}

      {/* History */}
      <Text style={styles.sectionTitle}>التحليلات السابقة</Text>

      {loadingHistory ? (
        <ActivityIndicator color="#7c3aed" style={{ marginTop: 20 }} />
      ) : history.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🔬</Text>
          <Text style={styles.emptyTitle}>لا توجد تحليلات سابقة</Text>
          <Text style={styles.emptySub}>حملي أول صورة لتحليل بشرتك</Text>
        </View>
      ) : (
        history.map((a) => (
          <TouchableOpacity key={a.id as number} style={styles.historyCard} activeOpacity={0.7}>
            <View style={styles.histIcon}>
              <Text style={styles.histEmoji}>🔬</Text>
            </View>
            <View style={styles.histInfo}>
              <Text style={styles.histType}>
                {skinTypeLabels[((a.resultJson as Record<string, unknown>)?.skinType as string) || 'unknown'] || 'تحليل'}
              </Text>
              <Text style={styles.histDate}>
                {new Date(a.createdAt as string).toLocaleDateString('ar-SA', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })}
              </Text>
            </View>
            <Text style={styles.histArrow}>›</Text>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  contentInner: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827', textAlign: 'right', marginBottom: 20 },

  card: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#e5e7eb', padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827', textAlign: 'right', marginBottom: 14 },

  uploadZone: {
    borderWidth: 2, borderColor: '#e5e7eb', borderStyle: 'dashed',
    borderRadius: 12, padding: 28, alignItems: 'center', marginBottom: 14,
  },
  uploadEmoji: { fontSize: 40, marginBottom: 8 },
  uploadHint: { fontSize: 13, color: '#9ca3af' },

  urlInput: {
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10,
    padding: 12, fontSize: 14, textAlign: 'left', backgroundColor: '#f9fafb', marginBottom: 12,
  },

  analyzeBtn: {
    backgroundColor: '#7c3aed', borderRadius: 10, padding: 14,
    alignItems: 'center', justifyContent: 'center', minHeight: 48,
  },
  analyzeBtnDisabled: { backgroundColor: '#c4b5fd' },
  analyzeBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  resultCard: { borderColor: '#c4b5fd', backgroundColor: '#faf5ff' },
  resultTitle: { fontSize: 16, fontWeight: '700', color: '#7c3aed', textAlign: 'right', marginBottom: 12 },
  resultGrid: { gap: 10 },
  resultItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultLabel: { fontSize: 13, color: '#6b7280' },
  resultValue: { fontSize: 14, fontWeight: '600', color: '#111827', maxWidth: '60%', textAlign: 'right' },

  recos: { marginTop: 14, borderTopWidth: 1, borderTopColor: '#e9d5ff', paddingTop: 12 },
  recosTitle: { fontSize: 14, fontWeight: '700', color: '#7c3aed', textAlign: 'right', marginBottom: 6 },
  recosText: { fontSize: 12, color: '#4b5563', textAlign: 'right', lineHeight: 18 },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', textAlign: 'right', marginBottom: 12, marginTop: 8 },

  historyCard: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 8,
  },
  histIcon: {
    width: 44, height: 44, borderRadius: 10, backgroundColor: '#f9fafb',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  histEmoji: { fontSize: 20 },
  histInfo: { flex: 1 },
  histType: { fontSize: 14, fontWeight: '600', color: '#111827', textAlign: 'right' },
  histDate: { fontSize: 12, color: '#9ca3af', marginTop: 2, textAlign: 'right' },
  histArrow: { fontSize: 20, color: '#d1d5db', marginLeft: 4 },

  empty: { alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#6b7280' },
  emptySub: { fontSize: 13, color: '#9ca3af', marginTop: 4, textAlign: 'center' },
});
