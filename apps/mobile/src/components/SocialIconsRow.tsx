import type { JSX } from 'react';
import { View, Text, Pressable, Linking, StyleSheet } from 'react-native';

/**
 * B6 — social presence icons (mobile). Letter badges in each network's
 * brand color; only networks with a URL render. Mirrors the web
 * SocialIcons component.
 */
const NETWORKS = [
  { key: 'snapchat', letter: 'S', bg: '#FFFC00', fg: '#000000' },
  { key: 'tiktok', letter: 'T', bg: '#0f0f0f', fg: '#ffffff' },
  { key: 'x', letter: 'X', bg: '#0f0f0f', fg: '#ffffff' },
  { key: 'instagram', letter: 'I', bg: '#E4405F', fg: '#ffffff' },
  { key: 'facebook', letter: 'F', bg: '#1877F2', fg: '#ffffff' },
] as const;

export function SocialIconsRow({
  links,
}: {
  links?: Record<string, string> | null;
}): JSX.Element | null {
  const rows = NETWORKS.filter((n) => (links?.[n.key] ?? '') !== '');
  if (rows.length === 0) return null;

  return (
    <View style={styles.row}>
      {rows.map((n) => (
        <Pressable
          key={n.key}
          accessibilityLabel={n.key}
          testID={`social-icon-${n.key}`}
          onPress={() => {
            const url = links?.[n.key];
            if (url) {
              void Linking.openURL(url).catch(() => {});
            }
          }}
          style={[styles.badge, { backgroundColor: n.bg }]}
        >
          <Text style={[styles.letter, { color: n.fg }]}>{n.letter}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: { fontSize: 13, fontWeight: '800' },
});
