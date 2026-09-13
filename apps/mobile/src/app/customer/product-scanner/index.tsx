import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import { localize } from '@galaxy/shared';

const COLORS = {
  brand: '#7c3aed',
  white: '#ffffff',
  gray400: '#6b7280',
  gray900: '#111827',
  success: '#10b981',
};

interface ScannedProduct {
  nameJson?: { ar?: string; en?: string };
  name?: string;
}

export default function ProductScannerScreen(): JSX.Element {
  const { t, locale } = useLocale();
  const [barcode] = useState('');
  const [scanned, setScanned] = useState(false);
  const result = trpc.productScanner.lookup.useQuery(
    { barcode },
    { enabled: scanned && barcode.length > 0 },
  ) ?? { data: null, isLoading: false, isError: false, refetch: () => {} };
  const product = result.data as ScannedProduct | null;

  return (
    <ScreenState
      isLoading={scanned && result.isLoading}
      isError={scanned && result.isError}
      isEmpty={false}
      errorMessage={t('mobile.productScanner.not-found')}
      onRetry={() => result.refetch()}
    >
      <Text style={styles.title}>{t('mobile.productScanner.title')}</Text>
      <TouchableOpacity
        style={styles.scanBtn}
        onPress={() => {
          setScanned(true);
        }}
      >
        <Text style={styles.scanText}>{t('mobile.productScanner.scan')}</Text>
      </TouchableOpacity>
      {product ? (
        <View style={styles.result}>
          <Text style={styles.productName}>
            {product?.nameJson ? localize(product.nameJson, locale) : (product?.name ?? '')}
          </Text>
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
  scanBtn: {
    backgroundColor: COLORS.brand,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  scanText: { fontSize: 18, fontWeight: '700', color: COLORS.white },
  result: { backgroundColor: COLORS.white, borderRadius: 14, padding: 16, marginTop: 12 },
  productName: { fontSize: 16, fontWeight: '700', color: COLORS.gray900 },
});
