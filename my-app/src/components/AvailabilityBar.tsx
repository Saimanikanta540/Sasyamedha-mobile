import { Text, View } from 'react-native';

import { colors } from '@/theme/tokens';

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
      <View className="h-2.5 overflow-hidden rounded-full bg-surface-muted">
        <View
          className="h-full rounded-full"
          style={{ width: `${Math.max(pct, 4)}%`, backgroundColor: color }}
        />
      </View>
      <Text className="mt-1 font-sans-bold text-xs" style={{ color }}>
        {label}
      </Text>
    </View>
  );
}
