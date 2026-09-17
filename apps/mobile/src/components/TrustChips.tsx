import { View, Text, StyleSheet } from 'react-native';
import { Icon } from '@/components/Icon';

interface TrustChipsProps {
  /** Pre-filtered venue lists pass this to render the verified chip unconditionally */
  verifiedLabel?: string;
  rating?: number | null;
  reviews?: number | null;
  womenOnly?: boolean;
  womenOnlyLabel?: string;
  privateSuite?: boolean;
  privateSuiteLabel?: string;
  /** K3 (kids plan, W9) — child-friendly corner flag. */
  childFriendly?: boolean;
  childFriendlyLabel?: string;
}

/**
 * Venue trust row — mirrors the web TrustBadges (Phase 3 sprint 1) on RN.
 * Verified + rating + women-only/private-suite chips; labels come from the
 * i18n catalog — the component holds no copy.
 */
export function TrustChips({
  verifiedLabel,
  rating,
  reviews,
  womenOnly,
  womenOnlyLabel,
  privateSuite,
  privateSuiteLabel,
  childFriendly,
  childFriendlyLabel,
}: TrustChipsProps) {
  const showRating = typeof rating === 'number' && rating > 0;
  return (
    <View style={styles.row}>
      {verifiedLabel ? (
        <View style={[styles.chip, styles.chipGreen]}>
          <Icon name="shield-check" size={11} color="#047857" />
          <Text style={[styles.text, styles.textGreen]}>{verifiedLabel}</Text>
        </View>
      ) : null}
      {showRating ? (
        <View style={[styles.chip, styles.chipAmber]}>
          <Icon name="star" size={11} color="#b45309" />
          <Text style={[styles.text, styles.textAmber]}>
            {rating?.toFixed(1)}
            {typeof reviews === 'number' ? ` (${reviews})` : ''}
          </Text>
        </View>
      ) : null}
      {womenOnly && womenOnlyLabel ? (
        <View style={[styles.chip, styles.chipPink]}>
          <Icon name="users" size={11} color="#9d174d" />
          <Text style={[styles.text, styles.textPink]}>{womenOnlyLabel}</Text>
        </View>
      ) : null}
      {privateSuite && privateSuiteLabel ? (
        <View style={[styles.chip, styles.chipPink]}>
          <Icon name="lock" size={11} color="#9d174d" />
          <Text style={[styles.text, styles.textPink]}>{privateSuiteLabel}</Text>
        </View>
      ) : null}
      {childFriendly && childFriendlyLabel ? (
        <View style={[styles.chip, styles.chipAmber]}>
          <Icon name="happy" size={11} color="#b45309" />
          <Text style={[styles.text, styles.textAmber]}>{childFriendlyLabel}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  chipGreen: { backgroundColor: '#d1fae5' },
  chipAmber: { backgroundColor: '#fef3c7' },
  chipPink: { backgroundColor: '#fce7f3' },
  text: { fontSize: 11, fontWeight: '600' },
  textGreen: { color: '#047857' },
  textAmber: { color: '#b45309' },
  textPink: { color: '#9d174d' },
});
