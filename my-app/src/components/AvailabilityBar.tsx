import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, radii, spacing } from '@/theme/tokens';

interface AvailabilityBarProps {
  availableTonnes: number;
  capacityTonnes: number;
  label: string;
}

/** "40% free", never a bare tonnage figure (brief §4.9). Label text is
 * fully formatted by the caller so it can be translated correctly. */
export function AvailabilityBar({ availableTonnes, capacityTonnes, label }: AvailabilityBarProps) {
  const pct = capacityTonnes > 0 ? Math.round((availableTonnes / capacityTonnes) * 100) : 0;
  const color = pct >= 40 ? colors.success : pct >= 15 ? colors.warning : colors.danger;

  return (
    <View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.max(pct, 4)}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radii.pill,
  },
  label: {
    marginTop: spacing.xs,
    fontFamily: 'NotoSans_700Bold',
    fontSize: fontSize.xs,
  },
});
