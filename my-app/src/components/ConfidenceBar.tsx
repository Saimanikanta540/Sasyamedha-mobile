import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { confidenceBand } from '@/theme/tokens';

/** A banded bar with a word label — never a raw confidence number alone (brief §4.3). */
export function ConfidenceBar({ confidence }: { confidence: number }) {
  const { t } = useTranslation();
  const { level, color } = confidenceBand(confidence);
  const pct = Math.round(confidence * 100);
  const labelKey =
    level === 'high'
      ? 'diagnose.confidenceHigh'
      : level === 'medium'
        ? 'diagnose.confidenceMedium'
        : 'diagnose.confidenceLow';

  return (
    <View>
      <View className="h-3.5 overflow-hidden rounded-full bg-surface-muted">
        <View
          className="h-full rounded-full"
          style={{ width: `${Math.max(pct, 6)}%`, backgroundColor: color }}
        />
      </View>
      <Text className="mt-1 font-sans-bold text-sm" style={{ color }}>
        {t(labelKey)} · {pct}%
      </Text>
    </View>
  );
}
