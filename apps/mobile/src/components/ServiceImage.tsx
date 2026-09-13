import { useState } from 'react';
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
}

export function ServiceImage({
  src,
  service,
  alt = '',
  style,
  height = 160,
}: ServiceImageProps): JSX.Element {
  const [failed, setFailed] = useState(false);
  const imageSrc = src ?? getServiceImage(service);

  if (failed || !imageSrc) {
    const letter = alt?.[0] ?? service?.[0]?.toUpperCase() ?? '';
    return (
      <View
        testID="service-image-fallback"
        accessibilityLabel={alt || service || 'Beauty service'}
        style={[styles.fallback, { height }, style]}
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
      style={[{ height }, style]}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fbcfe8',
    borderRadius: 12,
  },
  letter: {
    fontSize: 28,
    fontWeight: '800',
    color: '#db2777',
  },
});
