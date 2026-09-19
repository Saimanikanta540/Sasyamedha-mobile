import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useSpeak } from '@/lib/speech/tts';
import { colors, fontSize, radii, spacing } from '@/theme/tokens';

interface SpeakerButtonProps {
  text: string;
  compact?: boolean;
}

/** Present on every result screen — a primary interaction path, not an accessibility extra. */
export function SpeakerButton({ text, compact }: SpeakerButtonProps) {
  const { t } = useTranslation();
  const { speak, stop, isSpeaking } = useSpeak();

  return (
    <TouchableOpacity
      style={[styles.button, compact && styles.compact, isSpeaking && styles.buttonActive]}
      onPress={() => (isSpeaking ? stop() : speak(text))}
      accessibilityRole="button"
      accessibilityLabel={isSpeaking ? t('common.stop') : t('common.listen')}
    >
      <Text style={styles.icon}>{isSpeaking ? '⏹' : '🔊'}</Text>
      {!compact && (
        <Text style={[styles.label, isSpeaking && styles.labelActive]}>
          {isSpeaking ? t('common.stop') : t('common.listen')}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    minHeight: 44,
  },
  compact: {
    paddingHorizontal: spacing.sm,
    minWidth: 44,
    justifyContent: 'center',
  },
  buttonActive: {
    backgroundColor: colors.brandAccent,
  },
  icon: {
    fontSize: fontSize.lg,
  },
  label: {
    fontFamily: 'NotoSans_700Bold',
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  labelActive: {
    color: colors.textInverse,
  },
});
