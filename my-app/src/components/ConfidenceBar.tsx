import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { colors, confidenceBand, fontSize, radii, spacing } from '@/theme/tokens';

/** A banded bar with a word label — never a raw confidence number alone (brief §4.3). */
export function ConfidenceBar({ confidence }: { confidence: number }) {
  const { t } = useTranslation();
  const { level, color } = confidenceBand(confidence);
  const pct = Math.round(confidence * 100);
  const labelKey =
    level === 'high' ? 'diagnose.confidenceHigh' : level === 'medium' ? 'diagnose.confidenceMedium' : 'diagnose.confidenceLow';

  return (
    <View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.max(pct, 6)}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.label, { color }]}>
        {t(labelKey)} · {pct}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 14,
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
    fontSize: fontSize.sm,
  },
});
