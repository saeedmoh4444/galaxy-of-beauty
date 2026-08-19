import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { trpc } from '@/lib/trpc-react';
import { useCamera } from '@/hooks/useCamera';
import { useState } from 'react';
import { DEFAULT_PAGE_SIZE } from '@galaxy/ui';
import { useToast } from '@/components/Toast';
import { useLocale } from '@/components/LocaleProvider';

export default function SkinAnalysisScreen() {
  const { t, locale } = useLocale();
  const [imageUrl, setImageUrl] = useState('');
  const { showToast } = useToast();
  const [showCamera, setShowCamera] = useState(false);
  const { hasPermission, requestPermission, takePhoto } = useCamera();

  const historyQ = trpc.skinAnalysis.history.useQuery({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
  });
  const history: Record<string, unknown>[] =
    ((historyQ.data as Record<string, unknown> | null)?.items as Record<string, unknown>[]) ?? [];

  const analyzeMut = trpc.skinAnalysis.analyze.useMutation({
    onSuccess: () => {
      void historyQ.refetch();
    },
    onError: () => {
      showToast('error', t('mobile.skinAnalysis.analyze-error'));
    },
  });
  // Clear the previous result while a new analysis is in flight (previous behavior)
  const result = analyzeMut.isPending
    ? null
    : ((analyzeMut.data as Record<string, unknown> | undefined)?.resultJson as Record<
        string,
        unknown
      >) || null;

  const handleCameraCapture = async () => {
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) return;
    }
    setShowCamera(true);
    const photo = await takePhoto();
    setShowCamera(false);
    if (photo?.uri) {
      setImageUrl(photo.uri);
      showToast('success', t('mobile.skinAnalysis.capture-success'));
    }
  };

  const handleAnalyze = () => {
    if (!imageUrl) {
      showToast('error', t('mobile.skinAnalysis.url-required'));
      return;
    }
    analyzeMut.mutate({ imageUrl });
  };

  const skinTypeLabel = (type: string): string => {
    switch (type) {
      case 'dry':
        return t('mobile.skinAnalysis.type-dry');
      case 'oily':
        return t('mobile.skinAnalysis.type-oily');
      case 'combination':
        return t('mobile.skinAnalysis.type-combination');
      case 'normal':
        return t('mobile.skinAnalysis.type-normal');
      case 'sensitive':
        return t('mobile.skinAnalysis.type-sensitive');
      default:
        return t('mobile.skinAnalysis.type-unknown');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentInner}>
      <Text style={styles.title}>{t('mobile.skinAnalysis.title')}</Text>

      {/* Upload / URL input card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('mobile.skinAnalysis.upload-title')}</Text>

        <View style={styles.uploadZone}>
          <Text style={styles.uploadEmoji}></Text>
          <Text style={styles.uploadHint}>{t('mobile.skinAnalysis.upload-hint')}</Text>
          <TouchableOpacity
            style={styles.cameraBtn}
            onPress={handleCameraCapture}
            activeOpacity={0.8}
          >
            <Text style={styles.cameraBtnText}>
              {showCamera ? t('mobile.skinAnalysis.capturing') : t('mobile.skinAnalysis.capture')}
            </Text>
          </TouchableOpacity>
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
          style={[
            styles.analyzeBtn,
            (!imageUrl || analyzeMut.isPending) && styles.analyzeBtnDisabled,
          ]}
          onPress={handleAnalyze}
          disabled={!imageUrl || analyzeMut.isPending}
          activeOpacity={0.8}
        >
          {analyzeMut.isPending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.analyzeBtnText}>{t('mobile.skinAnalysis.analyze')}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Results card */}
      {result && (
        <View style={[styles.card, styles.resultCard]}>
          <Text style={styles.resultTitle}>{t('mobile.skinAnalysis.results')}</Text>

          <View style={styles.resultGrid}>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>{t('mobile.skinAnalysis.skin-type')}</Text>
              <Text style={styles.resultValue}>
                {skinTypeLabel((result.skinType as string) || 'unknown')}
              </Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>{t('mobile.skinAnalysis.concerns')}</Text>
              <Text style={styles.resultValue}>
                {(result.concerns as string[])?.length
                  ? (result.concerns as string[]).join('، ')
                  : '-'}
              </Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>{t('mobile.skinAnalysis.hydration')}</Text>
              <Text style={styles.resultValue}>{(result.hydrationLevel as string) || '-'}</Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>{t('mobile.skinAnalysis.sensitivity')}</Text>
              <Text style={styles.resultValue}>{(result.sensitivityLevel as string) || '-'}</Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>{t('mobile.skinAnalysis.age-estimate')}</Text>
              <Text style={styles.resultValue}>{(result.ageEstimate as string) || '-'}</Text>
            </View>
          </View>

          {result.recommendations ? (
            <View style={styles.recos}>
              <Text style={styles.recosTitle}>{t('mobile.skinAnalysis.recommendations')}</Text>
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
      <Text style={styles.sectionTitle}>{t('mobile.skinAnalysis.history')}</Text>

      {historyQ.isLoading ? (
        <ActivityIndicator color="#7c3aed" style={{ marginTop: 20 }} />
      ) : history.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}></Text>
          <Text style={styles.emptyTitle}>{t('mobile.skinAnalysis.empty-title')}</Text>
          <Text style={styles.emptySub}>{t('mobile.skinAnalysis.empty-desc')}</Text>
        </View>
      ) : (
        history.map((a) => (
          <TouchableOpacity key={a.id as number} style={styles.historyCard} activeOpacity={0.7}>
            <View style={styles.histIcon}>
              <Text style={styles.histEmoji}></Text>
            </View>
            <View style={styles.histInfo}>
              <Text style={styles.histType}>
                {skinTypeLabel(
                  ((a.resultJson as Record<string, unknown>)?.skinType as string) || 'unknown',
                )}
              </Text>
              <Text style={styles.histDate}>
                {new Date(a.createdAt as string).toLocaleDateString(
                  locale === 'ar' ? 'ar-SA' : 'en-GB',
                  {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  },
                )}
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
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'right',
    marginBottom: 20,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'right',
    marginBottom: 14,
  },

  uploadZone: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 28,
    alignItems: 'center',
    marginBottom: 14,
  },
  uploadEmoji: { fontSize: 40, marginBottom: 8 },
  uploadHint: { fontSize: 13, color: '#9ca3af', marginBottom: 12 },
  cameraBtn: {
    backgroundColor: '#ec4899',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  cameraBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  urlInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    textAlign: 'left',
    backgroundColor: '#f9fafb',
    marginBottom: 12,
  },

  analyzeBtn: {
    backgroundColor: '#7c3aed',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  analyzeBtnDisabled: { backgroundColor: '#c4b5fd' },
  analyzeBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  resultCard: { borderColor: '#c4b5fd', backgroundColor: '#faf5ff' },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7c3aed',
    textAlign: 'right',
    marginBottom: 12,
  },
  resultGrid: { gap: 10 },
  resultItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultLabel: { fontSize: 13, color: '#6b7280' },
  resultValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    maxWidth: '60%',
    textAlign: 'right',
  },

  recos: { marginTop: 14, borderTopWidth: 1, borderTopColor: '#e9d5ff', paddingTop: 12 },
  recosTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7c3aed',
    textAlign: 'right',
    marginBottom: 6,
  },
  recosText: { fontSize: 12, color: '#4b5563', textAlign: 'right', lineHeight: 18 },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'right',
    marginBottom: 12,
    marginTop: 8,
  },

  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 8,
  },
  histIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
