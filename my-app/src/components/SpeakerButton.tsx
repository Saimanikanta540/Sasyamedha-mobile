import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity } from 'react-native';

import { useSpeak } from '@/lib/speech/tts';

interface SpeakerButtonProps {
  text: string;
  compact?: boolean;
}

/** Present on every result screen — a primary interaction path, not an accessibility extra. */
export function SpeakerButton({ text, compact }: SpeakerButtonProps) {
  const { t } = useTranslation();
  const { speak, stop, isSpeaking } = useSpeak();
  const label = isSpeaking ? t('common.stop') : t('common.listen');

  return (
    <TouchableOpacity
      className={`min-h-[44px] flex-row items-center gap-1.5 rounded-full ${
        compact ? 'min-w-[44px] justify-center px-3' : 'px-4 py-2.5'
      } ${isSpeaking ? 'bg-brand-accent' : 'bg-surface-muted'}`}
      onPress={() => (isSpeaking ? stop() : speak(text))}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text className="text-lg">{isSpeaking ? '⏹' : '🔊'}</Text>
      {!compact && (
        <Text className={`text-sm font-sans-bold ${isSpeaking ? 'text-white' : 'text-ink-primary'}`}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}
