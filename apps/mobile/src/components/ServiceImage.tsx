import { useState } from 'react';
import type { JSX } from 'react';
import { Image, View, Text, StyleSheet, type ImageStyle, type StyleProp } from 'react-native';
import { getServiceImage } from '@galaxy/shared';

/**
 * RN mirror of @galaxy/ui ServiceImage — real imagery with graceful fallback.
 * `src` wins when present; otherwise the shared registry resolves `service`.
 * On load failure renders the letter tile (same contract as the web component).
 */
interface ServiceImageProps {
  src?: string | null;
  service?: string;
  alt?: string;
  style?: StyleProp<ImageStyle>;
  height?: number;
  /** Square width — defaults to `height` when omitted. */
  width?: number;
  /** Corner radius in px — defaults to 12. */
  borderRadius?: number;
}

export function ServiceImage({
  src,
  service,
  alt = '',
  style,
  height = 160,
  width,
  borderRadius = 12,
}: ServiceImageProps): JSX.Element {
  const [failed, setFailed] = useState(false);
  const imageSrc = src ?? getServiceImage(service);
  const w = width ?? height;

  if (failed || !imageSrc) {
    const letter = alt?.[0] ?? service?.[0]?.toUpperCase() ?? '';
    return (
      <View
        testID="service-image-fallback"
        accessibilityLabel={alt || service || 'Beauty service'}
        style={[styles.fallback, { height, width: w, borderRadius }, style]}
      >
        <Text style={styles.letter}>{letter}</Text>
      </View>
    );
  }

  return (
    <Image
      testID="service-image"
      source={{ uri: imageSrc }}
      accessibilityLabel={alt || service || 'Beauty service'}
      onError={() => setFailed(true)}
      resizeMode="cover"
      style={[{ height, width: w, borderRadius }, style]}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fbcfe8',
  },
  letter: {
    fontSize: 28,
    fontWeight: '800',
    color: '#db2777',
  },
});
