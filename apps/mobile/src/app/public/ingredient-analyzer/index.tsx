import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

const COLORS = {
  brand: '#7c3aed',
  white: '#ffffff',
  gray400: '#6b7280',
  gray900: '#111827',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#dc2626',
};

interface IngredientResult {
  name?: string;
  description?: string;
  safety?: string;
}

interface AnalyzerQueryResult {
  data: IngredientResult | null;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

export default function IngredientAnalyzerScreen(): JSX.Element {
  const { t } = useLocale();
  const [search, setSearch] = useState('');
  const [submitted, setSubmitted] = useState('');
  const result = (trpc.ingredientAnalyzer.analyze.useQuery(
    { ingredients: submitted },
    { enabled: submitted.length > 0 },
  ) as unknown as AnalyzerQueryResult | null) ?? {
    data: null,
    isLoading: false,
    isError: false,
    refetch: () => {},
  };

  return (
    <ScreenState
      isLoading={submitted.length > 0 && result.isLoading}
      isError={result.isError}
      isEmpty={false}
      errorMessage={t('mobile.public.ingredient-analyzer.load-error')}
      onRetry={() => result.refetch()}
    >
      <Text style={styles.title}>{t('mobile.public.ingredient-analyzer.title')}</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder={t('mobile.public.ingredient-analyzer.placeholder')}
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity style={styles.analyzeBtn} onPress={() => setSubmitted(search)}>
          <Text style={styles.analyzeText}>{t('mobile.public.ingredient-analyzer.analyze')}</Text>
        </TouchableOpacity>
      </View>
      {result.data ? (
        <View
          style={[
            styles.resultCard,
            {
              borderLeftColor:
                result.data?.safety === 'safe'
                  ? COLORS.success
                  : result.data?.safety === 'warning'
                    ? COLORS.warning
                    : COLORS.danger,
            },
          ]}
        >
          <Text style={styles.ingredientName}>{result.data?.name ?? submitted}</Text>
          <Text style={styles.ingredientDesc}>{result.data?.description ?? ''}</Text>
        </View>
      ) : null}
    </ScreenState>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.brand,
    textAlign: 'center',
    marginBottom: 20,
  },
  inputRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    backgroundColor: COLORS.white,
  },
  analyzeBtn: {
    backgroundColor: COLORS.brand,
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  analyzeText: { fontSize: 14, fontWeight: '600', color: COLORS.white },
  resultCard: { backgroundColor: COLORS.white, borderRadius: 14, padding: 16, borderLeftWidth: 4 },
  ingredientName: { fontSize: 16, fontWeight: '700', color: COLORS.gray900 },
  ingredientDesc: { fontSize: 13, color: COLORS.gray400, marginTop: 4 },
});
