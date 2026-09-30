import type { JSX } from 'react';
import { useRef, useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Share } from 'react-native';
import { WebView as RNWebView, type WebViewMessageEvent } from 'react-native-webview';
import type React from 'react';

// react-native-webview's JSX types are mangled under RN 0.86 + React 19
// (the component resolves to (props: never)); pin a local prop contract.
const WebView = RNWebView as unknown as React.ComponentType<{
  ref?: React.Ref<{ postMessage(msg: string): void } | null>;
  source: { html: string };
  originWhitelist: string[];
  allowsInlineMediaPlayback: boolean;
  mediaPlaybackRequiresUserAction: boolean;
  javaScriptEnabled: boolean;
  domStorageEnabled: boolean;
  onMessage: (e: WebViewMessageEvent) => void;
  style: object;
}>;
import { useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import { SkeletonList } from '@/components/SkeletonCard';
import { TRYON_HTML } from '@/lib/tryonHtml';

interface TryOnColor {
  id?: string;
  hex?: string;
  nameAr?: string;
}

const TYPES = [
  { key: 'lips', labelKey: 'mobile.virtualTryOn.type.lips' },
  { key: 'eyes', labelKey: 'mobile.virtualTryOn.type.eyes' },
  { key: 'blush', labelKey: 'mobile.virtualTryOn.type.blush' },
  { key: 'nails', labelKey: 'mobile.virtualTryOn.type.nails' },
] as const;

export default function VirtualTryOnScreen(): JSX.Element {
  const { t } = useLocale();
  const router = useRouter();
  const webRef = useRef<{ postMessage(msg: string): void } | null>(null);
  const [perm, requestPerm] = useCameraPermissions();
  const [makeupType, setMakeupType] = useState<string>('lips');
  const [color, setColor] = useState<string>('#D4737C');
  const [intensity, setIntensity] = useState(0.7);
  const [captured, setCaptured] = useState<string | null>(null);

  const palettesQ = trpc.virtualTryOn.palettes.useQuery();
  const colors = (palettesQ.data?.[makeupType as keyof typeof palettesQ.data] ?? []) as
    TryOnColor[] | undefined;

  // Ask for camera permission on mount (the WebView stream needs it).
  useEffect(() => {
    if (!perm) requestPerm();
  }, [perm, requestPerm]);

  const post = useCallback((payload: Record<string, unknown>) => {
    webRef.current?.postMessage(JSON.stringify(payload));
  }, []);

  // Push look changes into the engine.
  useEffect(() => {
    post({ cmd: 'update', type: makeupType, color, intensity });
  }, [makeupType, color, intensity, post]);

  const handleCapture = useCallback(() => {
    post({ cmd: 'capture' });
  }, [post]);

  const onMessage = useCallback((e: WebViewMessageEvent) => {
    try {
      const d = JSON.parse(e.nativeEvent.data) as { cmd?: string; dataUrl?: string };
      if (d.cmd === 'captured' && d.dataUrl) setCaptured(d.dataUrl);
    } catch {
      /* ignore non-JSON messages */
    }
  }, []);

  const shareLook = useCallback(() => {
    const msg = `${t('mobile.virtualTryOn.shareText')}🔗 galaxyofbeauty.sa`;
    void Share.share({ message: captured ? `${msg}` : msg });
  }, [t, captured]);

  const bookThisLook = useCallback(() => {
    router.push({
      pathname: '/customer/bookings/create',
      params: { look: JSON.stringify({ type: makeupType, colorHex: color }) },
    });
  }, [router, makeupType, color]);

  return (
    <View style={styles.root}>
      <View style={styles.stage}>
        {perm && !perm.granted ? (
          <View style={styles.denied}>
            <Text style={styles.deniedText}>{t('mobile.virtualTryOn.cameraDenied')}</Text>
            <TouchableOpacity style={styles.deniedBtn} onPress={() => requestPerm()}>
              <Text style={styles.deniedBtnText}>{t('mobile.virtualTryOn.retry')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <WebView
            ref={webRef}
            source={{ html: TRYON_HTML }}
            originWhitelist={['*']}
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled
            domStorageEnabled
            onMessage={onMessage}
            style={styles.webview}
          />
        )}
      </View>

      {palettesQ.isLoading ? (
        <SkeletonList count={3} />
      ) : (
        <ScrollView style={styles.controls} contentContainerStyle={styles.controlsInner}>
          <View style={styles.typeRow}>
            {TYPES.map((tp) => (
              <TouchableOpacity
                key={tp.key}
                onPress={() => setMakeupType(tp.key)}
                style={[styles.chip, makeupType === tp.key && styles.chipActive]}
              >
                <Text style={[styles.chipText, makeupType === tp.key && styles.chipTextActive]}>
                  {t(tp.labelKey)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.swatchRow}>
            {(colors ?? []).map((c, i) => (
              <TouchableOpacity
                key={`${c.id ?? i}`}
                onPress={() => c.hex && setColor(c.hex)}
                style={[
                  styles.swatch,
                  { backgroundColor: c.hex ?? '#ccc' },
                  color === c.hex && styles.swatchActive,
                ]}
              />
            ))}
          </View>

          <Text style={styles.intensityLabel}>
            {t('mobile.virtualTryOn.intensity')}: {Math.round(intensity * 100)}%
          </Text>
          <View style={styles.intensityRow}>
            <TouchableOpacity onPress={() => setIntensity((v) => Math.max(0.1, v - 0.1))}>
              <Text style={styles.intensityBtn}>−</Text>
            </TouchableOpacity>
            <View style={styles.intensityBar}>
              <View style={[styles.intensityFill, { width: `${intensity * 100}%` }]} />
            </View>
            <TouchableOpacity onPress={() => setIntensity((v) => Math.min(1, v + 0.1))}>
              <Text style={styles.intensityBtn}>+</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.captureBtn} onPress={handleCapture}>
            <Text style={styles.captureText}>{t('mobile.virtualTryOn.capture')}</Text>
          </TouchableOpacity>
          {captured && (
            <TouchableOpacity style={styles.shareBtn} onPress={shareLook}>
              <Text style={styles.shareText}>{t('mobile.virtualTryOn.share')}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.bookBtn} onPress={bookThisLook}>
            <Text style={styles.bookText}>{t('mobile.virtualTryOn.bookThisLook')}</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0d0d12' },
  stage: { flex: 2, backgroundColor: '#000' },
  webview: { flex: 1 },
  denied: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  deniedText: { color: '#fff', fontSize: 15, textAlign: 'center', marginBottom: 12 },
  deniedBtn: {
    backgroundColor: '#c2255c',
    borderRadius: 999,
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  deniedBtnText: { color: '#fff', fontWeight: '700' },
  controls: { flex: 1, backgroundColor: '#16161d' },
  controlsInner: { padding: 14, gap: 12 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: '#23232c',
  },
  chipActive: { backgroundColor: '#c2255c' },
  chipText: { color: '#9a9aa5', fontSize: 13 },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  swatchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  swatch: { width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: 'transparent' },
  swatchActive: { borderColor: '#fff' },
  intensityLabel: { color: '#e4e4ea', fontSize: 13 },
  intensityRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  intensityBtn: { color: '#fff', fontSize: 22, paddingHorizontal: 8 },
  intensityBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2a2a34',
    overflow: 'hidden',
  },
  intensityFill: { height: '100%', backgroundColor: '#c2255c' },
  captureBtn: {
    backgroundColor: '#c2255c',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  captureText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  shareBtn: {
    backgroundColor: '#23232c',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  shareText: { color: '#e4e4ea', fontSize: 14 },
  bookBtn: {
    backgroundColor: '#ffffff14',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  bookText: { color: '#c7a0ff', fontWeight: '600', fontSize: 14 },
});
